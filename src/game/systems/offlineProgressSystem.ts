import { TIMING_CONFIG } from "../../config/timing.config";
import type { GameState } from "../../types/gameState.types";
import { defaultRng } from "../rng/rng";
import { completeReadyCrafts } from "./craftSystem";
import { tickResources } from "./resourceSystem";

export function applyOfflineProgress(state: GameState, now: number): GameState {
  const elapsedMs = Math.max(0, now - state.lastSavedAt);
  const cappedElapsedMs = Math.min(elapsedMs, TIMING_CONFIG.maxOfflineSeconds * 1000);
  const cappedNow = state.lastSavedAt + cappedElapsedMs;

  let nextState = tickResources(state, cappedNow);
  nextState = completeReadyCrafts(nextState, {
    now: cappedNow,
    rng: defaultRng
  });

  return {
    ...nextState,
    timers: {
      ...nextState.timers,
      lastResourceTickAt: now,
      lastOfflineProgressAt: now
    },
    lastSavedAt: now
  };
}
