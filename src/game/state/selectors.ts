import { BLUEPRINTS } from "../../config/blueprints.config";
import { ITEM_TYPES } from "../../config/itemTypes.config";
import { REPUTATION_LEVELS } from "../../config/reputation.config";
import { TIERS } from "../../config/tiers.config";
import type { EntityId } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";

export function getSwordBlueprint() {
  return BLUEPRINTS.find((blueprint) => blueprint.id === "bp_sword_base");
}

export function getFreeForgeSlot(state: GameState) {
  return state.workshop.forgeSlots.find((slot) => slot.isUnlocked && !slot.activeCraftId);
}

export function getInventoryItems(state: GameState) {
  return state.inventory.itemIds
    .map((itemId) => state.itemsById[itemId])
    .filter((item) => item !== undefined);
}

export function getLastCraftedItem(state: GameState) {
  const lastCraftLog = state.log.entries.find(
    (entry) => entry.type === "craft_completed" && entry.relatedItemId
  );

  return lastCraftLog?.relatedItemId
    ? state.itemsById[lastCraftLog.relatedItemId]
    : undefined;
}

export function getActiveCraftForSlot(state: GameState, slotId: EntityId) {
  const slot = state.workshop.forgeSlots.find((candidate) => candidate.slotId === slotId);
  return slot?.activeCraftId ? state.workshop.activeCraftsById[slot.activeCraftId] : undefined;
}

export function getCraftDisplayName(itemType: keyof typeof ITEM_TYPES) {
  return ITEM_TYPES[itemType].displayName;
}

export function calculateReputationLevel(reputationXp: number): number {
  return REPUTATION_LEVELS.reduce(
    (level, candidate) =>
      reputationXp >= candidate.xpRequired ? candidate.level : level,
    1
  );
}

export function getNextReputationThreshold(state: GameState): number {
  return (
    REPUTATION_LEVELS.find((level) => level.xpRequired > state.player.reputationXp)
      ?.xpRequired ?? REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1].xpRequired
  );
}

export function getTierName(state: GameState): string {
  return TIERS[state.workshop.forgeTier as keyof typeof TIERS]?.name ?? "Unknown Forge";
}

export function getBlueprintLevelRange(state: GameState, blueprintId: EntityId) {
  const blueprint = BLUEPRINTS.find((candidate) => candidate.id === blueprintId);
  if (!blueprint || blueprint.itemType === "any") return undefined;

  const base =
    blueprint.baseLevelBonus +
    getForgeTierLevelBonus(state.workshop.forgeTier) +
    state.workshop.itemLevelMinBonus;

  return {
    min: Math.max(1, Math.min(state.workshop.maxItemLevelCap, base)),
    max: Math.max(1, Math.min(state.workshop.maxItemLevelCap, base + 3))
  };
}

export function isLegendaryEnabled(state: GameState): boolean {
  return Boolean(TIERS[state.workshop.forgeTier as keyof typeof TIERS]?.legendaryEnabled);
}

function getForgeTierLevelBonus(forgeTier: number): number {
  if (forgeTier >= 3) return 8;
  if (forgeTier >= 2) return 4;
  return 0;
}
