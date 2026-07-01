import { describe, expect, it } from "vitest";
import {
  acceptGuildContract,
  canItemSatisfyGuildRequirement,
  completeHeroCommission,
  deliverItemToGuildContract,
  dismissHeroCommission,
  ensureGuildContractSlots,
  expireHeroCommissions,
  generateGuildContract,
  generateHeroCommission,
  getScaledOrderLevelBand,
  getHeroArrivalIntervalMs,
  initializeOrderState,
  rotateOfferedGuildContracts,
  spawnDueHeroCommission
} from "../../src/game/systems/orderSystem";
import { addItemToInventory } from "../../src/game/systems/inventorySystem";
import type { GameState, GuildContractState, HeroCommissionState } from "../../src/types/gameState.types";
import type { ItemState } from "../../src/types/item.types";
import { createTestRng, makeTestGameState } from "../fixtures/testGameState";

function makeItem(overrides: Partial<ItemState> = {}): ItemState {
  return {
    itemId: "item_test",
    itemType: "sword",
    blueprintId: "bp_sword_base",
    displayName: "Iron Sword",
    rarity: "common",
    level: 3,
    power: 30,
    sellValue: 30,
    state: "inventory",
    createdAt: 0,
    runId: "run_test",
    isLegendary: false,
    isMasterwork: false,
    ...overrides
  };
}

function emptyOrdersState(now = 0): GameState {
  const state = makeTestGameState(now);
  return {
    ...state,
    orders: {
      guildContractsById: {},
      activeGuildContractIds: [],
      heroCommissionsById: {},
      activeHeroCommissionIds: []
    },
    heroes: {
      heroesById: {}
    }
  };
}

function withAcceptedSingleSwordContract(
  state: GameState,
  overrides: Partial<GuildContractState> = {}
): GameState {
  const contract: GuildContractState = {
    contractId: "contract_test",
    templateId: "contract_town_guard_swords_small",
    guildName: "Town Guard",
    guildType: "guard",
    requiredItems: [{ itemType: "sword", quantityRequired: 1, deliveredItemIds: [] }],
    minLevel: 2,
    goldReward: 100,
    reputationReward: 5,
    status: "accepted",
    generatedAt: 0,
    acceptedAt: 0,
    ...overrides
  };

  return {
    ...state,
    orders: {
      ...state.orders,
      guildContractsById: {
        ...state.orders.guildContractsById,
        [contract.contractId]: contract
      },
      activeGuildContractIds: [contract.contractId]
    }
  };
}

function withHeroCommission(
  state: GameState,
  overrides: Partial<HeroCommissionState> = {}
): GameState {
  const commission: HeroCommissionState = {
    commissionId: "commission_test",
    templateId: "hero_guard_sword",
    heroId: "hero_test",
    heroName: "Borin",
    heroClass: "guard",
    requiredBlueprintId: "bp_sword_base",
    requiredItemType: "sword",
    minLevel: 2,
    preferredAffix: "sharp",
    goldRewardMultiplier: 0.5,
    reputationReward: 30,
    baseFeedbackChance: 0.35,
    status: "active",
    isMissingBlueprintCommission: false,
    arrivedAt: 0,
    expiresAt: 90_000,
    ...overrides
  };

  return {
    ...state,
    heroes: {
      heroesById: {
        ...state.heroes.heroesById,
        [commission.heroId]: {
          heroId: commission.heroId,
          name: commission.heroName,
          heroClass: commission.heroClass,
          firstSeenAt: 0,
          lastSeenAt: 0,
          relationshipXp: 0,
          completedCommissionIds: [],
          equippedItemIds: [],
          historyEventIds: []
        }
      }
    },
    orders: {
      ...state.orders,
      heroCommissionsById: {
        ...state.orders.heroCommissionsById,
        [commission.commissionId]: commission
      },
      activeHeroCommissionIds: [commission.commissionId]
    }
  };
}

