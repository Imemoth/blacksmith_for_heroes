import type { ResourceCost } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";
import { clamp } from "../../utils/math";

export type TickingResourceId = "ironOre" | "wood";

export type ResourceTickerProgress = {
  resourceId: TickingResourceId;
  progress: number;
  isCapped: boolean;
  secondsUntilNext: number;
  ratePerSecond: number;
};

export function tickResources(state: GameState, now: number): GameState {
  if (now < state.timers.lastResourceTickAt) {
    return state;
  }

  const elapsedMs = now - state.timers.lastResourceTickAt;
  const elapsedSeconds = elapsedMs / 1000;

  const nextIronOre = clamp(
    state.resources.ironOre + elapsedSeconds * state.resources.ironOreRatePerSecond,
    0,
    state.resources.ironOreCap
  );
  const nextWood = clamp(
    state.resources.wood + elapsedSeconds * state.resources.woodRatePerSecond,
    0,
    state.resources.woodCap
  );

  return {
    ...state,
    resources: {
      ...state.resources,
      ironOre: nextIronOre,
      wood: nextWood
    },
    timers: {
      ...state.timers,
      lastResourceTickAt: now
    }
  };
}

export function canSpendResources(state: GameState, cost: ResourceCost): boolean {
  return (
    state.resources.gold >= (cost.gold ?? 0) &&
    state.resources.ironOre >= (cost.ironOre ?? 0) &&
    state.resources.wood >= (cost.wood ?? 0) &&
    state.resources.forgeSigil >= (cost.forgeSigil ?? 0)
  );
}

export function spendResources(state: GameState, cost: ResourceCost): GameState {
  if (!canSpendResources(state, cost)) {
    throw new Error("Not enough resources");
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      gold: state.resources.gold - (cost.gold ?? 0),
      ironOre: state.resources.ironOre - (cost.ironOre ?? 0),
      wood: state.resources.wood - (cost.wood ?? 0),
      forgeSigil: state.resources.forgeSigil - (cost.forgeSigil ?? 0)
    }
  };
}

export function getResourceTickerProgress(
  state: GameState,
  resourceId: TickingResourceId
): ResourceTickerProgress {
  const capKey = resourceId === "ironOre" ? "ironOreCap" : "woodCap";
  const rateKey = resourceId === "ironOre" ? "ironOreRatePerSecond" : "woodRatePerSecond";
  const amount = state.resources[resourceId];
  const cap = state.resources[capKey];
  const ratePerSecond = state.resources[rateKey];
  const isCapped = amount >= cap;

  if (isCapped || ratePerSecond <= 0) {
    return {
      resourceId,
      progress: isCapped ? 1 : 0,
      isCapped,
      secondsUntilNext: isCapped ? 0 : Number.POSITIVE_INFINITY,
      ratePerSecond
    };
  }

  const currentWholeAmount = Math.floor(amount);
  const nextWholeAmount = Math.min(cap, currentWholeAmount + 1);
  const amountUntilNext = Math.max(0, nextWholeAmount - amount);

  return {
    resourceId,
    progress: clamp(amount - currentWholeAmount, 0, 1),
    isCapped: false,
    secondsUntilNext: amountUntilNext / ratePerSecond,
    ratePerSecond
  };
}
