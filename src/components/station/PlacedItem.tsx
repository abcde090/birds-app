import { useCallback } from "react";
import type {
  PlacedItem as PlacedItemType,
  StationItemType,
} from "../../types/station";
import { getItemDefinition } from "../../lib/station-config";
import { useStationStore } from "../../stores/useStationStore";

interface PlacedItemProps {
  item: PlacedItemType;
  onDragStart: (
    e: React.DragEvent,
    data: { type: StationItemType; sourceItemId: string },
  ) => void;
}

export default function PlacedItem({ item, onDragStart }: PlacedItemProps) {
  const removeItem = useStationStore((s) => s.removeItem);
  const definition = getItemDefinition(item.type);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      onDragStart(e, { type: item.type, sourceItemId: item.id });
    },
    [onDragStart, item.type, item.id],
  );

  const handleDoubleClick = useCallback(() => {
    removeItem(item.id);
  }, [removeItem, item.id]);

  return (
    <div
      className="flex h-full w-full cursor-grab items-center justify-center text-2xl active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      title={`${definition.name} (double-click to remove)`}
      role="img"
      aria-label={definition.name}
    >
      <span className="drop-shadow-md">{definition.emoji}</span>
    </div>
  );
}
