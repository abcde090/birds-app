import { create } from 'zustand';
import type { AustralianRegionId } from '../types/bird';

interface MapStore {
  selectedRegion: AustralianRegionId | null;
  heatmapVisible: boolean;
  selectRegion: (region: AustralianRegionId | null) => void;
  toggleHeatmap: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedRegion: null,
  heatmapVisible: true,

  selectRegion: (region) => set({ selectedRegion: region }),
  toggleHeatmap: () => set((state) => ({ heatmapVisible: !state.heatmapVisible })),
}));
