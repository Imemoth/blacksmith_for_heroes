import { INVENTORY_CONFIG } from "../../config/inventory.config";
import { RESOURCE_CONFIG } from "../../config/resources.config";
import { WORKSHOP_UPGRADES } from "../../config/upgrades.config";
import type { EntityId } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";
import type { UpgradeConfig } from "../../types/upgrade.types";
import { addLogEntry } from "./eventLogSystem";
import { canSpendResources, spendResources } from "./resourceSystem";

export type UpgradePurchaseState = {
  upgrade: UpgradeConfig;
  status: "owned" | "available" | "locked";
  reasons: string[];
  canAfford: boolean;
};

export function getUpgradeConfig(upgradeId: EntityId): UpgradeConfig | undefined {
  return WORKSHOP_UPGRADES.find((upgrade) => upgrade.id === upgradeId);
}

export function getUpgradePurchaseState(
  state: GameState,
  upgradeId: EntityId
): UpgradePurchaseState | undefined {
  const upgrade = getUpgradeConfig(upgradeId);
  if (!upgrade) return undefined;

  const isOwned = state.upgrades.ownedUpgradeIds.includes(upgradeId);
  const reasons = getUpgradeRequirementReasons(state, upgrade);
  const canAfford = canSpendResources(state, {
    gold: upgrade.goldCost ?? 0,
    forgeSigil: upgrade.forgeSigilCost ?? 0
  });

  if (!canAfford && !isOwned) {
    if (upgrade.goldCost) reasons.push(`Requires ${upgrade.goldCost} Gold`);
    if (upgrade.forgeSigilCost) reasons.push(`Requires ${upgrade.forgeSigilCost} Forge Sigils`);
  }

  return {
    upgrade,
    status: isOwned ? "owned" : reasons.some((reason) => !reason.includes("Gold") && !reason.includes("Forge Sigils")) ? "locked" : "available",
    reasons,
    canAfford
  };
}

export function getUpgradePurchaseStates(state: GameState): UpgradePurchaseState[] {
  return WORKSHOP_UPGRADES.map((upgrade) => getUpgradePurchaseState(state, upgrade.id)).filter(
    (entry) => entry !== undefined
  );
}

export function canPurchaseUpgrade(
  state: GameState,
  upgradeId: EntityId
): { ok: boolean; reason?: string } {
  const purchaseState = getUpgradePurchaseState(state, upgradeId);

  if (!purchaseState) return { ok: false, reason: "Upgrade not found" };
  if (purchaseState.status === "owned") return { ok: false, reason: "Upgrade already owned" };

  const hardReason = getUpgradeRequirementReasons(state, purchaseState.upgrade)[0];
  if (hardReason) return { ok: false, reason: hardReason };
  if (!purchaseState.canAfford) return { ok: false, reason: "Not enough Gold" };

  return { ok: true };
}

export function purchaseUpgrade(
  state: GameState,
  upgradeId: EntityId,
  now: number
): GameState {
  const check = canPurchaseUpgrade(state, upgradeId);
  if (!check.ok) throw new Error(check.reason);

  const upgrade = getUpgradeConfig(upgradeId)!;
  const paidState = spendResources(state, {
    gold: upgrade.goldCost ?? 0,
    forgeSigil: upgrade.forgeSigilCost ?? 0
  });
  const nextState = applyOwnedUpgradeEffects({
    ...paidState,
    upgrades: {
      ...paidState.upgrades,
      ownedUpgradeIds: [...paidState.upgrades.ownedUpgradeIds, upgradeId]
    }
  });

  return addLogEntry(nextState, {
    type: "upgrade_purchased",
    text: `Purchased ${upgrade.name}.`,
    createdAt: now
  });
}

