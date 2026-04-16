import { create } from "zustand";
import type {
  PlacedItem,
  StationScreen,
  GridPosition,
  StationItemType,
} from "../types/station";
import { GRID_ROWS, GRID_COLS, SESSION_BUDGET } from "../lib/station-config";

interface StationStore {
  readonly screen: StationScreen;
  readonly placedItems: readonly PlacedItem[];
  readonly budget: number;
  readonly sessionNumber: number;

  setScreen: (screen: StationScreen) => void;
  placeItem: (type: StationItemType, position: GridPosition) => void;
  removeItem: (itemId: string) => void;
  moveItem: (itemId: string, newPosition: GridPosition) => void;
  endSession: () => void;
  startNewSession: () => void;
  isValidPlacement: (position: GridPosition) => boolean;
}

function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const loadSessionNumber = (): number => {
  const stored = localStorage.getItem("bird-station-sessions");
  return stored ? parseInt(stored, 10) : 0;
};

export const useStationStore = create<StationStore>((set, get) => ({
  screen: "station-title",
  placedItems: [],
  budget: SESSION_BUDGET,
  sessionNumber: loadSessionNumber(),

  setScreen: (screen) => set({ screen }),

  placeItem: (type, position) => {
    const state = get();
    if (state.budget <= 0) return;
    if (!state.isValidPlacement(position)) return;

    const newItem: PlacedItem = {
      id: generateItemId(),
      type,
      position,
    };
    set({
      placedItems: [...state.placedItems, newItem],
      budget: state.budget - 1,
    });
  },

  removeItem: (itemId) => {
    const state = get();
    const item = state.placedItems.find((i) => i.id === itemId);
    if (!item) return;
    set({
      placedItems: state.placedItems.filter((i) => i.id !== itemId),
      budget: state.budget + 1,
    });
  },

  moveItem: (itemId, newPosition) => {
    const state = get();
    if (!state.isValidPlacement(newPosition)) return;

    set({
      placedItems: state.placedItems.map((item) =>
        item.id === itemId ? { ...item, position: newPosition } : item,
      ),
    });
  },

  endSession: () => {
    set({ screen: "station-summary" });
  },

  startNewSession: () => {
    const newCount = get().sessionNumber + 1;
    localStorage.setItem("bird-station-sessions", String(newCount));
    set({
      screen: "station-playing",
      placedItems: [],
      budget: SESSION_BUDGET,
      sessionNumber: newCount,
    });
  },

  isValidPlacement: (position) => {
    if (
      position.row < 0 ||
      position.row >= GRID_ROWS ||
      position.col < 0 ||
      position.col >= GRID_COLS
    ) {
      return false;
    }
    const state = get();
    return !state.placedItems.some(
      (item) =>
        item.position.row === position.row &&
        item.position.col === position.col,
    );
  },
}));
