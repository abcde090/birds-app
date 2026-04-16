import { useMemo } from "react";
import { useStationStore } from "../../stores/useStationStore";
import { useVisitorStore } from "../../stores/useVisitorStore";
import { useDragDrop } from "../../hooks/useDragDrop";
import { GRID_ROWS, GRID_COLS } from "../../lib/station-config";
import GridCell from "./GridCell";
import PlacedItem from "./PlacedItem";
import VisitorBird from "./VisitorBird";

export default function StationCanvas() {
  const placedItems = useStationStore((s) => s.placedItems);
  const visitors = useVisitorStore((s) => s.visitors);
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const grid = useMemo(() => {
    const cells: { row: number; col: number }[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        cells.push({ row, col });
      }
    }
    return cells;
  }, []);

  return (
    <div className="relative flex-1 rounded-lg bg-gradient-to-b from-sky-400 to-eucalyptus-500 p-2">
      <div
        className="grid h-full w-full gap-1"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        }}
        role="grid"
        aria-label="Feeding station grid"
      >
        {grid.map(({ row, col }) => {
          const item = placedItems.find(
            (i) => i.position.row === row && i.position.col === col,
          );

          const cellVisitors = visitors.filter(
            (v) => v.position.row === row && v.position.col === col,
          );

          return (
            <GridCell
              key={`${row}-${col}`}
              position={{ row, col }}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              {item && <PlacedItem item={item} onDragStart={onDragStart} />}
              {cellVisitors.map((visitor) => (
                <VisitorBird key={visitor.birdId} visit={visitor} />
              ))}
            </GridCell>
          );
        })}
      </div>
    </div>
  );
}
