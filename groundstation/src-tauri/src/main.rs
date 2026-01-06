#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod telemetry;
use std::io::{self, BufRead, Cursor, Read};
use std::net::UdpSocket;
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager, Window};

use telemetry::Telemetry;

use mavlink::{
    common::{
        ATTITUDE_DATA,
        GLOBAL_POSITION_INT_DATA,
        GPS_RAW_INT_DATA,
        SYS_STATUS_DATA,
        VFR_HUD_DATA,
        MavMessage,
    },
    peek_reader::PeekReader,
    read_v2_msg,
};

static UDP_LISTENER_RUNNING: AtomicBool = AtomicBool::new(false);

#[tauri::command]
fn start_mavproxy(app: AppHandle, com_port: String, udp_port: u16) -> Result<(), String> {
    println!("start_mavproxy called: {} {}", com_port, udp_port);
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let log_dir = data_dir.join("mavlogs");
    std::fs::create_dir_all(&log_dir).map_err(|e| e.to_string())?;

    let log_file = log_dir.join("mav.tlog").to_string_lossy().into_owned();

    let mut child = Command::new("mavproxy.exe")
        .args([
            format!("--master={}", com_port),
            "--baudrate=57600".to_string(),
            format!("--out=udp:127.0.0.1:{}", udp_port),
            format!("--logfile={}", log_file),
        ])
        .stdout(Stdio::inherit())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    thread::sleep(Duration::from_secs(1));

    if let Ok(Some(status)) = child.try_wait() {
        if !status.success() {
            let mut stderr_output = String::new();
            if let Some(mut stderr) = child.stderr.take() {
                stderr.read_to_string(&mut stderr_output).unwrap_or_default();
            }
            return Err(format!(
                "MAVProxy failed to start: exit code {:?}\nStderr: {}",
                status.code(),
                stderr_output
            ));
        }
    }

    Ok(())
}

#[tauri::command]
async fn get_log_path(app: AppHandle) -> Result<String, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let log_dir = data_dir.join("mavlogs");
    let log_file = log_dir.join("mav.tlog").to_string_lossy().into_owned();
    Ok(log_file)
}

#[tauri::command]
fn start_udp_listener(window: Window, port: u16) {
    println!("UDP Listener starts");
    if UDP_LISTENER_RUNNING.swap(true, Ordering::SeqCst) {
        let _ = window.emit(
            "internal_log",
            format!("UDP listener already running on port {}", port),
        );
        return;
    }

    thread::spawn(move || {
        let socket = match UdpSocket::bind(("127.0.0.1", port)) {
            Ok(s) => s,
            Err(e) => {
                let _ = window.emit(
                    "internal_log",
                    format!("Failed to bind UDP port {}: {}", port, e),
                );
                UDP_LISTENER_RUNNING.store(false, Ordering::SeqCst);
                return;
            }
        };

        let mut buf = [0u8; 2048];
        let mut telemetry = Telemetry::default();

        loop {
            let (len, _) = match socket.recv_from(&mut buf) {
                Ok(v) => v,
                Err(_) => continue,
            };

            let cursor = Cursor::new(&buf[..len]);
            let mut reader = PeekReader::new(cursor);

            while let Ok((_header, msg)) = read_v2_msg(&mut reader) {
                match msg {
                    MavMessage::SYS_STATUS(SYS_STATUS_DATA {
                        battery_remaining,
                        ..
                    }) => {
                        telemetry.battery = Some(battery_remaining as f32);
                    }

                    MavMessage::GLOBAL_POSITION_INT(GLOBAL_POSITION_INT_DATA {
                        lat,
                        lon,
                        relative_alt,
                        ..
                    }) => {
                        telemetry.latitude = Some(lat as f64 / 1e7);
                        telemetry.longitude = Some(lon as f64 / 1e7);
                        telemetry.altitude = Some(relative_alt as f32 / 1000.0);
                    }

                    MavMessage::GPS_RAW_INT(GPS_RAW_INT_DATA {
                        satellites_visible,
                        ..
                    }) => {
                        telemetry.satellites = Some(satellites_visible);
                    }

                    MavMessage::VFR_HUD(VFR_HUD_DATA {
                        groundspeed,
                        heading,
                        ..
                    }) => {
                        telemetry.speed = Some(groundspeed);
                        telemetry.heading = Some(heading as f32);
                    }

                    MavMessage::ATTITUDE(ATTITUDE_DATA { roll, pitch, .. }) => {
                        telemetry.roll = Some(roll.to_degrees());
                        telemetry.pitch = Some(pitch.to_degrees());
                    }

                    _ => {}
                }
            }

            if telemetry.altitude.is_some() {
                let _ = window.emit("telemetry", telemetry.clone());
            }
        }
    });
}

