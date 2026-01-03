// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;

#[derive(serde::Serialize)]
struct SystemStats{
  memory_used:u64,
  memory_total:u64,
  cpu_cores:usize,
  hostname:String,
}

#[command]
fn get_system_stats()->SystemStats{

  SystemStats{
    memory_used: 16000,
    memory_total: 32000,
    cpu_cores:4,
    hostname: "hrushi".to_string(),
  }
}



fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_system_stats])
    .run(tauri::generate_context!())
    .expect("error while running tauri application")
}
