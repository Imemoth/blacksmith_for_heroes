import type { BlueprintConfig } from "../types/blueprint.types";

export const BLUEPRINTS = [
  {
    id: "bp_sword_base",
    name: "Sword Blueprint",
    itemType: "sword",
    kind: "base",
    goldCost: 0,
    requiredRepLevel: 1,
    requiredForgeTier: 1,
    ownedByDefault: true,
    baseLevelBonus: 1
  },
  {
    id: "bp_bow_base",
    name: "Bow Blueprint",
    itemType: "bow",
    kind: "base",
    goldCost: 180,
    requiredRepLevel: 2,
    requiredForgeTier: 1,
    baseLevelBonus: 1
  },
  {
    id: "bp_staff_base",
    name: "Staff Blueprint",
    itemType: "staff",
    kind: "base",
    goldCost: 350,
    requiredRepLevel: 3,
    requiredForgeTier: 1,
    baseLevelBonus: 1
  },
  {
    id: "bp_axe_base",
    name: "Axe Blueprint",
    itemType: "axe",
    kind: "base",
    goldCost: 500,
    requiredRepLevel: 4,
    requiredForgeTier: 1,
    baseLevelBonus: 1
  },
  {
    id: "bp_sword_basic_pattern",
    name: "Basic Sword Pattern",
    itemType: "sword",
    kind: "advanced",
    goldCost: 250,
    requiredRepLevel: 2,
    requiredForgeTier: 2,
    baseLevelBonus: 1,
    allowedAffixes: ["sharp", "balanced"],
    materialCostMultiplier: 1.2,
    craftTimeMultiplier: 1.1
  },
  {
    id: "bp_masterwork_frame",
    name: "Masterwork Frame",
    itemType: "any",
    kind: "masterwork",
    goldCost: 1500,
    requiredRepLevel: 5,
    requiredForgeTier: 3,
    baseLevelBonus: 0
  }
] as const satisfies BlueprintConfig[];
