import type { EntityId } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";
import type { Rng, SystemContext } from "../rng/rng";
import { defaultRng } from "../rng/rng";
import { completeCraft, completeReadyCrafts, startCraft } from "../systems/craftSystem";
import { sellItemToMarket } from "../systems/inventorySystem";
import { tickResources } from "../systems/resourceSystem";
import { getFreeForgeSlot } from "./selectors";

export function advanceGame(state: GameState, now: number, rng: Rng = defaultRng): GameState {
  const tickedState = tickResources(state, now);
  return completeReadyCrafts(tickedState, {
    now,
    rng
  });
}

export function startCraftAction(
  state: GameState,
  blueprintId: EntityId,
  context: SystemContext,
  slotId?: EntityId
): GameState {
  const tickedState = tickResources(state, context.now);
  const selectedSlotId = slotId ?? getFreeForgeSlot(tickedState)?.slotId;

  if (!selectedSlotId) throw new Error("No free forge slot");

  return startCraft(tickedState, blueprintId, selectedSlotId, context);
}

export function sellItemAction(state: GameState, itemId: EntityId, now: number): GameState {
  return sellItemToMarket(state, itemId, now);
}

export function forceCompleteCraftAction(
  state: GameState,
  craftId: EntityId,
  context: SystemContext
): GameState {
  const craft = state.workshop.activeCraftsById[craftId];

  if (!craft) throw new Error("Craft not found");

  const preparedState: GameState = {
    ...state,
    workshop: {
      ...state.workshop,
      activeCraftsById: {
        ...state.workshop.activeCraftsById,
        [craftId]: {
          ...craft,
          completesAt: context.now
        }
      }
    }
  };

  return completeCraft(preparedState, craftId, context);
}

export function grantDebugResources(
  state: GameState,
  resources: { gold?: number; ironOre?: number; wood?: number }
): GameState {
  return {
    ...state,
    resources: {
      ...state.resources,
      gold: state.resources.gold + (resources.gold ?? 0),
      ironOre: Math.min(
        state.resources.ironOreCap,
        state.resources.ironOre + (resources.ironOre ?? 0)
      ),
      wood: Math.min(state.resources.woodCap, state.resources.wood + (resources.wood ?? 0))
    }
  };
}
