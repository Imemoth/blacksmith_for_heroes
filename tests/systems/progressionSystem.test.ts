import { describe, expect, it } from "vitest";
import { RESOURCE_CONFIG } from "../../src/config/resources.config";
import {
  canPurchaseBlueprint,
  getBlueprintPurchaseState,
  purchaseBlueprint
} from "../../src/game/systems/blueprintSystem";
import {
  calculateCraftCost,
  canStartCraft,
  completeCraft,
  startCraft
} from "../../src/game/systems/craftSystem";
import { rollRarity } from "../../src/game/systems/itemGenerationSystem";
import { completeHeroCommission, generateHeroCommission } from "../../src/game/systems/orderSystem";
import { addReputation, calculateReputationLevel } from "../../src/game/systems/reputationSystem";
import { canUpgradeTier, upgradeTier } from "../../src/game/systems/tierSystem";
import { purchaseUpgrade } from "../../src/game/systems/upgradeSystem";
import type { GameState } from "../../src/types/gameState.types";
import { createTestRng, makeTestGameState } from "../fixtures/testGameState";

function withGold(state: GameState, gold: number): GameState {
  return {
    ...state,
    resources: {
      ...state.resources,
      gold
    }
  };
}

function withRep(state: GameState, reputationXp: number): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      reputationXp,
      reputationLevel: calculateReputationLevel(reputationXp)
    }
  };
}

function withTier(state: GameState, forgeTier: number, maxItemLevelCap: number): GameState {
  return {
    ...state,
    workshop: {
      ...state.workshop,
      forgeTier,
      maxItemLevelCap
    }
  };
}

function withMaterials(state: GameState, ironOre = 100, wood = 100): GameState {
  return {
    ...state,
    resources: {
      ...state.resources,
      ironOre,
      wood,
      ironOreCap: Math.max(state.resources.ironOreCap, ironOre),
      woodCap: Math.max(state.resources.woodCap, wood)
    }
  };
}

describe("reputation progression", () => {
  it("calculates reputation levels from documented thresholds", () => {
    expect(calculateReputationLevel(0)).toBe(1);
    expect(calculateReputationLevel(99)).toBe(1);
    expect(calculateReputationLevel(100)).toBe(2);
    expect(calculateReputationLevel(249)).toBe(2);
    expect(calculateReputationLevel(250)).toBe(3);
    expect(calculateReputationLevel(624)).toBe(3);
    expect(calculateReputationLevel(625)).toBe(4);
    expect(calculateReputationLevel(1649)).toBe(4);
    expect(calculateReputationLevel(1650)).toBe(5);
  });

  it("adds reputation without spending it and logs level ups", () => {
    const state = makeTestGameState(0);
    const nextState = addReputation(state, 100, 1000);

    expect(nextState.player.reputationXp).toBe(100);
    expect(nextState.player.reputationLevel).toBe(2);
    expect(nextState.log.entries[0].type).toBe("rep_level_up");
  });
});

