import { describe, expect, it } from "vitest";
import { completeCraft, startCraft } from "../../src/game/systems/craftSystem";
import { unlockCraftAchievementForItem } from "../../src/game/systems/achievementSystem";
import { loadGame, saveGame } from "../../src/game/systems/saveSystem";
import type { GameState } from "../../src/types/gameState.types";
import type { ItemState } from "../../src/types/item.types";
import {
  createMemoryStorage,
  createTestRng,
  makeTestGameState
} from "../fixtures/testGameState";

function makeItem(overrides: Partial<ItemState>): ItemState {
  return {
    itemId: "item_test",
    itemType: "bow",
    blueprintId: "bp_bow_base",
    displayName: "Mastercrafted Hunter Bow",
    rarity: "epic",
    level: 5,
    power: 80,
    sellValue: 80,
    state: "inventory",
    createdAt: 0,
    runId: "run_test",
    isLegendary: false,
    isMasterwork: false,
    ...overrides
  };
}

function withOwnedBowAndMaterials(state: GameState): GameState {
  return {
    ...state,
    blueprints: {
      ownedBlueprintIds: [...state.blueprints.ownedBlueprintIds, "bp_bow_base"]
    },
    resources: {
      ...state.resources,
      ironOre: 20,
      wood: 20,
      ironOreCap: 30,
      woodCap: 30
    }
  };
}

describe("achievementSystem", () => {
  it("unlocks first Epic Bow from craft completion", () => {
    const state = withOwnedBowAndMaterials(makeTestGameState(0));
    const craftingState = startCraft(state, "bp_bow_base", state.workshop.forgeSlots[0].slotId, {
      now: 0,
      rng: createTestRng([0])
    });
    const craft = Object.values(craftingState.workshop.activeCraftsById)[0];
    const completedState = completeCraft(craftingState, craft.craftId, {
      now: 13_000,
      rng: createTestRng([0, 0.996, 0])
    });

    expect(completedState.achievements.unlockedAchievementIds).toContain("first_epic_bow");
    expect(completedState.log.entries[0].type).toBe("achievement_unlocked");
  });

  it("does not duplicate an already unlocked Epic Bow achievement", () => {
    const once = unlockCraftAchievementForItem(
      makeTestGameState(0),
      makeItem({ itemId: "item_one" }),
      1000
    );
    const twice = unlockCraftAchievementForItem(
      once,
      makeItem({ itemId: "item_two" }),
      2000
    );

    expect(
      twice.achievements.unlockedAchievementIds.filter((id) => id === "first_epic_bow")
    ).toHaveLength(1);
  });

  it("unlocks separate Epic achievements by weapon type", () => {
    let state = unlockCraftAchievementForItem(
      makeTestGameState(0),
      makeItem({ itemType: "bow" }),
      1000
    );
    state = unlockCraftAchievementForItem(
      state,
      makeItem({
        itemId: "item_sword",
        itemType: "sword",
        blueprintId: "bp_sword_base",
        displayName: "Mastercrafted Iron Sword"
      }),
      2000
    );

    expect(state.achievements.unlockedAchievementIds).toEqual([
      "first_epic_bow",
      "first_epic_sword"
    ]);
  });

  it("unlocks first Legendary achievements by weapon type", () => {
    const state = unlockCraftAchievementForItem(
      makeTestGameState(0),
      makeItem({
        rarity: "legendary",
        itemType: "staff",
        blueprintId: "bp_staff_base",
        displayName: "Dragonsbreath of Magimania",
        isLegendary: true
      }),
      1000
    );

    expect(state.achievements.unlockedAchievementIds).toContain("first_legendary_staff");
  });

  it("preserves achievements through save/load", () => {
    const storage = createMemoryStorage();
    const state = unlockCraftAchievementForItem(
      makeTestGameState(0),
      makeItem({ itemType: "axe", blueprintId: "bp_axe_base" }),
      1000
    );

    saveGame(state, 1000, storage);
    const loaded = loadGame(1000, storage);

    expect(loaded.achievements.unlockedAchievementIds).toContain("first_epic_axe");
    expect(loaded.achievements.unlockedAtById.first_epic_axe).toBe(1000);
  });
});
