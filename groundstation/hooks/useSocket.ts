import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { handleSignal } from "@/lib/webrtc";

export function useSocket(peerId: string) {
  useEffect(() => {
    const socket = getSocket();

    socket.connect();

    socket.on("connect", () => {
      socket.emit("register", peerId);
    });

    socket.on("registered", (id) => {
      console.log("Registered as:", id);
    });

    socket.on("signal", (data) => {
      handleSignal(data, socket);
    });

    return () => {
      socket.off("signal");
      socket.disconnect();
    };
  }, [peerId]);
}
