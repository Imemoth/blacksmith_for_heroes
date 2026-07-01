import { BLUEPRINTS } from "../../config/blueprints.config";
import { INVENTORY_CONFIG } from "../../config/inventory.config";
import { RESOURCE_CONFIG } from "../../config/resources.config";
import { TIERS } from "../../config/tiers.config";
import type { GameState } from "../../types/gameState.types";
import { createId } from "../../utils/ids";
import { defaultRng } from "../rng/rng";
import { initializeOrderState } from "../systems/orderSystem";

export function createInitialGameState(now: number): GameState {
  const defaultBlueprintIds = BLUEPRINTS.filter(
    (blueprint) => "ownedByDefault" in blueprint && blueprint.ownedByDefault
  ).map((blueprint) => blueprint.id);

  const baseState: GameState = {
    version: 1,
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
      currentRunId: createId("run"),
      totalPrestiges: 0
    },
    resources: {
      gold: RESOURCE_CONFIG.gold.startingAmount,
      ironOre: RESOURCE_CONFIG.ironOre.startingAmount,
      wood: RESOURCE_CONFIG.wood.startingAmount,
      forgeSigil: RESOURCE_CONFIG.forgeSigil.startingAmount,
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
      inventorySlotBonusFromSigils: 0
    },
    inventory: {
      itemIds: [],
      maxSlots: INVENTORY_CONFIG.startingSlots
    },
    itemsById: {},
    blueprints: {
      ownedBlueprintIds: defaultBlueprintIds
    },
    upgrades: {
      ownedUpgradeIds: [],
      ownedPrestigeUpgradeIds: []
    },
    orders: {
      guildContractsById: {},
      activeGuildContractIds: [],
      heroCommissionsById: {},
      activeHeroCommissionIds: []
    },
    heroes: {
      heroesById: {}
    },
    prestige: {
      forgeSigilsEarnedTotal: 0,
      forgeSigilsSpentTotal: 0,
      masterworkItemIds: [],
      legendaryItemIds: [],
      completedPrestigeRuns: []
    },
    achievements: {
      unlockedAchievementIds: [],
      unlockedAtById: {}
    },
    feedback: {
      eventsById: {},
      pendingEventIds: []
    },
    log: {
      entries: [],
      maxEntries: 200
    },
    timers: {
      lastResourceTickAt: now
    },
    currentCityId: "oakvale",
    lastSavedAt: now
  };

  return initializeOrderState(baseState, { now, rng: defaultRng });
}
