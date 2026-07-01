import { BLUEPRINTS } from "../../config/blueprints.config";
import { ITEM_TYPES } from "../../config/itemTypes.config";
import { REPUTATION_LEVELS } from "../../config/reputation.config";
import { TIERS } from "../../config/tiers.config";
import type { BlueprintConfig } from "../../types/blueprint.types";
import type { EntityId } from "../../types/common.types";
import type { GameState, GuildContractState, HeroCommissionState } from "../../types/gameState.types";
import type { ItemState } from "../../types/item.types";
import { getUnlockedCraftAchievements } from "../systems/achievementSystem";
import { getBlueprintPurchaseStates, getEffectiveBlueprintLevelBonus } from "../systems/blueprintSystem";
import { calculateCraftCost, calculateCraftDurationSeconds } from "../systems/craftSystem";
import { isItemMasterworkEligible } from "../systems/masterworkSystem";
import {
  canItemSatisfyGuildRequirement,
  canItemSatisfyHeroCommission,
  getActiveGuildContracts,
  getActiveHeroCommissions
} from "../systems/orderSystem";
import { getTierUpgradeStates } from "../systems/tierSystem";
import { getUpgradePurchaseStates } from "../systems/upgradeSystem";

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

export function getOpenGuildContracts(state: GameState): GuildContractState[] {
  return getActiveGuildContracts(state);
}

export function getOpenHeroCommissions(state: GameState): HeroCommissionState[] {
  return getActiveHeroCommissions(state);
}

export function getMatchingGuildInventoryItems(
  state: GameState,
  contract: GuildContractState
): ItemState[] {
  return getInventoryItems(state).filter((item) => canItemSatisfyGuildRequirement(item, contract));
}

export function getMatchingHeroInventoryItems(
  state: GameState,
  commission: HeroCommissionState
): ItemState[] {
  return getInventoryItems(state).filter((item) => canItemSatisfyHeroCommission(item, commission));
}

export function getMatchingOrderLabelsForItem(state: GameState, item: ItemState): string[] {
  const guildMatches = getOpenGuildContracts(state)
    .filter((contract) => contract.status === "accepted")
    .filter((contract) => canItemSatisfyGuildRequirement(item, contract))
    .map((contract) => `${contract.guildName} contract`);
  const heroMatches = getOpenHeroCommissions(state)
    .filter((commission) => canItemSatisfyHeroCommission(item, commission))
    .map((commission) => `${commission.heroName} commission`);

  return [...guildMatches, ...heroMatches];
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

export function getOwnedCraftableBlueprints(state: GameState): BlueprintConfig[] {
  return BLUEPRINTS.filter(
    (blueprint) =>
      blueprint.itemType !== "any" &&
      state.blueprints.ownedBlueprintIds.includes(blueprint.id)
  );
}

export function getCraftCostDisplay(blueprintId: EntityId): string {
  const cost = calculateCraftCost(blueprintId);
  return `${cost.ironOre} Iron Ore + ${cost.wood} Wood`;
}

export function getCraftDurationDisplay(state: GameState, blueprintId: EntityId): string {
  return `${calculateCraftDurationSeconds(state, blueprintId)}s`;
}

export function getNextReputationThreshold(state: GameState): number {
  return (
    REPUTATION_LEVELS.find((level) => level.xpRequired > state.player.reputationXp)
      ?.xpRequired ?? REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1].xpRequired
  );
}

export function getCurrentReputationTitle(state: GameState): string {
  return (
    REPUTATION_LEVELS.find((level) => level.level === state.player.reputationLevel)?.title ??
    "Unknown"
  );
}

export function getTierName(state: GameState): string {
  return TIERS[state.workshop.forgeTier as keyof typeof TIERS]?.name ?? "Unknown Forge";
}

export function getBlueprintLevelRange(state: GameState, blueprintId: EntityId) {
  const blueprint = BLUEPRINTS.find((candidate) => candidate.id === blueprintId);
  if (!blueprint || blueprint.itemType === "any") return undefined;

  const base =
    getEffectiveBlueprintLevelBonus(blueprint) +
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

export function getBlueprintShopEntries(state: GameState) {
  return getBlueprintPurchaseStates(state);
}

export function getWorkshopUpgradeEntries(state: GameState) {
  return getUpgradePurchaseStates(state);
}

export function getForgeTierUpgradeEntries(state: GameState) {
  return getTierUpgradeStates(state);
}

export function getCurrentTierConfig(state: GameState) {
  return TIERS[state.workshop.forgeTier as keyof typeof TIERS] ?? TIERS[1];
}

export function getPendingFeedbackEvent(state: GameState) {
  const feedbackId = state.feedback.pendingEventIds[0];
  return feedbackId ? state.feedback.eventsById[feedbackId] : undefined;
}

export function getAchievementEntries(state: GameState) {
  return getUnlockedCraftAchievements(state);
}

export function getItemMasterworkEligibility(state: GameState, item: ItemState): boolean {
  return isItemMasterworkEligible(state, item);
}

function getForgeTierLevelBonus(forgeTier: number): number {
  if (forgeTier >= 3) return 8;
  if (forgeTier >= 2) return 4;
  return 0;
}
