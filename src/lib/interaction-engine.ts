import type { BirdBehavior, BirdVisit } from "../types/station";

interface InteractionResult {
  readonly updatedVisits: readonly BirdVisit[];
  readonly events: readonly InteractionEvent[];
}

export interface InteractionEvent {
  readonly type: "chase" | "flee" | "flock_arrive" | "predator_clear";
  readonly actorId: string;
  readonly targetId: string | null;
  readonly description: string;
}

const SIZE_ORDER: Record<string, number> = {
  tiny: 1,
  small: 2,
  medium: 3,
  large: 4,
  huge: 5,
};

function getBehavior(
  behaviors: readonly BirdBehavior[],
  birdId: string,
): BirdBehavior | undefined {
  return behaviors.find((b) => b.id === birdId);
}

export function resolveInteractions(
  visits: readonly BirdVisit[],
  behaviors: readonly BirdBehavior[],
): InteractionResult {
  const updatedVisits: BirdVisit[] = visits.map((v) => ({ ...v }));
  const events: InteractionEvent[] = [];

  // Pass 1: Aggressive birds chase shy/cautious birds from the same food source
  for (const visit of updatedVisits) {
    const behavior = getBehavior(behaviors, visit.birdId);
    if (!behavior) continue;
    if (behavior.temperament !== "aggressive") continue;
    if (visit.status === "fleeing") continue;

    for (const target of updatedVisits) {
      if (target.birdId === visit.birdId) continue;
      if (target.status === "fleeing") continue;

      const targetBehavior = getBehavior(behaviors, target.birdId);
      if (!targetBehavior) continue;

      // Check if aggressor explicitly chases this species
      const explicitChase = behavior.chases.includes(target.birdId);

      // Check if larger bird prevents smaller bird at same food
      const sameFood =
        target.targetItemId !== null &&
        target.targetItemId === visit.targetItemId;
      const sizeDiff =
        SIZE_ORDER[behavior.size] - SIZE_ORDER[targetBehavior.size];
      const sizeChase = sameFood && sizeDiff >= 2;

      if (explicitChase || sizeChase) {
        const targetIndex = updatedVisits.findIndex(
          (v) => v.birdId === target.birdId,
        );
        if (targetIndex !== -1) {
          updatedVisits[targetIndex] = {
            ...updatedVisits[targetIndex],
            status: "fleeing",
          };
          events.push({
            type: "chase",
            actorId: visit.birdId,
            targetId: target.birdId,
            description: `${visit.birdId} chases ${target.birdId} away`,
          });
        }
      }
    }
  }

  // Pass 2: Predators (huge aggressive) clear all smaller birds
  for (const visit of updatedVisits) {
    const behavior = getBehavior(behaviors, visit.birdId);
    if (!behavior) continue;
    if (behavior.size !== "huge" || behavior.temperament !== "aggressive")
      continue;
    if (visit.status === "fleeing") continue;

    for (const target of updatedVisits) {
      if (target.birdId === visit.birdId) continue;
      if (target.status === "fleeing" || target.status === "watching") continue;

      const targetBehavior = getBehavior(behaviors, target.birdId);
      if (!targetBehavior) continue;

      if (SIZE_ORDER[targetBehavior.size] <= SIZE_ORDER["medium"]) {
        const targetIndex = updatedVisits.findIndex(
          (v) => v.birdId === target.birdId,
        );
        if (
          targetIndex !== -1 &&
          updatedVisits[targetIndex].status !== "fleeing"
        ) {
          updatedVisits[targetIndex] = {
            ...updatedVisits[targetIndex],
            status: "fleeing",
          };
          events.push({
            type: "predator_clear",
            actorId: visit.birdId,
            targetId: target.birdId,
            description: `${visit.birdId} presence scares ${target.birdId}`,
          });
        }
      }
    }
  }

  // Pass 3: Flocking — if a flocking bird visits, queue more for next phase
  for (const visit of updatedVisits) {
    if (visit.status === "fleeing") continue;
    const behavior = getBehavior(behaviors, visit.birdId);
    if (!behavior) continue;
    if (!behavior.flocking) continue;

    events.push({
      type: "flock_arrive",
      actorId: visit.birdId,
      targetId: null,
      description: `${visit.birdId} calls to its flock — more may arrive next phase`,
    });
  }

  return { updatedVisits, events };
}
