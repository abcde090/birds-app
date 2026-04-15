import { useEffect, useCallback, useRef } from "react";
import { useStationStore } from "../stores/useStationStore";
import { useVisitorStore } from "../stores/useVisitorStore";
import { useCollectionStore } from "../stores/useCollectionStore";
import { evaluateVisitors } from "../lib/visit-engine";
import { resolveInteractions } from "../lib/interaction-engine";

export function useStationLoop(): void {
  const placedItems = useStationStore((s) => s.placedItems);
  const currentPhase = useStationStore((s) => s.currentPhase);
  const screen = useStationStore((s) => s.screen);

  const behaviors = useVisitorStore((s) => s.behaviors);
  const visitors = useVisitorStore((s) => s.visitors);
  const setVisitors = useVisitorStore((s) => s.setVisitors);
  const setEvents = useVisitorStore((s) => s.setEvents);
  const addSessionSpecies = useVisitorStore((s) => s.addSessionSpecies);
  const recordDiscovery = useVisitorStore((s) => s.recordDiscovery);

  const discoverBird = useCollectionStore((s) => s.discoverBird);
  const isDiscovered = useCollectionStore((s) => s.isDiscovered);

  const prevPhaseRef = useRef(currentPhase);
  const prevItemCountRef = useRef(placedItems.length);

  const evaluate = useCallback(() => {
    if (screen !== "station-playing") return;
    if (behaviors.length === 0) return;

    const seed = Date.now();

    const newVisits = evaluateVisitors({
      placedItems,
      currentPhase,
      behaviors,
      currentVisitors: visitors,
      seed,
    });

    const { updatedVisits, events } = resolveInteractions(newVisits, behaviors);

    setVisitors(updatedVisits);
    setEvents(events);

    // Track discoveries
    for (const visit of updatedVisits) {
      if (visit.status !== "fleeing" && visit.status !== "watching") {
        addSessionSpecies(visit.birdId);
        if (!isDiscovered(visit.birdId)) {
          discoverBird(visit.birdId);
          recordDiscovery(visit.birdId);
        }
      }
    }
  }, [
    screen,
    placedItems,
    currentPhase,
    behaviors,
    visitors,
    setVisitors,
    setEvents,
    addSessionSpecies,
    recordDiscovery,
    discoverBird,
    isDiscovered,
  ]);

  // Re-evaluate when phase changes
  useEffect(() => {
    if (prevPhaseRef.current !== currentPhase) {
      prevPhaseRef.current = currentPhase;
      evaluate();
    }
  }, [currentPhase, evaluate]);

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
