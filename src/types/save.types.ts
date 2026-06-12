import type { TimestampMs } from "./common.types";
import type { GameState } from "./gameState.types";

export type SaveGame = {
  saveVersion: number;
  savedAt: TimestampMs;
  gameState: GameState;
};