describe("orderSystem guild contracts", () => {
  it("initializes two offered guild contracts and a hero arrival timer", () => {
    const state = initializeOrderState(emptyOrdersState(0), {
      now: 0,
      rng: createTestRng([0])
    });

    expect(state.orders.activeGuildContractIds).toHaveLength(2);
    expect(state.orders.nextHeroArrivalAt).toBe(300_000);
    expect(
      state.orders.activeGuildContractIds.every(
        (id) => state.orders.guildContractsById[id].status === "offered"
      )
    ).toBe(true);
  });

  it("generates guild contracts only from owned blueprints", () => {
    const state = {
      ...emptyOrdersState(0),
      player: { ...emptyOrdersState(0).player, reputationLevel: 5, reputationXp: 1650 },
      blueprints: { ownedBlueprintIds: ["bp_sword_base"] }
    };

    for (let index = 0; index < 20; index += 1) {
      const contract = generateGuildContract(state, {
        now: 0,
        rng: createTestRng([0.999, 0.999, 0, 0, 0, 0])
      });

      expect(contract?.requiredItems.every((item) => item.itemType === "sword")).toBe(true);
    }
  });

  it("scales generated guild min level with Rep and Tier", () => {
    const state = {
      ...emptyOrdersState(0),
      player: { ...emptyOrdersState(0).player, reputationLevel: 4, reputationXp: 625 },
      workshop: { ...emptyOrdersState(0).workshop, forgeTier: 2, maxItemLevelCap: 15 },
      blueprints: {
        ownedBlueprintIds: ["bp_sword_base", "bp_bow_base", "bp_staff_base", "bp_axe_base"]
      }
    };
    const contract = generateGuildContract(state, {
      now: 0,
      rng: createTestRng([0.999, 0, 0, 0, 0.999])
    });

    expect(getScaledOrderLevelBand(state)).toEqual([7, 12]);
    expect(contract?.minLevel).toBe(12);
    expect(contract?.minLevel).toBeLessThanOrEqual(state.workshop.maxItemLevelCap);
  });

  it("applies Rep, Tier, city and weighted eligibility filters", () => {
    const state = {
      ...emptyOrdersState(0),
      currentCityId: "missing_city",
      player: { ...emptyOrdersState(0).player, reputationLevel: 5, reputationXp: 1650 },
      blueprints: { ownedBlueprintIds: ["bp_sword_base", "bp_bow_base", "bp_staff_base"] }
    };

    expect(generateGuildContract(state, { now: 0, rng: createTestRng([0]) })).toBeUndefined();
  });

  it("rotates offered contracts and keeps accepted contracts", () => {
    const state = ensureGuildContractSlots(emptyOrdersState(0), {
      now: 0,
      rng: createTestRng([0])
    });
    const [offeredId, acceptedId] = state.orders.activeGuildContractIds;
    const acceptedState = acceptGuildContract(state, acceptedId, 1000);
    const offered = acceptedState.orders.guildContractsById[offeredId];
    const readyToRotate = {
      ...acceptedState,
      orders: {
        ...acceptedState.orders,
        guildContractsById: {
          ...acceptedState.orders.guildContractsById,
          [offeredId]: {
            ...offered,
            rotateAt: 1000
          }
        }
      }
    };
    const rotatedState = rotateOfferedGuildContracts(readyToRotate, {
      now: 2000,
      rng: createTestRng([0])
    });

    expect(rotatedState.orders.guildContractsById[offeredId].status).toBe("rotated");
    expect(rotatedState.orders.guildContractsById[acceptedId].status).toBe("accepted");
    expect(rotatedState.orders.activeGuildContractIds).toContain(acceptedId);
  });

  it("rejects wrong, low-level, and rotated guild deliveries", () => {
    const state = withAcceptedSingleSwordContract(emptyOrdersState(0));
    const wrongItemState = addItemToInventory(state, makeItem({ itemType: "bow" }));
    const lowItemState = addItemToInventory(state, makeItem({ level: 1 }));
    const rotatedState = withAcceptedSingleSwordContract(emptyOrdersState(0), {
      status: "rotated"
    });
    const rotatedWithItem = addItemToInventory(rotatedState, makeItem());

    expect(() =>
      deliverItemToGuildContract(wrongItemState, "item_test", "contract_test", {
        now: 0,
        rng: createTestRng([0])
      })
    ).toThrow("Item does not satisfy guild contract");
    expect(() =>
      deliverItemToGuildContract(lowItemState, "item_test", "contract_test", {
        now: 0,
        rng: createTestRng([0])
      })
    ).toThrow("Item does not satisfy guild contract");
    expect(() =>
      deliverItemToGuildContract(rotatedWithItem, "item_test", "contract_test", {
        now: 0,
        rng: createTestRng([0])
      })
    ).toThrow("Guild contract is not accepted");
  });

  it("supports partial delivery and completes guild rewards", () => {
    const baseState = withAcceptedSingleSwordContract(emptyOrdersState(0), {
      requiredItems: [{ itemType: "sword", quantityRequired: 2, deliveredItemIds: [] }]
    });
    const withFirstItem = addItemToInventory(baseState, makeItem({ itemId: "item_one" }));
    const partialState = deliverItemToGuildContract(withFirstItem, "item_one", "contract_test", {
      now: 1000,
      rng: createTestRng([0])
    });
    const withSecondItem = addItemToInventory(partialState, makeItem({ itemId: "item_two" }));
    const completedState = deliverItemToGuildContract(
      withSecondItem,
      "item_two",
      "contract_test",
      { now: 2000, rng: createTestRng([0]) }
    );

    expect(partialState.orders.guildContractsById.contract_test.status).toBe("accepted");
    expect(partialState.itemsById.item_one.state).toBe("assigned_guild");
    expect(completedState.orders.guildContractsById.contract_test.status).toBe("completed");
    expect(completedState.resources.gold).toBe(100);
    expect(completedState.player.reputationXp).toBe(5);
    expect(completedState.player.completedGuildContracts).toBe(1);
    expect(completedState.player.completedOrdersTotal).toBe(1);
    expect(completedState.itemsById.item_two.state).toBe("assigned_guild");
    expect(completedState.orders.activeGuildContractIds).not.toContain("contract_test");
    expect(completedState.log.entries[0].type).toBe("guild_contract_completed");
  });

  it("identifies matching guild requirements", () => {
    const state = withAcceptedSingleSwordContract(emptyOrdersState(0));
    const contract = state.orders.guildContractsById.contract_test;

    expect(canItemSatisfyGuildRequirement(makeItem({ level: 2 }), contract)).toBe(true);
    expect(canItemSatisfyGuildRequirement(makeItem({ level: 1 }), contract)).toBe(false);
  });
});

