"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useConnectionStore } from "@/stores/connectionStore";

export default function SettingsPage() {
  const [peerIdInput, setPeerIdInput] = useState("groundstation");
  const [activePeerId, setActivePeerId] = useState("");

  useSocket(activePeerId);

  const { connected, selfId, peers } = useConnectionStore();

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>Connection Settings</h2>

      <p>
        Status:{" "}
        <strong style={{ color: connected ? "green" : "red" }}>
          {connected ? "Connected" : "Disconnected"}
        </strong>
      </p>

      <label>Peer ID</label>
      <input
        value={peerIdInput}
        onChange={(e) => setPeerIdInput(e.target.value)}
        disabled={!!selfId}
        style={{ display: "block", marginTop: 4, padding: 6, width: "100%" }}
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
    </div>
  );
}
