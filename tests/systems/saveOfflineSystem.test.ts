import { describe, expect, it } from "vitest";
import { startCraft } from "../../src/game/systems/craftSystem";
import { CURRENT_SAVE_VERSION, loadGame, saveGame, SAVE_KEY } from "../../src/game/systems/saveSystem";
import type { ItemState } from "../../src/types/item.types";
import { makeTestGameState, createMemoryStorage, createTestRng } from "../fixtures/testGameState";

const SWORD_BLUEPRINT_ID = "bp_sword_base";

describe("save and offline progress", () => {
  it("saves and loads GameState with a save version", () => {
    const storage = createMemoryStorage();
    const state = {
      ...makeTestGameState(0),
      resources: {
        ...makeTestGameState(0).resources,
        gold: 42
      }
    };
    const save = saveGame(state, 0, storage);
    const loaded = loadGame(0, storage);

    expect(save.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(JSON.parse(storage.dump()[SAVE_KEY]).saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(loaded.resources.gold).toBe(42);
    expect(loaded.blueprints.ownedBlueprintIds).toContain(SWORD_BLUEPRINT_ID);
  });

  it("adds offline Iron Ore and Wood up to caps", () => {
    const storage = createMemoryStorage();
    const state = {
      ...makeTestGameState(0),
      resources: {
        ...makeTestGameState(0).resources,
        ironOre: 0,
        wood: 0
      }
    };

    saveGame(state, 0, storage);
    const loaded = loadGame(1000 * 60 * 60 * 9, storage);

    expect(loaded.resources.ironOre).toBe(30);
    expect(loaded.resources.wood).toBe(25);
  });

  it("does not reward negative elapsed time", () => {
    const storage = createMemoryStorage();
    const state = {
      ...makeTestGameState(10_000),
      resources: {
        ...makeTestGameState(10_000).resources,
        ironOre: 0,
        wood: 0
      }
    };

    saveGame(state, 10_000, storage);
    const loaded = loadGame(0, storage);

    expect(loaded.resources.ironOre).toBe(0);
    expect(loaded.resources.wood).toBe(0);
  });

  it("completes an offline craft", () => {
    const storage = createMemoryStorage();
    const state = makeTestGameState(0);
    const slotId = state.workshop.forgeSlots[0].slotId;
    const craftingState = startCraft(state, SWORD_BLUEPRINT_ID, slotId, {
      now: 0,
      rng: createTestRng([0])
    });

    saveGame(craftingState, 0, storage);
    const loaded = loadGame(11_000, storage);

    expect(Object.keys(loaded.workshop.activeCraftsById)).toHaveLength(0);
    expect(loaded.workshop.forgeSlots[0].activeCraftId).toBeUndefined();
    expect(loaded.inventory.itemIds).toHaveLength(1);
    expect(loaded.player.craftedItemCount).toBe(1);
  });

  it("repairs missing inventory item ids and missing Sword Blueprint", () => {
    const storage = createMemoryStorage();
    const state = {
      ...makeTestGameState(0),
      inventory: {
        ...makeTestGameState(0).inventory,
        itemIds: ["missing_item"]
      },
      blueprints: {
        ownedBlueprintIds: []
      }
    };

    saveGame(state, 0, storage);
    const loaded = loadGame(0, storage);

    expect(loaded.inventory.itemIds).toEqual([]);
    expect(loaded.blueprints.ownedBlueprintIds).toContain(SWORD_BLUEPRINT_ID);
  });

  it("repairs the Legendary Archive from legendary items", () => {
    const storage = createMemoryStorage();
    const legendaryItem: ItemState = {
      itemId: "item_legendary",
      itemType: "sword",
      blueprintId: "bp_sword_base",
      displayName: "Mooncleaver",
      rarity: "legendary",
      level: 15,
      power: 200,
      sellValue: 200,
      state: "assigned_hero",
      createdAt: 0,
      runId: "run_test",
      isLegendary: true,
      isMasterwork: false
    };
    const state = {
      ...makeTestGameState(0),
      itemsById: {
        item_legendary: legendaryItem
      },
      prestige: {
        ...makeTestGameState(0).prestige,
        legendaryItemIds: []
      }
    };

    saveGame(state, 0, storage);
    const loaded = loadGame(0, storage);

    expect(loaded.prestige.legendaryItemIds).toEqual(["item_legendary"]);
  });
});
