import type { UpgradeConfig } from "../types/upgrade.types";

export const WORKSHOP_UPGRADES: UpgradeConfig[] = [
  {
    id: "better_mine_i",
    name: "Better Mine I",
    description: "Iron Ore production increases by 50%.",
    category: "material_income",
    goldCost: 100,
    effect: {
      ironOreRateMultiplierAdd: 0.5
    }
  },
  {
    id: "better_lumber_yard_i",
    name: "Better Lumber Yard I",
    description: "Wood production increases by 50%.",
    category: "material_income",
    goldCost: 120,
    effect: {
      woodRateMultiplierAdd: 0.5
    }
  },
  {
    id: "better_anvil_i",
    name: "Better Anvil I",
    description: "Craft speed improves by 15%.",
    category: "forge_speed",
    goldCost: 120,
    effect: {
      craftSpeedMultiplierAdd: 0.15
    }
  },
  {
    id: "fine_tools_i",
    name: "Fine Tools I",
    description: "Crafted items roll at least 1 level higher.",
    category: "item_level",
    goldCost: 250,
    effect: {
      itemLevelMinBonusAdd: 1
    }
  },
  {
    id: "polishing_kit_i",
    name: "Polishing Kit I",
    description: "Rarity odds improve for Fine, Rare, Epic, and Legendary crafts.",
    category: "rarity",
    goldCost: 500,
    effect: {
      rarityBonusTier: 1
    }
  }
];
