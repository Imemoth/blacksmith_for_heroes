import { BLUEPRINTS } from "../../config/blueprints.config";
import { INVENTORY_CONFIG } from "../../config/inventory.config";
import { PRESTIGE_CONFIG } from "../../config/prestige.config";
import { RESOURCE_CONFIG } from "../../config/resources.config";
import { TIMING_CONFIG } from "../../config/timing.config";
import { TIERS } from "../../config/tiers.config";
import type { EntityId } from "../../types/common.types";
import type { GameState, PrestigeRunRecord } from "../../types/gameState.types";
import type { ItemState } from "../../types/item.types";
import { createId } from "../../utils/ids";
import { addLogEntry } from "./eventLogSystem";
import { isItemMasterworkEligible } from "./masterworkSystem";
import { getPrestigeStartingResources, applyOwnedUpgradeEffects } from "./upgradeSystem";

export type PrestigeRequirementKey =
  | "reputation"
  | "forge_tier"
  | "masterwork_frame"
  | "eligible_item"
  | "hero_commissions"
  | "guild_contracts";

export type PrestigeMissingRequirement = {
  key: PrestigeRequirementKey;
  reason: string;
};

export type PrestigeRequirementResult = {
  ok: boolean;
  missingRequirements: PrestigeMissingRequirement[];
  lockReasons: string[];
  eligibleItemIds: EntityId[];
};

export type PrestigeContext = {
  now: number;
  selectedItemId?: EntityId;
};

export function getMasterworkEligibleItemIds(state: GameState): EntityId[] {
  return state.inventory.itemIds.filter((itemId) => {
    const item = state.itemsById[itemId];
    return item ? isItemMasterworkEligible(state, item) : false;
  });
}

export function canPrestige(state: GameState): PrestigeRequirementResult {
  const eligibleItemIds = getMasterworkEligibleItemIds(state);
  const missingRequirements: PrestigeMissingRequirement[] = [];

  if (state.player.reputationLevel < PRESTIGE_CONFIG.requiredReputationLevel) {
    missingRequirements.push({
      key: "reputation",
      reason: `Requires Rep ${PRESTIGE_CONFIG.requiredReputationLevel}`
    });
  }
  if (state.workshop.forgeTier < PRESTIGE_CONFIG.requiredForgeTier) {
    missingRequirements.push({
      key: "forge_tier",
      reason: `Requires Forge Tier ${PRESTIGE_CONFIG.requiredForgeTier}`
    });
  }
  if (!state.blueprints.ownedBlueprintIds.includes(PRESTIGE_CONFIG.masterworkFrameBlueprintId)) {
    missingRequirements.push({
      key: "masterwork_frame",
      reason: "Requires Masterwork Frame"
    });
  }
  if (!eligibleItemIds.length) {
    missingRequirements.push({
      key: "eligible_item",
      reason: "Requires an Epic or Legendary Lv 15+ inventory item"
    });
  }
  if (state.player.completedHeroCommissions < PRESTIGE_CONFIG.requiredHeroCompletions) {
    missingRequirements.push({
      key: "hero_commissions",
      reason: `Requires ${PRESTIGE_CONFIG.requiredHeroCompletions} completed hero commissions`
    });
  }
  if (state.player.completedGuildContracts < PRESTIGE_CONFIG.requiredGuildCompletions) {
    missingRequirements.push({
      key: "guild_contracts",
      reason: `Requires ${PRESTIGE_CONFIG.requiredGuildCompletions} completed guild contracts`
    });
  }

  return {
    ok: missingRequirements.length === 0,
    missingRequirements,
    lockReasons: missingRequirements.map((requirement) => requirement.reason),
    eligibleItemIds
  };
}

