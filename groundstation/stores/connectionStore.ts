import { create } from "zustand";

type ConnectionStore = {
  connected: boolean;
  selfId: string | null;
  peers: string[];

  setConnected: (value: boolean) => void;
  setSelfId: (id: string | null) => void;
  setPeers: (peers: string[]) => void;
};

export const useConnectionStore = create<ConnectionStore>((set) => ({
  connected: false,
  selfId: null,
  peers: [],

  setConnected: (value) => set({ connected: value }),
  setSelfId: (id) => set({ selfId: id }),
  setPeers: (peers) => set({ peers }),
}));
