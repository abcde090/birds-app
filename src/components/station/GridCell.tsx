import { useState, useCallback } from "react";
import type { GridPosition } from "../../types/station";

interface GridCellProps {
  position: GridPosition;
  onDragOver: (e: React.DragEvent, position: GridPosition) => void;
  onDrop: (e: React.DragEvent, position: GridPosition) => void;
  children?: React.ReactNode;
}

export default function GridCell({
  position,
  onDragOver,
  onDrop,
  children,
}: GridCellProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      onDragOver(e, position);
      setIsOver(true);
    },
    [onDragOver, position],
  );

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      setIsOver(false);
      onDrop(e, position);
    },
    [onDrop, position],
  );

  return (
    <div
      className={`relative flex aspect-square items-center justify-center rounded border transition-colors ${
        isOver
          ? "border-outback-gold bg-outback-gold/20"
          : "border-eucalyptus-600/30 bg-eucalyptus-700/20"
      } ${children ? "" : "hover:border-eucalyptus-400/50"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="gridcell"
      aria-label={`Grid cell row ${position.row + 1}, column ${position.col + 1}`}
    >
      {children}
    </div>
  );
}
