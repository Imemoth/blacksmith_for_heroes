import { describe, expect, it } from "vitest";
import { purchasePrestigeUpgrade } from "../../src/game/systems/upgradeSystem";
import { canPrestige, performPrestige } from "../../src/game/systems/prestigeSystem";
import { loadGame, saveGame } from "../../src/game/systems/saveSystem";
import type { GameState } from "../../src/types/gameState.types";
import type { ItemState } from "../../src/types/item.types";
import {
  createMemoryStorage,
  makeTestGameState
} from "../fixtures/testGameState";

function makeItem(overrides: Partial<ItemState> = {}): ItemState {
  return {
    itemId: "item_masterwork",
    itemType: "sword",
    blueprintId: "bp_sword_base",
    displayName: "Mastercrafted Iron Sword",
    rarity: "epic",
    level: 15,
    power: 160,
    sellValue: 160,
    state: "inventory",
    createdAt: 0,
    runId: "run_test",
    isLegendary: false,
    isMasterwork: false,
    ...overrides
  };
}

function makePrestigeReadyState(overrides: Partial<GameState> = {}): GameState {
  const base = makeTestGameState(0);
  const masterworkItem = makeItem();

  return {
    ...base,
    player: {
      ...base.player,
      reputationXp: 1650,
      reputationLevel: 5,
      completedHeroCommissions: 5,
      completedGuildContracts: 5,
      completedOrdersTotal: 10,
      craftedEpicCount: 1
    },
    resources: {
      ...base.resources,
      gold: 500,
      ironOre: 20,
      wood: 20,
      forgeSigil: 2
    },
    workshop: {
      ...base.workshop,
      forgeTier: 3,
      maxItemLevelCap: 20
    },
    blueprints: {
      ownedBlueprintIds: ["bp_sword_base", "bp_masterwork_frame"]
    },
    inventory: {
      ...base.inventory,
      itemIds: [masterworkItem.itemId]
    },
    itemsById: {
      [masterworkItem.itemId]: masterworkItem
    },
    ...overrides
  };
}

describe("prestige requirements", () => {
  it("reports every missing requirement and clear lock reason", () => {
    const emptyState = makeTestGameState(0);
    const result = canPrestige(emptyState);

    expect(result.ok).toBe(false);
    expect(result.missingRequirements.map((requirement) => requirement.key)).toEqual([
      "reputation",
      "forge_tier",
      "masterwork_frame",
      "eligible_item",
      "hero_commissions",
      "guild_contracts"
    ]);
    expect(result.lockReasons).toContain("Requires Rep 5");
  });

  it("is unavailable before Rep 5", () => {
    const state = makePrestigeReadyState({
      player: {
        ...makePrestigeReadyState().player,
        reputationXp: 625,
        reputationLevel: 4
      }
    });

    expect(canPrestige(state).missingRequirements.map((requirement) => requirement.key)).toContain(
      "reputation"
    );
  });

  it("is unavailable before Tier 3", () => {
    const state = makePrestigeReadyState({
      workshop: {
        ...makePrestigeReadyState().workshop,
        forgeTier: 2,
        maxItemLevelCap: 15
      }
    });

    expect(canPrestige(state).missingRequirements.map((requirement) => requirement.key)).toContain(
      "forge_tier"
    );
  });

  it("is unavailable without Masterwork Frame", () => {
    const state = makePrestigeReadyState({
      blueprints: {
        ownedBlueprintIds: ["bp_sword_base"]
      }
    });

    expect(canPrestige(state).missingRequirements.map((requirement) => requirement.key)).toContain(
      "masterwork_frame"
    );
  });

  it("is unavailable without an eligible item", () => {
    const state = makePrestigeReadyState({
      inventory: {
        itemIds: [],
        maxSlots: 20
      }
    });

    expect(canPrestige(state).missingRequirements.map((requirement) => requirement.key)).toContain(
      "eligible_item"
    );
  });

  it("is unavailable without 5 hero completions", () => {
    const state = makePrestigeReadyState({
      player: {
        ...makePrestigeReadyState().player,
        completedHeroCommissions: 4
      }
    });

    expect(canPrestige(state).missingRequirements.map((requirement) => requirement.key)).toContain(
      "hero_commissions"
    );
  });

  it("is unavailable without 5 guild completions", () => {
    const state = makePrestigeReadyState({
      player: {
        ...makePrestigeReadyState().player,
        completedGuildContracts: 4
      }
    });

    expect(canPrestige(state).missingRequirements.map((requirement) => requirement.key)).toContain(
      "guild_contracts"
    );
  });

  it("is available when all requirements are met", () => {
    const result = canPrestige(makePrestigeReadyState());

    expect(result.ok).toBe(true);
    expect(result.eligibleItemIds).toEqual(["item_masterwork"]);
    expect(result.lockReasons).toEqual([]);
  });
});

