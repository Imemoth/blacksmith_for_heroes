import { BLUEPRINTS } from "../../config/blueprints.config";
import type { BlueprintConfig } from "../../types/blueprint.types";
import type { EntityId } from "../../types/common.types";
import type { GameState, HeroCommissionState } from "../../types/gameState.types";
import { addLogEntry } from "./eventLogSystem";
import { canSpendResources, spendResources } from "./resourceSystem";

export type BlueprintPurchaseState = {
  blueprint: BlueprintConfig;
  status: "owned" | "available" | "locked";
  reasons: string[];
  canAfford: boolean;
};

export function getBlueprintConfig(blueprintId: EntityId): BlueprintConfig | undefined {
  return BLUEPRINTS.find((blueprint) => blueprint.id === blueprintId);
}

export function getBlueprintPurchaseState(
  state: GameState,
  blueprintId: EntityId
): BlueprintPurchaseState | undefined {
  const blueprint = getBlueprintConfig(blueprintId);
  if (!blueprint) return undefined;

  const isOwned = state.blueprints.ownedBlueprintIds.includes(blueprintId);
  const reasons: string[] = [];

  if (state.player.reputationLevel < blueprint.requiredRepLevel) {
    reasons.push(`Requires Rep ${blueprint.requiredRepLevel}`);
  }
  if (state.workshop.forgeTier < blueprint.requiredForgeTier) {
    reasons.push(`Requires Tier ${blueprint.requiredForgeTier}`);
  }

  const canAfford = canSpendResources(state, { gold: blueprint.goldCost });

  if (!canAfford && !isOwned) {
    reasons.push(`Requires ${blueprint.goldCost} Gold`);
  }

  return {
    blueprint,
    status: isOwned ? "owned" : reasons.some((reason) => reason.startsWith("Requires Rep") || reason.startsWith("Requires Tier")) ? "locked" : "available",
    reasons,
    canAfford
  };
}

export function getBlueprintPurchaseStates(state: GameState): BlueprintPurchaseState[] {
  return BLUEPRINTS.map((blueprint) => getBlueprintPurchaseState(state, blueprint.id)).filter(
    (entry) => entry !== undefined
  );
}

export function getAvailableBlueprints(state: GameState): BlueprintConfig[] {
  return BLUEPRINTS.filter(
    (blueprint) =>
      !state.blueprints.ownedBlueprintIds.includes(blueprint.id) &&
      isBlueprintUnlockedForShop(state, blueprint.id)
  );
}

export function isBlueprintUnlockedForShop(state: GameState, blueprintId: EntityId): boolean {
  const blueprint = getBlueprintConfig(blueprintId);
  if (!blueprint) return false;
  if (state.blueprints.ownedBlueprintIds.includes(blueprintId)) return false;

  return (
    state.player.reputationLevel >= blueprint.requiredRepLevel &&
    state.workshop.forgeTier >= blueprint.requiredForgeTier
  );
}

export function canPurchaseBlueprint(
  state: GameState,
  blueprintId: EntityId
): { ok: boolean; reason?: string } {
  const purchaseState = getBlueprintPurchaseState(state, blueprintId);

  if (!purchaseState) return { ok: false, reason: "Blueprint not found" };
  if (purchaseState.status === "owned") return { ok: false, reason: "Blueprint already owned" };
  if (state.player.reputationLevel < purchaseState.blueprint.requiredRepLevel) {
    return { ok: false, reason: `Requires Rep ${purchaseState.blueprint.requiredRepLevel}` };
  }
  if (state.workshop.forgeTier < purchaseState.blueprint.requiredForgeTier) {
    return { ok: false, reason: `Requires Tier ${purchaseState.blueprint.requiredForgeTier}` };
  }
  if (!purchaseState.canAfford) {
    return { ok: false, reason: "Not enough Gold" };
  }

  return { ok: true };
}

export function purchaseBlueprint(
  state: GameState,
  blueprintId: EntityId,
  now: number
): GameState {
  const check = canPurchaseBlueprint(state, blueprintId);
  if (!check.ok) throw new Error(check.reason);

  const blueprint = getBlueprintConfig(blueprintId)!;
  const paidState = spendResources(state, { gold: blueprint.goldCost });
  const nextState: GameState = {
    ...paidState,
    blueprints: {
      ownedBlueprintIds: [...paidState.blueprints.ownedBlueprintIds, blueprintId]
    }
  };

  return addLogEntry(activateWaitingHeroCommissionsForBlueprint(nextState, blueprintId, now), {
    type: "blueprint_purchased",
    text: `Purchased ${blueprint.name} for ${blueprint.goldCost} Gold.`,
    createdAt: now
  });
}

export function getEffectiveBlueprintLevelBonus(blueprint: BlueprintConfig): number {
  if (blueprint.kind === "advanced") return 1 + blueprint.baseLevelBonus;
  return blueprint.baseLevelBonus;
}

function activateWaitingHeroCommissionsForBlueprint(
  state: GameState,
  blueprintId: EntityId,
  now: number
): GameState {
  let changed = false;
  const heroCommissionsById: Record<EntityId, HeroCommissionState> = {};

  for (const [commissionId, commission] of Object.entries(state.orders.heroCommissionsById)) {
    if (
      commission.status !== "waiting_for_blueprint" ||
      commission.requiredBlueprintId !== blueprintId ||
      commission.expiresAt <= now
    ) {
      heroCommissionsById[commissionId] = commission;
      continue;
    }

    changed = true;
    heroCommissionsById[commissionId] = {
      ...commission,
      status: "active",
      isMissingBlueprintCommission: false
    };
  }

  if (!changed) return state;

  return {
    ...state,
    orders: {
      ...state.orders,
      heroCommissionsById
    }
  };
}
