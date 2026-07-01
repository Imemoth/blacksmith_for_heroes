import { describe, expect, it } from "vitest";
import { addItemToInventory } from "../../src/game/systems/inventorySystem";
import { completeHeroCommission } from "../../src/game/systems/orderSystem";
import { calculateFeedbackChance } from "../../src/game/systems/feedbackSystem";
import { loadGame, saveGame, SAVE_KEY } from "../../src/game/systems/saveSystem";
import type { GameState, HeroCommissionState } from "../../src/types/gameState.types";
import type { ItemState } from "../../src/types/item.types";
import {
  createMemoryStorage,
  createTestRng,
  makeTestGameState
} from "../fixtures/testGameState";

function makeItem(overrides: Partial<ItemState> = {}): ItemState {
  return {
    itemId: "item_test",
    itemType: "sword",
    blueprintId: "bp_sword_base",
    displayName: "Sharp Iron Sword",
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

function makeCommission(overrides: Partial<HeroCommissionState> = {}): HeroCommissionState {
  return {
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
}

function withHeroCommissionAndItem(
  state: GameState,
  commission = makeCommission(),
  item = makeItem()
): GameState {
  return addItemToInventory(
    {
      ...state,
      heroes: {
        heroesById: {
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
          [commission.commissionId]: commission
        },
        activeHeroCommissionIds: [commission.commissionId]
      }
    },
    item
  );
}

describe("feedbackSystem", () => {
  it("calculates feedback chance with rarity, affix, overdelivery, and cap", () => {
    const commission = makeCommission({ baseFeedbackChance: 0.5, minLevel: 1 });
    const item = makeItem({
      rarity: "legendary",
      level: 20,
      affix: { type: "sharp", value: 2 }
    });

    expect(calculateFeedbackChance(commission, item)).toBe(0.9);
    expect(calculateFeedbackChance(makeCommission(), makeItem({ rarity: "rare" }))).toBeCloseTo(
      0.49
    );
  });

  it("creates feedback, reward, popup state, hero history, and log on hero completion", () => {
    const item = makeItem({
      rarity: "rare",
      affix: { type: "sharp", value: 2 }
    });
    const state = withHeroCommissionAndItem(makeTestGameState(0), makeCommission(), item);
    const completedState = completeHeroCommission(state, "item_test", "commission_test", {
      now: 1000,
      rng: createTestRng([0, 0])
    });
    const feedbackId = completedState.feedback.pendingEventIds[0];
    const feedback = completedState.feedback.eventsById[feedbackId];

    expect(feedback).toMatchObject({
      heroName: "Borin",
      itemName: "Sharp Iron Sword",
      commissionId: "commission_test",
      itemId: "item_test"
    });
    expect(completedState.player.reputationXp).toBe(36);
    expect(completedState.heroes.heroesById.hero_test.historyEventIds).toContain(feedbackId);
    expect(completedState.log.entries[0].type).toBe("hero_feedback");
  });

  it("does not create feedback when the chance roll fails", () => {
    const state = withHeroCommissionAndItem(makeTestGameState(0));
    const completedState = completeHeroCommission(state, "item_test", "commission_test", {
      now: 1000,
      rng: createTestRng([0.999])
    });

    expect(completedState.feedback.pendingEventIds).toEqual([]);
    expect(completedState.log.entries[0].type).toBe("hero_commission_completed");
  });

  it("preserves feedback events and pending popup state through save/load", () => {
    const storage = createMemoryStorage();
    const state = withHeroCommissionAndItem(
      makeTestGameState(0),
      makeCommission(),
      makeItem({ rarity: "fine", affix: { type: "sharp", value: 2 } })
    );
    const completedState = completeHeroCommission(state, "item_test", "commission_test", {
      now: 1000,
      rng: createTestRng([0, 0])
    });

    saveGame(completedState, 1000, storage);
    const loaded = loadGame(1000, storage);
    const feedbackId = completedState.feedback.pendingEventIds[0];

    expect(JSON.parse(storage.dump()[SAVE_KEY]).gameState.feedback.pendingEventIds).toEqual([
      feedbackId
    ]);
    expect(loaded.feedback.pendingEventIds).toEqual([feedbackId]);
    expect(loaded.feedback.eventsById[feedbackId].text).toContain("Borin");
  });
});