describe("prestige execution", () => {
  it("resets temporary run progress and preserves permanent progress", () => {
    const normalItem = makeItem({
      itemId: "item_normal",
      rarity: "rare",
      level: 8,
      displayName: "Sharp Iron Sword"
    });
    const legendaryItem = makeItem({
      itemId: "item_legendary",
      displayName: "Mooncleaver",
      rarity: "legendary",
      level: 18,
      state: "assigned_hero",
      isLegendary: true
    });
    const readyState = makePrestigeReadyState({
      inventory: {
        itemIds: ["item_masterwork", "item_normal"],
        maxSlots: 25
      },
      itemsById: {
        item_masterwork: makeItem(),
        item_normal: normalItem,
        item_legendary: legendaryItem
      },
      workshop: {
        ...makePrestigeReadyState().workshop,
        forgeTier: 3,
        maxItemLevelCap: 20,
        activeCraftsById: {
          craft_test: {
            craftId: "craft_test",
            blueprintId: "bp_sword_base",
            itemType: "sword",
            startedAt: 0,
            completesAt: 10_000,
            durationSeconds: 10,
            inputMaterials: { ironOre: 4, wood: 1 }
          }
        },
        forgeSlots: [{ slotId: "slot_test", isUnlocked: true, activeCraftId: "craft_test" }],
        inventorySlotBonusFromSigils: 5
      },
      orders: {
        guildContractsById: {
          contract_test: {
            contractId: "contract_test",
            templateId: "contract_town_guard_swords_small",
            guildName: "Town Guard",
            guildType: "guard",
            requiredItems: [{ itemType: "sword", quantityRequired: 1, deliveredItemIds: [] }],
            minLevel: 1,
            goldReward: 100,
            reputationReward: 5,
            status: "accepted",
            generatedAt: 0
          }
        },
        activeGuildContractIds: ["contract_test"],
        heroCommissionsById: {},
        activeHeroCommissionIds: []
      },
      upgrades: {
        ownedUpgradeIds: ["better_mine_i"],
        ownedPrestigeUpgradeIds: ["permanent_storage_5"]
      },
      prestige: {
        forgeSigilsEarnedTotal: 2,
        forgeSigilsSpentTotal: 0,
        masterworkItemIds: [],
        legendaryItemIds: ["item_legendary"],
        completedPrestigeRuns: []
      },
      achievements: {
        unlockedAchievementIds: ["first_epic_sword"],
        unlockedAtById: { first_epic_sword: 1000 }
      }
    });
    const prestigedState = performPrestige(readyState, {
      now: 50_000,
      selectedItemId: "item_masterwork"
    });

    expect(prestigedState.resources).toMatchObject({
      gold: 0,
      ironOre: 12,
      wood: 6,
      forgeSigil: 3
    });
    expect(prestigedState.player.reputationXp).toBe(0);
    expect(prestigedState.player.reputationLevel).toBe(1);
    expect(prestigedState.player.completedHeroCommissions).toBe(0);
    expect(prestigedState.player.completedGuildContracts).toBe(0);
    expect(prestigedState.player.totalPrestiges).toBe(1);
    expect(prestigedState.workshop.forgeTier).toBe(1);
    expect(prestigedState.workshop.activeCraftsById).toEqual({});
    expect(prestigedState.workshop.forgeSlots[0].activeCraftId).toBeUndefined();
    expect(prestigedState.orders.activeGuildContractIds).toEqual([]);
    expect(prestigedState.orders.activeHeroCommissionIds).toEqual([]);
    expect(prestigedState.inventory.itemIds).toEqual([]);
    expect(prestigedState.inventory.maxSlots).toBe(25);
    expect(prestigedState.itemsById.item_masterwork.state).toBe("archived_masterwork");
    expect(prestigedState.itemsById.item_masterwork.isMasterwork).toBe(true);
    expect(prestigedState.itemsById.item_normal).toBeUndefined();
    expect(prestigedState.itemsById.item_legendary.state).toBe("archived_legendary");
    expect(prestigedState.prestige.masterworkItemIds).toEqual(["item_masterwork"]);
    expect(prestigedState.prestige.legendaryItemIds).toContain("item_legendary");
    expect(prestigedState.prestige.forgeSigilsEarnedTotal).toBe(3);
    expect(prestigedState.prestige.completedPrestigeRuns[0]).toMatchObject({
      masterworkItemId: "item_masterwork",
      forgeSigilsEarned: 1,
      repLevelAtPrestige: 5,
      forgeTierAtPrestige: 3
    });
    expect(prestigedState.upgrades.ownedUpgradeIds).toEqual([]);
    expect(prestigedState.upgrades.ownedPrestigeUpgradeIds).toEqual(["permanent_storage_5"]);
    expect(prestigedState.achievements.unlockedAchievementIds).toEqual(["first_epic_sword"]);
    expect(prestigedState.blueprints.ownedBlueprintIds).toEqual(["bp_sword_base"]);
    expect(prestigedState.log.entries[0].type).toBe("prestige_completed");
  });

  it("auto-selects the first eligible item when no item is selected", () => {
    const state = makePrestigeReadyState();
    const prestigedState = performPrestige(state, { now: 1000 });

    expect(prestigedState.prestige.masterworkItemIds).toEqual(["item_masterwork"]);
  });

  it("saves and loads after prestige", () => {
    const storage = createMemoryStorage();
    const prestigedState = performPrestige(makePrestigeReadyState(), { now: 1000 });

    saveGame(prestigedState, 1000, storage);
    const loaded = loadGame(1000, storage);

    expect(loaded.player.reputationXp).toBe(0);
    expect(loaded.player.reputationLevel).toBe(1);
    expect(loaded.resources.forgeSigil).toBe(3);
    expect(loaded.prestige.masterworkItemIds).toEqual(["item_masterwork"]);
    expect(loaded.itemsById.item_masterwork.state).toBe("archived_masterwork");
  });
});

