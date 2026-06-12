import { describe, expect, it } from "vitest";
import { addItemToInventory, sellItemToMarket, shouldWarnBeforeGuildDelivery } from "../../src/game/systems/inventorySystem";
import type { ItemState } from "../../src/types/item.types";
import { makeTestGameState } from "../fixtures/testGameState";

function makeItem(overrides: Partial<ItemState> = {}): ItemState {
  return {
    itemId: "item_test",
    itemType: "sword",
    blueprintId: "bp_sword_base",
    displayName: "Iron Sword",
    rarity: "common",
    level: 1,
    power: 10,
    sellValue: 10,
    state: "inventory",
    createdAt: 0,
    runId: "run_test",
    isLegendary: false,
    isMasterwork: false,
    ...overrides
  };
}

describe("inventorySystem", () => {
  it("starts with 20 inventory slots", () => {
    expect(makeTestGameState(0).inventory.maxSlots).toBe(20);
  });

  it("throws when adding to full inventory", () => {
    const state = makeTestGameState(0);
    const fullState = {
      ...state,
      inventory: {
        ...state.inventory,
        itemIds: Array.from({ length: state.inventory.maxSlots }, (_, index) => `item_${index}`)
      }
    };

    expect(() => addItemToInventory(fullState, makeItem())).toThrow("Inventory full");
  });

  it("sells an item to market for 35% sell value and no Reputation", () => {
    const state = addItemToInventory(makeTestGameState(0), makeItem({ sellValue: 32 }));
    const soldState = sellItemToMarket(state, "item_test", 5000);

    expect(soldState.resources.gold).toBe(11);
    expect(soldState.player.reputationXp).toBe(0);
    expect(soldState.inventory.itemIds).toEqual([]);
    expect(soldState.itemsById.item_test.state).toBe("sold_market");
    expect(soldState.log.entries[0]).toMatchObject({
      type: "item_sold_market",
      relatedItemId: "item_test"
    });
  });

  it("warns before guild delivery for Epic or Legendary only", () => {
    expect(shouldWarnBeforeGuildDelivery(makeItem({ rarity: "common" }))).toBe(false);
    expect(shouldWarnBeforeGuildDelivery(makeItem({ rarity: "fine" }))).toBe(false);
    expect(shouldWarnBeforeGuildDelivery(makeItem({ rarity: "rare" }))).toBe(false);
    expect(shouldWarnBeforeGuildDelivery(makeItem({ rarity: "epic" }))).toBe(true);
    expect(shouldWarnBeforeGuildDelivery(makeItem({ rarity: "legendary" }))).toBe(true);
  });
});
