// lib/webrtc.ts
import { Socket } from "socket.io-client";

let pc: RTCPeerConnection | null = null;

export function handleSignal(
  data: {
    from: string;
    type: "offer" | "answer" | "ice-candidate";
    payload: any;
  },
  socket: Socket
) {
  const { from, type, payload } = data;

  if (!pc) {
    pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", {
          to: from,
          type: "ice-candidate",
          payload: event.candidate,
        });
      }
    };
  }

  if (type === "offer") {
    pc.setRemoteDescription(payload);
    pc.createAnswer().then((answer) => {
      pc!.setLocalDescription(answer);
      socket.emit("signal", {
        to: from,
        type: "answer",
        payload: answer,
      });
    });
  }

  if (type === "answer") {
    pc.setRemoteDescription(payload);
  }

  if (type === "ice-candidate") {
    pc.addIceCandidate(payload);
  }
}