export function applyOwnedUpgradeEffects(state: GameState): GameState {
  const ownedUpgrades = WORKSHOP_UPGRADES.filter((upgrade) =>
    state.upgrades.ownedUpgradeIds.includes(upgrade.id)
  );
  const effectTotals = ownedUpgrades.reduce(
    (totals, upgrade) => ({
      ironOreRateMultiplierAdd:
        totals.ironOreRateMultiplierAdd + (upgrade.effect.ironOreRateMultiplierAdd ?? 0),
      woodRateMultiplierAdd:
        totals.woodRateMultiplierAdd + (upgrade.effect.woodRateMultiplierAdd ?? 0),
      craftSpeedMultiplierAdd:
        totals.craftSpeedMultiplierAdd + (upgrade.effect.craftSpeedMultiplierAdd ?? 0),
      itemLevelMinBonusAdd:
        totals.itemLevelMinBonusAdd + (upgrade.effect.itemLevelMinBonusAdd ?? 0),
      rarityBonusTier: Math.max(totals.rarityBonusTier, upgrade.effect.rarityBonusTier ?? 0),
      inventorySlotAdd: totals.inventorySlotAdd + (upgrade.effect.inventorySlotAdd ?? 0),
      guildContractSlotAdd:
        totals.guildContractSlotAdd + (upgrade.effect.guildContractSlotAdd ?? 0),
      heroCommissionSlotAdd:
        totals.heroCommissionSlotAdd + (upgrade.effect.heroCommissionSlotAdd ?? 0),
      manualGuildRefreshEnabled:
        totals.manualGuildRefreshEnabled || Boolean(upgrade.effect.manualGuildRefreshEnabled)
    }),
    {
      ironOreRateMultiplierAdd: 0,
      woodRateMultiplierAdd: 0,
      craftSpeedMultiplierAdd: 0,
      itemLevelMinBonusAdd: 0,
      rarityBonusTier: 0,
      inventorySlotAdd: 0,
      guildContractSlotAdd: 0,
      heroCommissionSlotAdd: 0,
      manualGuildRefreshEnabled: false
    }
  );

  return {
    ...state,
    resources: {
      ...state.resources,
      ironOreRatePerSecond:
        RESOURCE_CONFIG.ironOre.baseRatePerSecond * (1 + effectTotals.ironOreRateMultiplierAdd),
      woodRatePerSecond:
        RESOURCE_CONFIG.wood.baseRatePerSecond * (1 + effectTotals.woodRateMultiplierAdd)
    },
    workshop: {
      ...state.workshop,
      craftSpeedMultiplier: 1 + effectTotals.craftSpeedMultiplierAdd,
      itemLevelMinBonus: effectTotals.itemLevelMinBonusAdd,
      rarityBonusTier: effectTotals.rarityBonusTier,
      guildContractSlots: 2 + effectTotals.guildContractSlotAdd,
      heroCommissionSlots: 1 + effectTotals.heroCommissionSlotAdd,
      manualGuildRefreshEnabled: effectTotals.manualGuildRefreshEnabled,
      inventorySlotBonusFromGold: effectTotals.inventorySlotAdd
    },
    inventory: {
      ...state.inventory,
      maxSlots:
        INVENTORY_CONFIG.startingSlots +
        effectTotals.inventorySlotAdd +
        state.workshop.inventorySlotBonusFromSigils
    }
  };
}

function getUpgradeRequirementReasons(state: GameState, upgrade: UpgradeConfig): string[] {
  const requirements = upgrade.requirements;
  if (!requirements) return [];

  const reasons: string[] = [];
  if (
    requirements.upgradeOwned &&
    !state.upgrades.ownedUpgradeIds.includes(requirements.upgradeOwned)
  ) {
    reasons.push(`Requires ${requirements.upgradeOwned}`);
  }
  if (
    requirements.completedOrdersTotal !== undefined &&
    state.player.completedOrdersTotal < requirements.completedOrdersTotal
  ) {
    reasons.push(`Requires ${requirements.completedOrdersTotal} completed orders`);
  }
  if (
    requirements.craftedEpicCount !== undefined &&
    state.player.craftedEpicCount < requirements.craftedEpicCount
  ) {
    reasons.push(`Requires ${requirements.craftedEpicCount} Epic craft`);
  }
  if (requirements.minTier !== undefined && state.workshop.forgeTier < requirements.minTier) {
    reasons.push(`Requires Tier ${requirements.minTier}`);
  }
  if (
    requirements.minPrestigeCount !== undefined &&
    state.player.totalPrestiges < requirements.minPrestigeCount
  ) {
    reasons.push(`Requires ${requirements.minPrestigeCount} Prestige`);
  }

  return reasons;
}
