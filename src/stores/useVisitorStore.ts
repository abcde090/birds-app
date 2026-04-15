import { create } from "zustand";
import type { BirdVisit, BirdBehavior, SessionStats } from "../types/station";
import type { InteractionEvent } from "../lib/interaction-engine";

interface VisitorStore {
  readonly visitors: readonly BirdVisit[];
  readonly behaviors: readonly BirdBehavior[];
  readonly events: readonly InteractionEvent[];
  readonly sessionSpecies: readonly string[];
  readonly newDiscoveries: readonly string[];
  readonly isLoading: boolean;

  setVisitors: (visitors: readonly BirdVisit[]) => void;
  setEvents: (events: readonly InteractionEvent[]) => void;
  setBehaviors: (behaviors: readonly BirdBehavior[]) => void;
  fetchBehaviors: () => Promise<void>;
  recordDiscovery: (birdId: string) => void;
  addSessionSpecies: (birdId: string) => void;
  resetSession: () => void;
  getSessionStats: (phasesPlayed: number, itemsPlaced: number) => SessionStats;
}

export const useVisitorStore = create<VisitorStore>((set, get) => ({
  visitors: [],
  behaviors: [],
  events: [],
  sessionSpecies: [],
  newDiscoveries: [],
  isLoading: false,

  setVisitors: (visitors) => set({ visitors }),
  setEvents: (events) => set({ events }),
  setBehaviors: (behaviors) => set({ behaviors }),

  fetchBehaviors: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/data/bird-behaviors.json");
      const data: Record<
        string,
        Omit<BirdBehavior, "id">
      > = await response.json();
      const behaviors: BirdBehavior[] = Object.entries(data).map(
        ([id, behavior]) => ({
          id,
          ...behavior,
        }),
      );
      set({ behaviors, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  recordDiscovery: (birdId) => {
    const state = get();
    if (state.newDiscoveries.includes(birdId)) return;
    set({
      newDiscoveries: [...state.newDiscoveries, birdId],
    });
  },

  addSessionSpecies: (birdId) => {
    const state = get();
    if (state.sessionSpecies.includes(birdId)) return;
    set({
      sessionSpecies: [...state.sessionSpecies, birdId],
    });
  },

  resetSession: () =>
    set({
      visitors: [],
      events: [],
      sessionSpecies: [],
      newDiscoveries: [],
    }),

  getSessionStats: (phasesPlayed, itemsPlaced) => {
    const state = get();
    return {
      speciesSeen: state.sessionSpecies,
      newDiscoveries: state.newDiscoveries,
      totalVisitors: state.sessionSpecies.length,
      phasesPlayed,
      itemsPlaced,
    };
  },
}));
