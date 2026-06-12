import { REPUTATION_LEVELS } from "../../config/reputation.config";
import type { GameState } from "../../types/gameState.types";
import { addLogEntry } from "./eventLogSystem";

export function calculateReputationLevel(reputationXp: number): number {
  return REPUTATION_LEVELS.reduce(
    (level, candidate) =>
      reputationXp >= candidate.xpRequired ? candidate.level : level,
    1
  );
}

export function addReputation(state: GameState, amount: number, now: number): GameState {
  if (amount <= 0) return state;

  const nextXp = state.player.reputationXp + amount;
  const nextLevel = calculateReputationLevel(nextXp);
  const nextState: GameState = {
    ...state,
    player: {
      ...state.player,
      reputationXp: nextXp,
      reputationLevel: nextLevel
    }
  };

  if (nextLevel <= state.player.reputationLevel) return nextState;

  return addLogEntry(nextState, {
    type: "rep_level_up",
    text: `Reputation reached level ${nextLevel}.`,
    createdAt: now
  });
}
