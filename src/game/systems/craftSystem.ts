import { BLUEPRINTS } from "../../config/blueprints.config";
import { ITEM_TYPES } from "../../config/itemTypes.config";
import type { GameState } from "../../types/gameState.types";
import { createId } from "../../utils/ids";
import type { SystemContext } from "../rng/rng";
import { unlockCraftAchievementForItem } from "./achievementSystem";
import { addLogEntry } from "./eventLogSystem";
import { addItemToInventory } from "./inventorySystem";
import { generateItem } from "./itemGenerationSystem";
import { canSpendResources, spendResources } from "./resourceSystem";

export function canStartCraft(
  state: GameState,
  blueprintId: string
): { ok: boolean; reason?: string } {
  const blueprint = BLUEPRINTS.find((candidate) => candidate.id === blueprintId);

  if (!blueprint) return { ok: false, reason: "Blueprint not found" };
  if (!state.blueprints.ownedBlueprintIds.includes(blueprintId)) {
    return { ok: false, reason: "Blueprint not owned" };
  }
  if (blueprint.itemType === "any") {
    return { ok: false, reason: "Cannot craft generic blueprint directly" };
  }
  if (state.workshop.forgeTier < blueprint.requiredForgeTier) {
    return { ok: false, reason: "Forge tier too low" };
  }

  const freeSlot = state.workshop.forgeSlots.find(
    (slot) => slot.isUnlocked && !slot.activeCraftId
  );

  if (!freeSlot) return { ok: false, reason: "No free forge slot" };

  const cost = calculateCraftCost(blueprintId);
  if (!canSpendResources(state, cost)) {
    return { ok: false, reason: "Not enough materials" };
  }
  if (state.inventory.itemIds.length >= state.inventory.maxSlots) {
    return { ok: false, reason: "Inventory full" };
  }

  return { ok: true };
}

export function startCraft(
  state: GameState,
  blueprintId: string,
  slotId: string,
  context: SystemContext
): GameState {
  const check = canStartCraft(state, blueprintId);
  if (!check.ok) throw new Error(check.reason);

  const blueprint = BLUEPRINTS.find((candidate) => candidate.id === blueprintId)!;
  if (blueprint.itemType === "any") throw new Error("Invalid craft blueprint");

  const targetSlot = state.workshop.forgeSlots.find((slot) => slot.slotId === slotId);
  if (!targetSlot?.isUnlocked || targetSlot.activeCraftId) {
    throw new Error("Selected forge slot is not available");
  }

  const itemTypeConfig = ITEM_TYPES[blueprint.itemType];
  const cost = calculateCraftCost(blueprintId);
  const durationSeconds = calculateCraftDurationSeconds(state, blueprintId);
  const craftId = createId("craft");
  const activeCraft = {
    craftId,
    blueprintId,
    itemType: blueprint.itemType,
    startedAt: context.now,
    completesAt: context.now + durationSeconds * 1000,
    durationSeconds,
    inputMaterials: cost
  };
  const stateAfterSpend = spendResources(state, cost);
  const nextState: GameState = {
    ...stateAfterSpend,
    workshop: {
      ...stateAfterSpend.workshop,
      activeCraftsById: {
        ...stateAfterSpend.workshop.activeCraftsById,
        [craftId]: activeCraft
      },
      forgeSlots: stateAfterSpend.workshop.forgeSlots.map((slot) =>
        slot.slotId === slotId ? { ...slot, activeCraftId: craftId } : slot
      )
    }
  };

  return addLogEntry(nextState, {
    type: "craft_started",
    text: `Started crafting ${itemTypeConfig.displayName}.`,
    createdAt: context.now
  });
}

export function completeCraft(
  state: GameState,
  craftId: string,
  context: SystemContext
): GameState {
  const craft = state.workshop.activeCraftsById[craftId];

  if (!craft) throw new Error("Craft not found");
  if (craft.completesAt > context.now) throw new Error("Craft is not complete yet");

  const item = generateItem(state, craft.blueprintId, context);
  const stateWithItem = addItemToInventory(state, item);
  const { [craftId]: removedCraft, ...remainingCrafts } =
    stateWithItem.workshop.activeCraftsById;
  void removedCraft;

  const isRare = item.rarity === "rare";
  const isEpic = item.rarity === "epic";
  const isLegendary = item.rarity === "legendary";

  const completedState: GameState = {
    ...stateWithItem,
    workshop: {
      ...stateWithItem.workshop,
      activeCraftsById: remainingCrafts,
      forgeSlots: stateWithItem.workshop.forgeSlots.map((slot) =>
        slot.activeCraftId === craftId
          ? {
              ...slot,
              activeCraftId: undefined
            }
          : slot
      )
    },
    player: {
      ...stateWithItem.player,
      craftedItemCount: stateWithItem.player.craftedItemCount + 1,
      craftedRareCount: stateWithItem.player.craftedRareCount + (isRare ? 1 : 0),
      craftedEpicCount: stateWithItem.player.craftedEpicCount + (isEpic ? 1 : 0),
      craftedLegendaryCount:
        stateWithItem.player.craftedLegendaryCount + (isLegendary ? 1 : 0)
    },
    prestige: isLegendary
      ? {
          ...stateWithItem.prestige,
          legendaryItemIds: [...stateWithItem.prestige.legendaryItemIds, item.itemId]
        }
      : stateWithItem.prestige
  };

  const withCraftLog = addLogEntry(completedState, {
    type: "craft_completed",
    text: `Crafted ${item.displayName}.`,
    relatedItemId: item.itemId,
    createdAt: context.now
  });
  const withAchievement = unlockCraftAchievementForItem(withCraftLog, item, context.now);

  if (!isLegendary) return withAchievement;

  return addLogEntry(withAchievement, {
    type: "legendary_crafted",
    text: `Legendary craft: ${item.displayName}.`,
    relatedItemId: item.itemId,
    createdAt: context.now
  });
}

export function completeReadyCrafts(state: GameState, context: SystemContext): GameState {
  return Object.values(state.workshop.activeCraftsById)
    .filter((craft) => craft.completesAt <= context.now)
    .reduce((nextState, craft) => completeCraft(nextState, craft.craftId, context), state);
}

export function calculateCraftCost(blueprintId: string): { ironOre: number; wood: number } {
  const blueprint = BLUEPRINTS.find((candidate) => candidate.id === blueprintId);
  if (!blueprint) throw new Error("Blueprint not found");
  if (blueprint.itemType === "any") throw new Error("Cannot craft generic blueprint directly");

  const itemTypeConfig = ITEM_TYPES[blueprint.itemType];
  const multiplier = blueprint.materialCostMultiplier ?? 1;

  return {
    ironOre: Math.ceil(itemTypeConfig.baseCost.ironOre * multiplier),
    wood: Math.ceil(itemTypeConfig.baseCost.wood * multiplier)
  };
}

export function calculateCraftDurationSeconds(state: GameState, blueprintId: string): number {
  const blueprint = BLUEPRINTS.find((candidate) => candidate.id === blueprintId);
  if (!blueprint) throw new Error("Blueprint not found");
  if (blueprint.itemType === "any") throw new Error("Cannot craft generic blueprint directly");

  const itemTypeConfig = ITEM_TYPES[blueprint.itemType];
  const blueprintTimeMultiplier = blueprint.craftTimeMultiplier ?? 1;

  return Math.ceil(
    (itemTypeConfig.baseCraftTimeSeconds * blueprintTimeMultiplier) /
      state.workshop.craftSpeedMultiplier
  );
}