#[tauri::command]
fn start_video_drone(window: Window) {
    thread::spawn(move || {
        println!("Starting video stream connection...");
        let _ = window.emit("video-status", "connecting");

        // Check if FFmpeg supports SRT
        let supports_srt = Command::new("ffmpeg")
            .arg("-protocols")
            .output()
            .map(|output| {
                let protocols = String::from_utf8_lossy(&output.stdout);
                protocols.contains("srt")
            })
            .unwrap_or(false);

        let width = 1280;
        let height = 720;
        let fps = 15;

        let mut args: Vec<String> = vec![
            "-loglevel".to_string(),
            "warning".to_string(),
            "-hwaccel".to_string(),
            "auto".to_string(),
        ];

        if supports_srt {
            args.extend_from_slice(&[
                "-i".to_string(),
                "srt://20.193.155.103:9001?mode=caller&latency=300000&connect_timeout=5000&timeout=5000000".to_string(),
            ]);
        } else {
            println!("WARNING: SRT not supported in FFmpeg, using test pattern");
            let _ = window.emit("video-status", "SRT not supported, using test pattern");
            args.extend_from_slice(&[
                "-f".to_string(),
                "lavfi".to_string(),
                "-i".to_string(),
                format!("smptebars=size={}x{}:rate={}", width, height, fps),
            ]);
        }

        args.extend_from_slice(&[
            "-vf".to_string(),
            format!("fps={},scale={}:{},format=rgba", fps, width, height),
            "-f".to_string(),
            "rawvideo".to_string(),
            "-pix_fmt".to_string(),
            "rgba".to_string(),
            "-s".to_string(),
            format!("{}x{}", width, height),
            "-".to_string(),
        ]);

        let mut child = match Command::new("ffmpeg")
            .args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn() {
                Ok(c) => c,
                Err(e) => {
                    let error_msg = format!("Failed to spawn FFmpeg: {}", e);
                    println!("{}", error_msg);
                    let _ = window.emit("video-status", error_msg);
                    return;
                }
            };

        let mut stdout = child.stdout.take().expect("Failed to open stdout");
        let stderr = child.stderr.take().expect("Failed to open stderr");

        // Spawn thread to handle stderr
        let window_clone_err = window.clone();
        let _stderr_handle = thread::spawn(move || {
            let reader = io::BufReader::new(stderr);
            for line in reader.lines() {
                match line {
                    Ok(line) if !line.is_empty() => {
                        println!("FFmpeg: {}", line);
                        let _ = window_clone_err.emit("video-status", line);
                    }
                    _ => {}
                }
            }
        });

        let frame_size: usize = width * height * 4; // width * height * 4 (RGBA)
        let mut buffer = vec![0u8; frame_size];
        let mut frame_count = 0u32;

        loop {
            match stdout.read_exact(&mut buffer) {
                Ok(_) => {
                    frame_count += 1;
                    if frame_count == 1 {
                        println!("First frame received!");
                        let _ = window.emit("video-status", "connected");
                    }
                    if frame_count % 30 == 0 {
                        println!("Received {} frames", frame_count);
                    }
                    let _ = window.emit("video-frame", buffer.clone());
                }
                Err(e) if e.kind() == io::ErrorKind::UnexpectedEof => {
                    println!("End of stream");
                    let _ = window.emit("video-status", "Stream ended");
                    break;
                }
                Err(e) => {
                    let error_msg = format!("Error reading frame: {}", e);
                    println!("{}", error_msg);
                    let _ = window.emit("video-status", error_msg);
                    break;
                }
            }
        }

        let _ = child.kill();
        println!("Shutting down FFmpeg...");
    });
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_mavproxy,
            start_udp_listener,
            get_log_path,
            start_video_drone
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}