describe("blueprint shop", () => {
  it("derives owned, available, and locked blueprint states", () => {
    const state = withGold(makeTestGameState(0), 1000);
    const repTwoState = withRep(state, 100);

    expect(getBlueprintPurchaseState(state, "bp_sword_base")?.status).toBe("owned");
    expect(getBlueprintPurchaseState(state, "bp_bow_base")).toMatchObject({
      status: "locked",
      reasons: ["Requires Rep 2"]
    });
    expect(getBlueprintPurchaseState(repTwoState, "bp_bow_base")?.status).toBe("available");
    expect(getBlueprintPurchaseState(repTwoState, "bp_sword_basic_pattern")).toMatchObject({
      status: "locked",
      reasons: ["Requires Tier 2"]
    });
  });

  it("purchases blueprints with Gold and adds them to owned blueprints", () => {
    const state = withGold(withRep(makeTestGameState(0), 100), 200);
    const nextState = purchaseBlueprint(state, "bp_bow_base", 1000);

    expect(nextState.resources.gold).toBe(20);
    expect(nextState.blueprints.ownedBlueprintIds).toContain("bp_bow_base");
    expect(nextState.log.entries[0].type).toBe("blueprint_purchased");
  });

  it("rejects blueprint purchases for insufficient Gold, low Rep, and low Tier", () => {
    const lowGold = withGold(withRep(makeTestGameState(0), 100), 0);
    const lowRep = withGold(makeTestGameState(0), 1000);
    const lowTier = withGold(withRep(makeTestGameState(0), 100), 1000);

    expect(() => purchaseBlueprint(lowGold, "bp_bow_base", 0)).toThrow("Not enough Gold");
    expect(() => purchaseBlueprint(lowRep, "bp_bow_base", 0)).toThrow("Requires Rep 2");
    expect(() => purchaseBlueprint(lowTier, "bp_sword_basic_pattern", 0)).toThrow(
      "Requires Tier 2"
    );
    expect(canPurchaseBlueprint(lowRep, "bp_bow_base")).toEqual({
      ok: false,
      reason: "Requires Rep 2"
    });
  });

  it("makes newly purchased Bow, Staff, and Axe blueprints craftable", () => {
    const baseState = withMaterials(withGold(withRep(makeTestGameState(0), 625), 2000));

    for (const blueprintId of ["bp_bow_base", "bp_staff_base", "bp_axe_base"]) {
      const purchasedState = purchaseBlueprint(baseState, blueprintId, 1000);
      expect(canStartCraft(purchasedState, blueprintId)).toEqual({ ok: true });
    }
  });

  it("activates a waiting missing-blueprint hero after purchase and allows delivery", () => {
    let state = withMaterials(withGold(withRep(makeTestGameState(0), 100), 500));
    const commission = generateHeroCommission(state, {
      now: 0,
      rng: createTestRng([0.999, 0, 0, 0, 0])
    })!;

    state = {
      ...state,
      orders: {
        ...state.orders,
        heroCommissionsById: {
          [commission.commissionId]: commission
        },
        activeHeroCommissionIds: [commission.commissionId]
      }
    };

    expect(commission).toMatchObject({
      requiredBlueprintId: "bp_bow_base",
      status: "waiting_for_blueprint",
      isMissingBlueprintCommission: true
    });

    const purchasedState = purchaseBlueprint(state, "bp_bow_base", 1000);
    const activatedCommission =
      purchasedState.orders.heroCommissionsById[commission.commissionId];

    expect(activatedCommission.status).toBe("active");
    expect(activatedCommission.isMissingBlueprintCommission).toBe(false);
    expect(canStartCraft(purchasedState, "bp_bow_base")).toEqual({ ok: true });

    const craftingState = startCraft(
      purchasedState,
      "bp_bow_base",
      purchasedState.workshop.forgeSlots[0].slotId,
      { now: 2000, rng: createTestRng([0]) }
    );
    const craft = Object.values(craftingState.workshop.activeCraftsById)[0];
    const completedCraftState = completeCraft(craftingState, craft.craftId, {
      now: 15_000,
      rng: createTestRng([0.999, 0])
    });
    const itemId = completedCraftState.inventory.itemIds[0];
    const item = completedCraftState.itemsById[itemId];
    const deliveredState = completeHeroCommission(
      completedCraftState,
      itemId,
      commission.commissionId,
      { now: 16_000, rng: createTestRng([0]) }
    );

    expect(item.itemType).toBe("bow");
    expect(item.level).toBeGreaterThanOrEqual(activatedCommission.minLevel);
    expect(deliveredState.orders.heroCommissionsById[commission.commissionId].status).toBe(
      "completed"
    );
    expect(deliveredState.itemsById[itemId].state).toBe("assigned_hero");
  });
});

describe("workshop upgrades", () => {
  it("purchases upgrades and applies rate, speed, quality, and rarity effects", () => {
    let state = withGold(makeTestGameState(0), 2000);

    state = purchaseUpgrade(state, "better_mine_i", 1000);
    state = purchaseUpgrade(state, "better_lumber_yard_i", 1000);
    state = purchaseUpgrade(state, "better_anvil_i", 1000);
    state = purchaseUpgrade(state, "fine_tools_i", 1000);
    state = purchaseUpgrade(state, "polishing_kit_i", 1000);

    expect(state.upgrades.ownedUpgradeIds).toEqual([
      "better_mine_i",
      "better_lumber_yard_i",
      "better_anvil_i",
      "fine_tools_i",
      "polishing_kit_i"
    ]);
    expect(state.resources.ironOreRatePerSecond).toBe(
      RESOURCE_CONFIG.ironOre.baseRatePerSecond * 1.5
    );
    expect(state.resources.woodRatePerSecond).toBe(RESOURCE_CONFIG.wood.baseRatePerSecond * 1.5);
    expect(state.workshop.craftSpeedMultiplier).toBe(1.15);
    expect(state.workshop.itemLevelMinBonus).toBe(1);
    expect(state.workshop.rarityBonusTier).toBe(1);
  });

  it("uses the Polishing Kit rarity table", () => {
    const baselineTierThree = withTier(makeTestGameState(0), 3, 20);
    const polishedTierThree = {
      ...baselineTierThree,
      workshop: {
        ...baselineTierThree.workshop,
        rarityBonusTier: 1
      }
    };

    expect(rollRarity(baselineTierThree, { now: 0, rng: createTestRng([0.994]) })).toBe("rare");
    expect(rollRarity(polishedTierThree, { now: 0, rng: createTestRng([0.994]) })).toBe("epic");
  });
});

