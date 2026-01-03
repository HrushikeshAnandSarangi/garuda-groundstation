// signaling-server.js
// Node.js Signaling Server for WebRTC using Socket.IO
// Handles peer registration with IDs like "groundstation", "drone1", "drone2"
// Relays signaling messages (offer, answer, ice-candidate) between peers
// Supports multiple data transfers via WebRTC (e.g., camera feed as video track, telemetry/GPS via data channels)
// Run with: node signaling-server.js
// Requires: npm install express socket.io
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // restrict in production
    methods: ["GET", "POST"],
  },
});

// peerId -> socket
const peers = new Map();

/**
 * Broadcast current peer list to all connected clients
 */
function broadcastPeers() {
  const peerList = Array.from(peers.keys());
  io.emit("peers-update", peerList);
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  /**
   * Register a peer with a unique peerId
   */
  socket.on("register", (peerId) => {
    if (!peerId || typeof peerId !== "string") {
      socket.emit("error", "Invalid peerId");
      return;
    }

    if (peers.has(peerId)) {
      socket.emit("error", "Peer ID already taken");
      return;
    }

    peers.set(peerId, socket);
    socket.peerId = peerId;

    console.log(`Peer registered: ${peerId}`);
    socket.emit("registered", peerId);

    broadcastPeers();
  });

  /**
   * Relay WebRTC signaling messages
   */
  socket.on("signal", (data) => {
    if (!socket.peerId) {
      socket.emit("error", "Peer not registered");
      return;
    }

    const { to, type, payload } = data || {};

    if (!to || !type || !payload) {
      socket.emit("error", "Invalid signal payload");
      return;
    }

    const targetSocket = peers.get(to);
    if (!targetSocket) {
      socket.emit("error", `Peer ${to} not found`);
      return;
    }

    targetSocket.emit("signal", {
      from: socket.peerId,
      type,
      payload,
    });

    console.log(`Signal '${type}' from ${socket.peerId} → ${to}`);
  });

  /**
   * Handle disconnect
   */
  socket.on("disconnect", () => {
    if (socket.peerId) {
      peers.delete(socket.peerId);
      console.log(`Peer disconnected: ${socket.peerId}`);
      broadcastPeers();
    }
  });
});

/**
 * Health check endpoint
 */
app.get("/", (req, res) => {
  res.send("WebRTC Signaling Server is running");
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Signaling server listening on port ${PORT}`);
});
