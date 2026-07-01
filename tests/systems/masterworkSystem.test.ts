import { describe, expect, it } from "vitest";
import { isItemMasterworkEligible } from "../../src/game/systems/masterworkSystem";
import type { GameState } from "../../src/types/gameState.types";
import type { ItemState } from "../../src/types/item.types";
import { makeTestGameState } from "../fixtures/testGameState";

function makeEligibleState(): GameState {
  const state = makeTestGameState(0);

  return {
    ...state,
    player: {
      ...state.player,
      reputationLevel: 5,
      reputationXp: 1650
    },
    workshop: {
      ...state.workshop,
      forgeTier: 3,
      maxItemLevelCap: 20
    },
    blueprints: {
      ownedBlueprintIds: [...state.blueprints.ownedBlueprintIds, "bp_masterwork_frame"]
    }
  };
}

function makeItem(overrides: Partial<ItemState> = {}): ItemState {
  return {
    itemId: "item_test",
    itemType: "sword",
    blueprintId: "bp_sword_base",
    displayName: "Mastercrafted Iron Sword",
    rarity: "epic",
    level: 15,
    power: 120,
    sellValue: 120,
    state: "inventory",
    createdAt: 0,
    runId: "run_test",
    isLegendary: false,
    isMasterwork: false,
    ...overrides
  };
}

describe("masterworkSystem", () => {
  it("detects a Masterwork-eligible inventory item", () => {
    expect(isItemMasterworkEligible(makeEligibleState(), makeItem())).toBe(true);
  });

  it.each([
    ["low tier", { workshop: { forgeTier: 2, maxItemLevelCap: 15 } }, {}],
    ["low Rep", { player: { reputationLevel: 4, reputationXp: 625 } }, {}],
    ["missing Masterwork Frame", { blueprints: { ownedBlueprintIds: ["bp_sword_base"] } }, {}],
    ["low rarity", {}, { rarity: "rare" }],
    ["low level", {}, { level: 14 }],
    ["not in inventory", {}, { state: "assigned_hero" }]
  ])("rejects %s", (_label, stateOverrides, itemOverrides) => {
    const state = makeEligibleState();
    const patchedState = {
      ...state,
      ...stateOverrides,
      player: {
        ...state.player,
        ...(stateOverrides as Partial<GameState>).player
      },
      workshop: {
        ...state.workshop,
        ...(stateOverrides as Partial<GameState>).workshop
      },
      blueprints: {
        ...state.blueprints,
        ...(stateOverrides as Partial<GameState>).blueprints
      }
    };

    expect(isItemMasterworkEligible(patchedState, makeItem(itemOverrides as Partial<ItemState>))).toBe(
      false
    );
  });
});
