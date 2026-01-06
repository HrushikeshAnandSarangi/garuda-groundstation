"use client";

import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSocket } from "@/hooks/useSocket";
import { useConnectionStore } from "@/stores/connectionStore";

export default function SettingsPage() {
  const [peerIdInput, setPeerIdInput] = useState("groundstation");
  const [activePeerId, setActivePeerId] = useState("");

  // MAVProxy state
  const [comPort, setComPort] = useState("COM18");
  const [udpPort, setUdpPort] = useState(14550);
  const [mavproxyStatus, setMavproxyStatus] = useState<
    "idle" | "starting" | "started" | "error"
  >("idle");

  useSocket(activePeerId);

  const { connected, selfId, peers } = useConnectionStore();

  /**
   * Start MAVProxy + UDP listener
   * (Tauri v2 requires camelCase args)
   */
  const startMavproxy = useCallback(async () => {
    if (mavproxyStatus !== "idle") return;

    try {
      setMavproxyStatus("starting");

      // 1️⃣ Start MAVProxy (COM → UDP)
      await invoke("start_mavproxy", {
        comPort,
        udpPort,
      });

      // 2️⃣ Start UDP listener (UDP → Rust → UI)
      await invoke("start_udp_listener", {
        port: udpPort,
      });

      setMavproxyStatus("started");
    } catch (err) {
      console.error("Failed to start MAVProxy:", err);
      setMavproxyStatus("error");
    }
  }, [mavproxyStatus, comPort, udpPort]);

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>Connection Settings</h2>

      <p>
        Status:{" "}
        <strong style={{ color: connected ? "green" : "red" }}>
          {connected ? "Connected" : "Disconnected"}
        </strong>
      </p>

      {/* ---------------- Peer ID ---------------- */}
      <label>Peer ID</label>
      <input
        value={peerIdInput}
        onChange={(e) => setPeerIdInput(e.target.value)}
        disabled={!!selfId}
        style={{
          display: "block",
          marginTop: 4,
          padding: 6,
          width: "100%",
        }}
      />

      <button
        onClick={() => setActivePeerId(peerIdInput)}
        disabled={!!selfId}
        style={{ marginTop: 10 }}
      >
        Register
      </button>

      <p style={{ marginTop: 16 }}>
        Registered:{" "}
        <strong style={{ color: selfId ? "green" : "gray" }}>
          {selfId ? "Yes" : "No"}
        </strong>
      </p>

      <h3>Other Connected Devices</h3>
      <ul>
        {peers.length === 0 && <li>No peers connected</li>}
        {peers.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>

      {/* ================= MAVPROXY ================= */}

      <hr style={{ margin: "24px 0" }} />
      <h3>MAVProxy</h3>

      <label>COM Port</label>
      <input
        value={comPort}
        onChange={(e) => setComPort(e.target.value)}
        disabled={mavproxyStatus === "started"}
        style={{
          display: "block",
          marginTop: 4,
          padding: 6,
          width: "100%",
        }}
      />

      <label style={{ marginTop: 10, display: "block" }}>UDP Port</label>
      <input
        type="number"
        value={udpPort}
        onChange={(e) => setUdpPort(Number(e.target.value))}
        disabled={mavproxyStatus === "started"}
        style={{
          display: "block",
          marginTop: 4,
          padding: 6,
          width: "100%",
        }}
      />

      <button
        onClick={startMavproxy}
        disabled={mavproxyStatus !== "idle"}
        style={{ marginTop: 12 }}
      >
        {mavproxyStatus === "starting"
          ? "Starting..."
          : mavproxyStatus === "started"
          ? "MAVProxy Running"
          : "Start MAVProxy"}
      </button>

      <p style={{ marginTop: 8 }}>
        Status:{" "}
        <strong
          style={{
            color:
              mavproxyStatus === "started"
                ? "green"
                : mavproxyStatus === "error"
                ? "red"
                : "gray",
          }}
        >
          {mavproxyStatus}
        </strong>
      </p>
    </div>
  );
}
