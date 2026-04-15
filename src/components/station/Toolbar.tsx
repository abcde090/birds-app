import { useStationStore } from "../../stores/useStationStore";
import { useDragStart } from "../../hooks/useDragDrop";
import { FOOD_ITEMS, HABITAT_ITEMS } from "../../lib/station-config";
import ToolbarItem from "./ToolbarItem";

export default function Toolbar() {
  const budget = useStationStore((s) => s.budget);
  const onDragStart = useDragStart();
  const noBudget = budget <= 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-eucalyptus-600/30 bg-night-sky/80 p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm text-outback-gold">Items</h3>
        <span className="rounded-full bg-eucalyptus-600/40 px-2 py-0.5 font-mono text-xs text-sand-200">
          {budget} left
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-bark-400">
          Food & Water
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {FOOD_ITEMS.map((item) => (
            <ToolbarItem
              key={item.type}
              definition={item}
              disabled={noBudget}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-bark-400">
          Vegetation
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {HABITAT_ITEMS.map((item) => (
            <ToolbarItem
              key={item.type}
              definition={item}
              disabled={noBudget}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
