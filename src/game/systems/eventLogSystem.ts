import type { EntityId, TimestampMs } from "../../types/common.types";
import type { EventLogEntry, GameState } from "../../types/gameState.types";
import { createId } from "../../utils/ids";

type AddLogInput = {
  type: EventLogEntry["type"];
  text: string;
  createdAt: TimestampMs;
  relatedItemId?: EntityId;
  relatedHeroId?: EntityId;
  relatedContractId?: EntityId;
  relatedCommissionId?: EntityId;
};

export function addLogEntry(state: GameState, input: AddLogInput): GameState {
  const entry: EventLogEntry = {
    eventId: createId("log"),
    type: input.type,
    text: input.text,
    createdAt: input.createdAt,
    relatedItemId: input.relatedItemId,
    relatedHeroId: input.relatedHeroId,
    relatedContractId: input.relatedContractId,
    relatedCommissionId: input.relatedCommissionId
  };

  return {
    ...state,
    log: {
      ...state.log,
      entries: [entry, ...state.log.entries].slice(0, state.log.maxEntries)
    }
  };
}
