import { useCallback } from "react";
import type { StationItemType, GridPosition } from "../types/station";
import { useStationStore } from "../stores/useStationStore";

interface DragData {
  readonly type: StationItemType;
  readonly sourceItemId?: string;
}

const DRAG_DATA_KEY = "application/station-item";

export function useDragStart() {
  return useCallback((e: React.DragEvent, data: DragData) => {
    e.dataTransfer.setData(DRAG_DATA_KEY, JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move";
  }, []);
}

export function useDragOver() {
  const isValidPlacement = useStationStore((s) => s.isValidPlacement);

  return useCallback(
    (e: React.DragEvent, position: GridPosition) => {
      e.preventDefault();
      if (isValidPlacement(position)) {
        e.dataTransfer.dropEffect = "move";
      } else {
        e.dataTransfer.dropEffect = "none";
      }
    },
    [isValidPlacement],
  );
}

export function useDrop() {
  const placeItem = useStationStore((s) => s.placeItem);
  const moveItem = useStationStore((s) => s.moveItem);
  const budget = useStationStore((s) => s.budget);

  return useCallback(
    (e: React.DragEvent, position: GridPosition) => {
      e.preventDefault();
      const rawData = e.dataTransfer.getData(DRAG_DATA_KEY);
      if (!rawData) return;

      const data: DragData = JSON.parse(rawData) as DragData;

      if (data.sourceItemId) {
        moveItem(data.sourceItemId, position);
      } else {
        if (budget <= 0) return;
        placeItem(data.type, position);
      }
    },
    [placeItem, moveItem, budget],
  );
}

export function useDragDrop() {
  return {
    onDragStart: useDragStart(),
    onDragOver: useDragOver(),
    onDrop: useDrop(),
  };
}
