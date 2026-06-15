import type { EntityId } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";
import type { Rng, SystemContext } from "../rng/rng";
import { defaultRng } from "../rng/rng";
import { purchaseBlueprint } from "../systems/blueprintSystem";
import { completeCraft, completeReadyCrafts, startCraft } from "../systems/craftSystem";
import { sellItemToMarket } from "../systems/inventorySystem";
import {
  acceptGuildContract,
  completeHeroCommission,
  deliverItemToGuildContract,
  dismissHeroCommission,
  processOrderTimers
} from "../systems/orderSystem";
import { addReputation } from "../systems/reputationSystem";
import { tickResources } from "../systems/resourceSystem";
import { upgradeTier } from "../systems/tierSystem";
import { purchaseUpgrade } from "../systems/upgradeSystem";
import { getFreeForgeSlot } from "./selectors";

export function advanceGame(state: GameState, now: number, rng: Rng = defaultRng): GameState {
  const tickedState = tickResources(state, now);
  const withCompletedCrafts = completeReadyCrafts(tickedState, {
    now,
    rng
  });

  return processOrderTimers(withCompletedCrafts, { now, rng });
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

export function purchaseBlueprintAction(
  state: GameState,
  blueprintId: EntityId,
  now: number
): GameState {
  return purchaseBlueprint(state, blueprintId, now);
}

export function purchaseWorkshopUpgradeAction(
  state: GameState,
  upgradeId: EntityId,
  now: number
): GameState {
  return purchaseUpgrade(state, upgradeId, now);
}

export function upgradeForgeTierAction(
  state: GameState,
  targetTier: number,
  now: number
): GameState {
  return upgradeTier(state, targetTier, now);
}

export function acceptGuildContractAction(
  state: GameState,
  contractId: EntityId,
  now: number
): GameState {
  return acceptGuildContract(state, contractId, now);
}

export function deliverItemToGuildContractAction(
  state: GameState,
  itemId: EntityId,
  contractId: EntityId,
  context: SystemContext
): GameState {
  return deliverItemToGuildContract(state, itemId, contractId, context);
}

export function deliverItemToHeroCommissionAction(
  state: GameState,
  itemId: EntityId,
  commissionId: EntityId,
  context: SystemContext
): GameState {
  return completeHeroCommission(state, itemId, commissionId, context);
}

export function dismissHeroCommissionAction(
  state: GameState,
  commissionId: EntityId,
  now: number
): GameState {
  return dismissHeroCommission(state, commissionId, now);
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

export function grantDebugReputation(state: GameState, amount: number, now: number): GameState {
  return addReputation(state, amount, now);
}