export function performPrestige(state: GameState, context: PrestigeContext): GameState {
  const requirementResult = canPrestige(state);
  if (!requirementResult.ok) {
    throw new Error(requirementResult.lockReasons[0] ?? "Prestige requirements not met");
  }

  const selectedItemId = context.selectedItemId ?? requirementResult.eligibleItemIds[0];
  if (!selectedItemId || !requirementResult.eligibleItemIds.includes(selectedItemId)) {
    throw new Error("Selected item is not eligible for Masterwork");
  }

  const selectedItem = state.itemsById[selectedItemId];
  if (!selectedItem) throw new Error("Selected Masterwork item not found");

  const forgeSigilReward = PRESTIGE_CONFIG.forgeSigilReward;
  const newRunId = createId("run");
  const defaultBlueprintIds = BLUEPRINTS.filter(
    (blueprint) => "ownedByDefault" in blueprint && blueprint.ownedByDefault
  ).map((blueprint) => blueprint.id);
  const startingResources = getPrestigeStartingResources(state);
  const masterworkItemIds = uniqueIds([...state.prestige.masterworkItemIds, selectedItemId]);
  const legendaryItemIds = uniqueIds([
    ...state.prestige.legendaryItemIds,
    ...Object.values(state.itemsById)
      .filter((item) => item.isLegendary || item.rarity === "legendary")
      .map((item) => item.itemId)
  ]);
  const archivedItemsById = buildArchivedItemsById(
    state.itemsById,
    selectedItemId,
    masterworkItemIds,
    legendaryItemIds
  );
  const prestigeRecord: PrestigeRunRecord = {
    runId: state.player.currentRunId,
    completedAt: context.now,
    masterworkItemId: selectedItemId,
    forgeSigilsEarned: forgeSigilReward,
    repLevelAtPrestige: state.player.reputationLevel,
    forgeTierAtPrestige: state.workshop.forgeTier
  };

  const resetState: GameState = {
    ...state,
    player: {
      reputationXp: 0,
      reputationLevel: 1,
      completedGuildContracts: 0,
      completedHeroCommissions: 0,
      completedOrdersTotal: 0,
      craftedItemCount: 0,
      craftedRareCount: 0,
      craftedEpicCount: 0,
      craftedLegendaryCount: 0,
      currentRunId: newRunId,
      totalPrestiges: state.player.totalPrestiges + 1
    },
    resources: {
      gold: RESOURCE_CONFIG.gold.startingAmount,
      ironOre: startingResources.ironOre,
      wood: startingResources.wood,
      forgeSigil: state.resources.forgeSigil + forgeSigilReward,
      ironOreCap: RESOURCE_CONFIG.ironOre.startingCap,
      woodCap: RESOURCE_CONFIG.wood.startingCap,
      ironOreRatePerSecond: RESOURCE_CONFIG.ironOre.baseRatePerSecond,
      woodRatePerSecond: RESOURCE_CONFIG.wood.baseRatePerSecond
    },
    workshop: {
      forgeTier: 1,
      maxItemLevelCap: TIERS[1].maxItemLevel,
      forgeSlots: [{ slotId: createId("slot"), isUnlocked: true }],
      activeCraftsById: {},
      craftSpeedMultiplier: 1,
      itemLevelMinBonus: 0,
      rarityBonusTier: 0,
      guildContractSlots: 2,
      heroCommissionSlots: 1,
      manualGuildRefreshEnabled: false,
      inventorySlotBonusFromGold: 0,
      inventorySlotBonusFromSigils: state.workshop.inventorySlotBonusFromSigils
    },
    inventory: {
      itemIds: [],
      maxSlots: INVENTORY_CONFIG.startingSlots + state.workshop.inventorySlotBonusFromSigils
    },
    itemsById: archivedItemsById,
    blueprints: {
      ownedBlueprintIds: defaultBlueprintIds
    },
    upgrades: {
      ownedUpgradeIds: [],
      ownedPrestigeUpgradeIds: state.upgrades.ownedPrestigeUpgradeIds
    },
    orders: {
      guildContractsById: {},
      activeGuildContractIds: [],
      heroCommissionsById: {},
      activeHeroCommissionIds: [],
      nextHeroArrivalAt: context.now + TIMING_CONFIG.firstHeroArrivalSeconds * 1000
    },
    heroes: {
      heroesById: {}
    },
    prestige: {
      ...state.prestige,
      forgeSigilsEarnedTotal: state.prestige.forgeSigilsEarnedTotal + forgeSigilReward,
      masterworkItemIds,
      legendaryItemIds,
      completedPrestigeRuns: [...state.prestige.completedPrestigeRuns, prestigeRecord]
    },
    achievements: state.achievements,
    feedback: {
      eventsById: state.feedback.eventsById,
      pendingEventIds: []
    },
    timers: {
      lastResourceTickAt: context.now
    },
    lastSavedAt: context.now
  };

  const resetWithPermanentEffects = applyOwnedUpgradeEffects(resetState);

  return addLogEntry(resetWithPermanentEffects, {
    type: "prestige_completed",
    text: `Forged a legacy with ${selectedItem.displayName} and earned ${forgeSigilReward} Forge Sigil.`,
    relatedItemId: selectedItemId,
    createdAt: context.now
  });
}

function buildArchivedItemsById(
  itemsById: Record<EntityId, ItemState>,
  selectedItemId: EntityId,
  masterworkItemIds: readonly EntityId[],
  legendaryItemIds: readonly EntityId[]
): Record<EntityId, ItemState> {
  const archiveIds = new Set([...masterworkItemIds, ...legendaryItemIds, selectedItemId]);
  const archivedItems: Record<EntityId, ItemState> = {};

  for (const itemId of archiveIds) {
    const item = itemsById[itemId];
    if (!item) continue;
    const isMasterworkHistoryItem =
      itemId === selectedItemId || masterworkItemIds.includes(itemId);

    archivedItems[itemId] = {
      ...item,
      state: isMasterworkHistoryItem ? "archived_masterwork" : "archived_legendary",
      ownerId: undefined,
      isMasterwork: isMasterworkHistoryItem ? true : item.isMasterwork
    };
  }

  return archivedItems;
}

function uniqueIds(ids: EntityId[]): EntityId[] {
  return Array.from(new Set(ids));
}