describe("orderSystem hero commissions", () => {
  it("generates owned-blueprint hero commissions", () => {
    const commission = generateHeroCommission(emptyOrdersState(0), {
      now: 0,
      rng: createTestRng([0])
    });

    expect(commission).toMatchObject({
      requiredBlueprintId: "bp_sword_base",
      requiredItemType: "sword",
      status: "active",
      isMissingBlueprintCommission: false
    });
  });

  it("can generate shop-available but not-owned missing-blueprint heroes", () => {
    const state = {
      ...emptyOrdersState(0),
      player: { ...emptyOrdersState(0).player, reputationLevel: 2, reputationXp: 100 }
    };
    const commission = generateHeroCommission(state, {
      now: 0,
      rng: createTestRng([0.999, 0, 0, 0, 0])
    });

    expect(commission).toMatchObject({
      requiredBlueprintId: "bp_bow_base",
      requiredItemType: "bow",
      status: "waiting_for_blueprint",
      isMissingBlueprintCommission: true
    });
  });

  it("scales generated hero min level and caps it to current max item level", () => {
    const tierTwoState = {
      ...emptyOrdersState(0),
      player: { ...emptyOrdersState(0).player, reputationLevel: 5, reputationXp: 1650 },
      workshop: { ...emptyOrdersState(0).workshop, forgeTier: 2, maxItemLevelCap: 15 },
      blueprints: {
        ownedBlueprintIds: [
          "bp_sword_base",
          "bp_bow_base",
          "bp_staff_base",
          "bp_axe_base",
          "bp_sword_basic_pattern"
        ]
      }
    };
    const tierThreeState = {
      ...tierTwoState,
      workshop: { ...tierTwoState.workshop, forgeTier: 3, maxItemLevelCap: 20 }
    };
    const tierTwoCommission = generateHeroCommission(tierTwoState, {
      now: 0,
      rng: createTestRng([0.999, 0, 0.999, 0, 0])
    });
    const tierThreeCommission = generateHeroCommission(tierThreeState, {
      now: 0,
      rng: createTestRng([0.999, 0, 0.999, 0, 0])
    });

    expect(getScaledOrderLevelBand(tierTwoState, true)).toEqual([10, 15]);
    expect(tierTwoCommission?.templateId).toBe("hero_duelist_advanced_sword");
    expect(tierTwoCommission?.minLevel).toBe(15);
    expect(tierTwoCommission?.minLevel).toBeLessThanOrEqual(
      tierTwoState.workshop.maxItemLevelCap
    );
    expect(getScaledOrderLevelBand(tierThreeState, true)).toEqual([14, 20]);
    expect(tierThreeCommission?.minLevel).toBe(20);
  });

  it("does not generate unavailable blueprint heroes or a second missing-blueprint hero", () => {
    const repOneState = emptyOrdersState(0);
    const generatedAtRepOne = Array.from({ length: 10 }, () =>
      generateHeroCommission(repOneState, {
        now: 0,
        rng: createTestRng([0.999, 0, 0, 0, 0])
      })
    );
    const missingCommission = generateHeroCommission(
      {
        ...emptyOrdersState(0),
        player: { ...emptyOrdersState(0).player, reputationLevel: 2, reputationXp: 100 }
      },
      { now: 0, rng: createTestRng([0.999, 0, 0, 0, 0]) }
    )!;
    const stateWithMissing = {
      ...emptyOrdersState(0),
      player: { ...emptyOrdersState(0).player, reputationLevel: 2, reputationXp: 100 },
      orders: {
        ...emptyOrdersState(0).orders,
        heroCommissionsById: { [missingCommission.commissionId]: missingCommission },
        activeHeroCommissionIds: [missingCommission.commissionId]
      }
    };
    const secondCommission = generateHeroCommission(stateWithMissing, {
      now: 0,
      rng: createTestRng([0.999, 0, 0, 0, 0])
    });

    expect(generatedAtRepOne.every((commission) => commission?.requiredBlueprintId === "bp_sword_base")).toBe(
      true
    );
    expect(secondCommission?.requiredBlueprintId).toBe("bp_sword_base");
  });

  it("uses Rep-based hero arrival timers and spawns due heroes", () => {
    const repOneState = emptyOrdersState(0);
    const repThreeState = {
      ...emptyOrdersState(0),
      player: { ...emptyOrdersState(0).player, reputationLevel: 3, reputationXp: 250 }
    };
    const waitingState = {
      ...repOneState,
      orders: {
        ...repOneState.orders,
        nextHeroArrivalAt: 1000
      }
    };
    const spawnedState = spawnDueHeroCommission(waitingState, {
      now: 1000,
      rng: createTestRng([0])
    });

    expect(getHeroArrivalIntervalMs(repOneState)).toBe(300_000);
    expect(getHeroArrivalIntervalMs(repThreeState)).toBe(240_000);
    expect(spawnedState.orders.activeHeroCommissionIds).toHaveLength(1);
    expect(spawnedState.orders.nextHeroArrivalAt).toBe(301_000);
  });

  it("expires heroes after 90 seconds and blocks expired completion", () => {
    const state = withHeroCommission(emptyOrdersState(0));
    const expiredState = expireHeroCommissions(state, 90_000);
    const withItem = addItemToInventory(expiredState, makeItem());

    expect(expiredState.orders.heroCommissionsById.commission_test.status).toBe("expired");
    expect(expiredState.orders.activeHeroCommissionIds).toEqual([]);
    expect(() =>
      completeHeroCommission(withItem, "item_test", "commission_test", {
        now: 91_000,
        rng: createTestRng([0])
      })
    ).toThrow("Hero commission has expired");
  });

  it("dismisses heroes and enforces cooldown", () => {
    const state = withHeroCommission(emptyOrdersState(0));
    const dismissedState = dismissHeroCommission(state, "commission_test", 1000);
    const nextHeroState = withHeroCommission(dismissedState, {
      commissionId: "commission_next",
      heroId: "hero_next"
    });

    expect(dismissedState.orders.heroCommissionsById.commission_test.status).toBe("dismissed");
    expect(dismissedState.orders.heroDismissCooldownUntil).toBe(301_000);
    expect(() => dismissHeroCommission(nextHeroState, "commission_next", 2000)).toThrow(
      "Hero dismiss is on cooldown"
    );
  });

  it("completes hero rewards, counters, history, and item state", () => {
    const state = addItemToInventory(withHeroCommission(emptyOrdersState(0)), makeItem());
    const completedState = completeHeroCommission(state, "item_test", "commission_test", {
      now: 1000,
      rng: createTestRng([0.999])
    });

    expect(completedState.resources.gold).toBe(15);
    expect(completedState.player.reputationXp).toBe(30);
    expect(completedState.player.completedHeroCommissions).toBe(1);
    expect(completedState.player.completedOrdersTotal).toBe(1);
    expect(completedState.itemsById.item_test.state).toBe("assigned_hero");
    expect(completedState.inventory.itemIds).toEqual([]);
    expect(completedState.orders.heroCommissionsById.commission_test.status).toBe("completed");
    expect(completedState.heroes.heroesById.hero_test.completedCommissionIds).toContain(
      "commission_test"
    );
    expect(completedState.heroes.heroesById.hero_test.equippedItemIds).toContain("item_test");
    expect(completedState.log.entries[0].type).toBe("hero_commission_completed");
  });
});
