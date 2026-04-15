import { useCallback } from "react";
import type {
  StationItemDefinition,
  StationItemType,
} from "../../types/station";

interface ToolbarItemProps {
  definition: StationItemDefinition;
  disabled: boolean;
  onDragStart: (e: React.DragEvent, data: { type: StationItemType }) => void;
}

export default function ToolbarItem({
  definition,
  disabled,
  onDragStart,
}: ToolbarItemProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onDragStart(e, { type: definition.type });
    },
    [onDragStart, definition.type, disabled],
  );

  return (
    <div
      className={`flex cursor-grab flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
        disabled
          ? "cursor-not-allowed border-bark-700/30 opacity-40"
          : "border-eucalyptus-500/50 bg-eucalyptus-700/40 hover:border-outback-gold/50 hover:bg-eucalyptus-600/40 active:cursor-grabbing"
      }`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      title={disabled ? "No budget remaining" : definition.description}
      role="button"
      aria-label={`${definition.name}: ${definition.description}`}
      aria-disabled={disabled}
    >
      <span className="text-xl">{definition.emoji}</span>
      <span className="text-center text-xs text-sand-200">
        {definition.name}
      </span>
    </div>
  );
}
