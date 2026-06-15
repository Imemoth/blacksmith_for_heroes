import { TIERS } from "../../config/tiers.config";
import type { EntityId } from "../../types/common.types";
import type { GameState } from "../../types/gameState.types";
import { addLogEntry } from "./eventLogSystem";
import { canSpendResources, spendResources } from "./resourceSystem";

export type TierUpgradeState = {
  targetTier: number;
  name: string;
  status: "owned" | "available" | "locked";
  reasons: string[];
  goldCost: number;
  maxItemLevel: number;
  legendaryEnabled: boolean;
  canAfford: boolean;
};

export function getTierUpgradeState(
  state: GameState,
  targetTier: number
): TierUpgradeState | undefined {
  const tier = TIERS[targetTier as keyof typeof TIERS];
  if (!tier) return undefined;

  const isOwned = state.workshop.forgeTier >= targetTier;
  const reasons = getTierRequirementReasons(state, targetTier);
  const goldCost = "goldCost" in tier ? tier.goldCost : 0;
  const canAfford = canSpendResources(state, { gold: goldCost });

  if (!canAfford && !isOwned) {
    reasons.push(`Requires ${goldCost} Gold`);
  }

  return {
    targetTier,
    name: tier.name,
    status: isOwned ? "owned" : reasons.some((reason) => !reason.includes("Gold")) ? "locked" : "available",
    reasons,
    goldCost,
    maxItemLevel: tier.maxItemLevel,
    legendaryEnabled: tier.legendaryEnabled,
    canAfford
  };
}

export function getTierUpgradeStates(state: GameState): TierUpgradeState[] {
  return Object.values(TIERS)
    .filter((tier) => tier.tier > 1)
    .map((tier) => getTierUpgradeState(state, tier.tier))
    .filter((entry) => entry !== undefined);
}

export function canUpgradeTier(
  state: GameState,
  targetTier: number
): { ok: boolean; reason?: string } {
  const tierState = getTierUpgradeState(state, targetTier);
  if (!tierState) return { ok: false, reason: "Tier not found" };
  if (tierState.status === "owned") return { ok: false, reason: "Tier already owned" };

  const hardReason = getTierRequirementReasons(state, targetTier)[0];
  if (hardReason) return { ok: false, reason: hardReason };
  if (!tierState.canAfford) return { ok: false, reason: "Not enough Gold" };

  return { ok: true };
}

export function upgradeTier(state: GameState, targetTier: number, now: number): GameState {
  const check = canUpgradeTier(state, targetTier);
  if (!check.ok) throw new Error(check.reason);

  const tier = TIERS[targetTier as keyof typeof TIERS];
  const goldCost = "goldCost" in tier ? tier.goldCost : 0;
  const paidState = spendResources(state, { gold: goldCost });
  const nextState: GameState = {
    ...paidState,
    workshop: {
      ...paidState.workshop,
      forgeTier: targetTier,
      maxItemLevelCap: tier.maxItemLevel
    }
  };

  return addLogEntry(nextState, {
    type: "tier_upgraded",
    text: `Upgraded to ${tier.name}.`,
    createdAt: now
  });
}

function getTierRequirementReasons(state: GameState, targetTier: number): string[] {
  const tier = TIERS[targetTier as keyof typeof TIERS];
  if (!tier) return ["Tier not found"];
  if (state.workshop.forgeTier >= targetTier) return [];

  const reasons: string[] = [];

  if (targetTier !== state.workshop.forgeTier + 1) {
    reasons.push("Upgrade tiers in order");
  }

  if ("requirements" in tier) {
    const requirements = tier.requirements;
    if (
      "completedOrdersTotal" in requirements &&
      state.player.completedOrdersTotal < requirements.completedOrdersTotal
    ) {
      reasons.push(`Requires ${requirements.completedOrdersTotal} completed orders`);
    }
    if (
      "craftedEpicCount" in requirements &&
      state.player.craftedEpicCount < requirements.craftedEpicCount
    ) {
      reasons.push(`Requires ${requirements.craftedEpicCount} Epic craft`);
    }
    if (
      "upgradeOwned" in requirements &&
      !state.upgrades.ownedUpgradeIds.includes(requirements.upgradeOwned as EntityId)
    ) {
      reasons.push(`Requires ${requirements.upgradeOwned}`);
    }
    if (
      "requiredCurrentTier" in requirements &&
      state.workshop.forgeTier < requirements.requiredCurrentTier
    ) {
      reasons.push(`Requires Tier ${requirements.requiredCurrentTier}`);
    }
  }

  return reasons;
}
