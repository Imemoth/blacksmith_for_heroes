import type { ResourceCost } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";
import { clamp } from "../../utils/math";

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
