import { describe, expect, it } from "vitest";
import { canStartCraft, completeCraft, startCraft } from "../../src/game/systems/craftSystem";
import { rollRarity } from "../../src/game/systems/itemGenerationSystem";
import { makeTestGameState, createTestRng } from "../fixtures/testGameState";

const SWORD_BLUEPRINT_ID = "bp_sword_base";

describe("craftSystem", () => {
  it("rejects craft start when blueprint is not owned", () => {
    const state = {
      ...makeTestGameState(0),
      blueprints: { ownedBlueprintIds: [] }
    };

    expect(canStartCraft(state, SWORD_BLUEPRINT_ID)).toEqual({
      ok: false,
      reason: "Blueprint not owned"
    });
  });

  it("rejects craft start without Iron Ore or Wood", () => {
    const withoutIron = {
      ...makeTestGameState(0),
      resources: { ...makeTestGameState(0).resources, ironOre: 3 }
    };
    const withoutWood = {
      ...makeTestGameState(0),
      resources: { ...makeTestGameState(0).resources, wood: 0 }
    };

    expect(canStartCraft(withoutIron, SWORD_BLUEPRINT_ID).reason).toBe("Not enough materials");
    expect(canStartCraft(withoutWood, SWORD_BLUEPRINT_ID).reason).toBe("Not enough materials");
  });

  it("rejects craft start when no forge slot is free", () => {
    const state = makeTestGameState(0);
    const occupied = {
      ...state,
      workshop: {
        ...state.workshop,
        forgeSlots: [{ ...state.workshop.forgeSlots[0], activeCraftId: "craft_busy" }]
      }
    };

    expect(canStartCraft(occupied, SWORD_BLUEPRINT_ID)).toEqual({
      ok: false,
      reason: "No free forge slot"
    });
  });

  it("rejects craft start when inventory is full", () => {
    const state = makeTestGameState(0);
    const fullInventory = {
      ...state,
      inventory: {
        ...state.inventory,
        itemIds: Array.from({ length: state.inventory.maxSlots }, (_, index) => `item_${index}`)
      }
    };

    expect(canStartCraft(fullInventory, SWORD_BLUEPRINT_ID)).toEqual({
      ok: false,
      reason: "Inventory full"
    });
  });

  it("starts a Sword craft and consumes materials", () => {
    const state = makeTestGameState(0);
    const slotId = state.workshop.forgeSlots[0].slotId;
    const nextState = startCraft(state, SWORD_BLUEPRINT_ID, slotId, {
      now: 1000,
      rng: createTestRng([0])
    });
    const craft = Object.values(nextState.workshop.activeCraftsById)[0];

    expect(nextState.resources.ironOre).toBe(8);
    expect(nextState.resources.wood).toBe(5);
    expect(craft).toMatchObject({
      blueprintId: SWORD_BLUEPRINT_ID,
      itemType: "sword",
      durationSeconds: 10
    });
    expect(nextState.workshop.forgeSlots[0].activeCraftId).toBe(craft.craftId);
    expect(nextState.log.entries[0].type).toBe("craft_started");
  });

  it("completes a craft into inventory and updates counters/logs", () => {
    const state = makeTestGameState(0);
    const slotId = state.workshop.forgeSlots[0].slotId;
    const craftingState = startCraft(state, SWORD_BLUEPRINT_ID, slotId, {
      now: 0,
      rng: createTestRng([0])
    });
    const craft = Object.values(craftingState.workshop.activeCraftsById)[0];
    const completedState = completeCraft(craftingState, craft.craftId, {
      now: 11_000,
      rng: createTestRng([0, 0, 0.999])
    });
    const itemId = completedState.inventory.itemIds[0];
    const item = completedState.itemsById[itemId];

    expect(item).toMatchObject({
      itemType: "sword",
      blueprintId: SWORD_BLUEPRINT_ID,
      rarity: "common",
      level: 1,
      power: 10,
      sellValue: 10,
      state: "inventory"
    });
    expect(completedState.workshop.activeCraftsById).toEqual({});
    expect(completedState.workshop.forgeSlots[0].activeCraftId).toBeUndefined();
    expect(completedState.player.craftedItemCount).toBe(1);
    expect(completedState.log.entries[0].type).toBe("craft_completed");
  });

  it("does not roll Legendary at Tier 1", () => {
    const state = makeTestGameState(0);

    expect(
      rollRarity(state, {
        now: 0,
        rng: createTestRng([0.999999])
      })
    ).not.toBe("legendary");
  });
});
