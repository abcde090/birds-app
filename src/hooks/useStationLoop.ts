import { useEffect, useCallback, useRef } from "react";
import { useStationStore } from "../stores/useStationStore";
import { useVisitorStore } from "../stores/useVisitorStore";
import { useCollectionStore } from "../stores/useCollectionStore";
import { evaluateVisitors } from "../lib/visit-engine";
import { resolveInteractions } from "../lib/interaction-engine";

export function useStationLoop(): void {
  const placedItems = useStationStore((s) => s.placedItems);
  const screen = useStationStore((s) => s.screen);
  const behaviors = useVisitorStore((s) => s.behaviors);
  const prevItemCountRef = useRef(placedItems.length);

  const evaluate = useCallback(() => {
    if (screen !== "station-playing") return;

    const currentBehaviors = useVisitorStore.getState().behaviors;
    if (currentBehaviors.length === 0) return;

    const currentVisitors = useVisitorStore.getState().visitors;
    const seed = Date.now();

    const newVisits = evaluateVisitors({
      placedItems,
      behaviors: currentBehaviors,
      currentVisitors,
      seed,
    });

    const { updatedVisits, events } = resolveInteractions(
      newVisits,
      currentBehaviors,
    );

    useVisitorStore.getState().setVisitors(updatedVisits);
    useVisitorStore.getState().setEvents(events);

    for (const visit of updatedVisits) {
      if (visit.status !== "fleeing" && visit.status !== "watching") {
        useVisitorStore.getState().addSessionSpecies(visit.birdId);
        if (!useCollectionStore.getState().isDiscovered(visit.birdId)) {
          useCollectionStore.getState().discoverBird(visit.birdId);
          useVisitorStore.getState().recordDiscovery(visit.birdId);
        }
      }
    }
  }, [screen, placedItems]);

  // Re-evaluate when items change
  useEffect(() => {
    if (prevItemCountRef.current !== placedItems.length) {
      prevItemCountRef.current = placedItems.length;
      evaluate();
    }
  }, [placedItems.length, evaluate]);

  // Initial evaluation
  useEffect(() => {
    if (screen === "station-playing" && behaviors.length > 0) {
      evaluate();
    }
  }, [screen, behaviors.length, evaluate]);
}