describe("Forge Sigil permanent upgrades", () => {
  it("purchases a Forge Sigil upgrade and applies it immediately", () => {
    const state = makePrestigeReadyState({
      resources: {
        ...makePrestigeReadyState().resources,
        forgeSigil: 1
      }
    });
    const upgradedState = purchasePrestigeUpgrade(state, "permanent_storage_5", 1000);

    expect(upgradedState.resources.forgeSigil).toBe(0);
    expect(upgradedState.prestige.forgeSigilsSpentTotal).toBe(1);
    expect(upgradedState.upgrades.ownedPrestigeUpgradeIds).toEqual(["permanent_storage_5"]);
    expect(upgradedState.inventory.maxSlots).toBe(25);
  });

  it("keeps permanent upgrade effects after prestige", () => {
    const state = makePrestigeReadyState({
      resources: {
        ...makePrestigeReadyState().resources,
        forgeSigil: 2
      }
    });
    const withStorage = purchasePrestigeUpgrade(state, "permanent_storage_5", 1000);
    const withIron = purchasePrestigeUpgrade(withStorage, "starting_iron_5", 2000);
    const prestigedState = performPrestige(withIron, { now: 3000 });

    expect(prestigedState.upgrades.ownedPrestigeUpgradeIds).toEqual([
      "permanent_storage_5",
      "starting_iron_5"
    ]);
    expect(prestigedState.inventory.maxSlots).toBe(25);
    expect(prestigedState.resources.ironOre).toBe(17);
    expect(prestigedState.resources.forgeSigil).toBe(1);
  });
});