describe("forge tier progression", () => {
  it("checks Tier 2 upgrade requirements", () => {
    const missingAnvil = {
      ...withGold(makeTestGameState(0), 700),
      player: {
        ...makeTestGameState(0).player,
        completedOrdersTotal: 10
      }
    };
    const missingOrders = {
      ...withGold(makeTestGameState(0), 700),
      upgrades: {
        ownedUpgradeIds: ["better_anvil_i"],
        ownedPrestigeUpgradeIds: []
      }
    };
    const ready = {
      ...missingAnvil,
      resources: {
        ...missingAnvil.resources,
        gold: 900
      },
      upgrades: {
        ownedUpgradeIds: ["better_anvil_i"],
        ownedPrestigeUpgradeIds: []
      }
    };
    const upgradedState = upgradeTier(ready, 2, 1000);

    expect(canUpgradeTier(missingAnvil, 2).reason).toBe("Requires better_anvil_i");
    expect(canUpgradeTier(missingOrders, 2).reason).toBe("Requires 10 completed orders");
    expect(upgradedState.resources.gold).toBe(200);
    expect(upgradedState.workshop.forgeTier).toBe(2);
    expect(upgradedState.workshop.maxItemLevelCap).toBe(15);
    expect(upgradedState.log.entries[0].type).toBe("tier_upgraded");
  });

  it("checks Tier 3 requirements without hard Reputation gating", () => {
    const tierTwo = withTier(withGold(makeTestGameState(0), 1800), 2, 15);
    const missingEpic = {
      ...tierTwo,
      player: {
        ...tierTwo.player,
        completedOrdersTotal: 25,
        reputationLevel: 1,
        reputationXp: 0
      }
    };
    const ready = {
      ...missingEpic,
      player: {
        ...missingEpic.player,
        craftedEpicCount: 1
      }
    };
    const upgradedState = upgradeTier(ready, 3, 1000);

    expect(canUpgradeTier(missingEpic, 3).reason).toBe("Requires 1 Epic craft");
    expect(upgradedState.player.reputationLevel).toBe(1);
    expect(upgradedState.resources.gold).toBe(0);
    expect(upgradedState.workshop.forgeTier).toBe(3);
    expect(upgradedState.workshop.maxItemLevelCap).toBe(20);
  });

  it("blocks Legendary rolls before Tier 3 and allows them at Tier 3", () => {
    const tierTwo = withTier(makeTestGameState(0), 2, 15);
    const tierThree = withTier(makeTestGameState(0), 3, 20);

    expect(rollRarity(tierTwo, { now: 0, rng: createTestRng([0.999999]) })).not.toBe(
      "legendary"
    );
    expect(rollRarity(tierThree, { now: 0, rng: createTestRng([0.999999]) })).toBe(
      "legendary"
    );
  });
});

describe("advanced blueprint crafting", () => {
  it("modifies material cost, craft time, and item level", () => {
    const baseState = withMaterials(
      withTier(withGold(withRep(makeTestGameState(0), 100), 1000), 2, 15),
      20,
      20
    );
    const state = {
      ...baseState,
      blueprints: {
        ownedBlueprintIds: [
          ...baseState.blueprints.ownedBlueprintIds,
          "bp_sword_basic_pattern"
        ]
      }
    };
    const slotId = state.workshop.forgeSlots[0].slotId;
    const craftingState = startCraft(state, "bp_sword_basic_pattern", slotId, {
      now: 0,
      rng: createTestRng([0])
    });
    const craft = Object.values(craftingState.workshop.activeCraftsById)[0];
    const completedState = completeCraft(craftingState, craft.craftId, {
      now: 11_000,
      rng: createTestRng([0, 0])
    });
    const item = completedState.itemsById[completedState.inventory.itemIds[0]];

    expect(calculateCraftCost("bp_sword_basic_pattern")).toEqual({ ironOre: 5, wood: 2 });
    expect(craft.durationSeconds).toBe(11);
    expect(craftingState.resources.ironOre).toBe(15);
    expect(craftingState.resources.wood).toBe(18);
    expect(item.level).toBe(6);
    expect(item.blueprintId).toBe("bp_sword_basic_pattern");
  });
});
