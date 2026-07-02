# Config Files Starter Code

## Cél

Ez a dokumentum TypeScript starter configokat ad az MVP első implementációjához.

Ezek közvetlenül átemelhetők `src/config/` alá, majd finomíthatók.

---

# `resources.config.ts`

```ts
export const RESOURCE_CONFIG = {
  gold: {
    id: "gold",
    displayName: "Gold",
    startingAmount: 0
  },

  ironOre: {
    id: "ironOre",
    displayName: "Iron Ore",
    startingAmount: 12,
    startingCap: 30,
    baseRatePerSecond: 1 / 8
  },

  wood: {
    id: "wood",
    displayName: "Wood",
    startingAmount: 6,
    startingCap: 25,
    baseRatePerSecond: 1 / 10
  },

  forgeSigil: {
    id: "forgeSigil",
    displayName: "Forge Sigil",
    startingAmount: 0
  }
} as const;
```

---

# `itemTypes.config.ts`

```ts
export const ITEM_TYPES = {
  sword: {
    itemType: "sword",
    displayName: "Sword",
    baseCost: { ironOre: 4, wood: 1 },
    baseCraftTimeSeconds: 10,
    typeMultiplier: 10,
    primaryMaterial: "ironOre"
  },

  bow: {
    itemType: "bow",
    displayName: "Bow",
    baseCost: { ironOre: 1, wood: 5 },
    baseCraftTimeSeconds: 12,
    typeMultiplier: 9,
    primaryMaterial: "wood"
  },

  staff: {
    itemType: "staff",
    displayName: "Staff",
    baseCost: { ironOre: 1, wood: 6 },
    baseCraftTimeSeconds: 16,
    typeMultiplier: 11,
    primaryMaterial: "wood"
  },

  axe: {
    itemType: "axe",
    displayName: "Axe",
    baseCost: { ironOre: 5, wood: 2 },
    baseCraftTimeSeconds: 14,
    typeMultiplier: 12,
    primaryMaterial: "ironOre"
  }
} as const;
```

---

# `rarities.config.ts`

```ts
export const RARITIES = {
  common: {
    rarity: "common",
    displayName: "Common",
    baseChance: 0.815,
    powerMultiplier: 1.0,
    uniqueName: false
  },

  fine: {
    rarity: "fine",
    displayName: "Fine",
    baseChance: 0.15,
    powerMultiplier: 1.08,
    uniqueName: false
  },

  rare: {
    rarity: "rare",
    displayName: "Rare",
    baseChance: 0.03,
    powerMultiplier: 1.22,
    uniqueName: false
  },

  epic: {
    rarity: "epic",
    displayName: "Epic",
    baseChance: 0.0045,
    powerMultiplier: 1.5,
    uniqueName: false
  },

  legendary: {
    rarity: "legendary",
    displayName: "Legendary",
    baseChance: 0.0005,
    powerMultiplier: 2.2,
    minTier: 3,
    uniqueName: true
  }
} as const;

export const POLISHING_KIT_I_RARITIES = {
  common: 0.788,
  fine: 0.165,
  rare: 0.04,
  epic: 0.0062,
  legendary: 0.0008
} as const;
```

---

# `affixes.config.ts`

```ts
export const AFFIXES = {
  sharp: {
    type: "sharp",
    displayName: "Sharp",
    validItemTypes: ["sword", "axe"],
    effectType: "flat_power_bonus",
    baseValue: 8
  },

  balanced: {
    type: "balanced",
    displayName: "Balanced",
    validItemTypes: ["sword", "bow", "staff", "axe"],
    effectType: "order_value_bonus",
    baseValue: 0.08
  },

  precise: {
    type: "precise",
    displayName: "Precise",
    validItemTypes: ["bow", "sword"],
    effectType: "ranger_match_bonus",
    baseValue: 0.15
  },

  arcane: {
    type: "arcane",
    displayName: "Arcane",
    validItemTypes: ["staff"],
    effectType: "mage_match_bonus",
    baseValue: 0.15
  },

  heavy: {
    type: "heavy",
    displayName: "Heavy",
    validItemTypes: ["axe"],
    effectType: "warrior_match_bonus",
    baseValue: 0.15
  }
} as const;
```

---

# `reputation.config.ts`

```ts
export const REPUTATION_LEVELS = [
  {
    level: 1,
    xpRequired: 0,
    title: "Local Smith"
  },
  {
    level: 2,
    xpRequired: 100,
    title: "Known Crafter"
  },
  {
    level: 3,
    xpRequired: 250,
    title: "Guild-Recognized Smith"
  },
  {
    level: 4,
    xpRequired: 625,
    title: "Warband Supplier"
  },
  {
    level: 5,
    xpRequired: 1650,
    title: "Masterwork Candidate"
  }
] as const;
```

---

# `tiers.config.ts`

```ts
export const TIERS = {
  1: {
    tier: 1,
    name: "Basic Forge",
    maxItemLevel: 8,
    legendaryEnabled: false
  },

  2: {
    tier: 2,
    name: "Reinforced Forge",
    maxItemLevel: 15,
    legendaryEnabled: false,
    goldCost: 700,
    requirements: {
      completedOrdersTotal: 10,
      upgradeOwned: "better_anvil_i"
    }
  },

  3: {
    tier: 3,
    name: "Master Forge",
    maxItemLevel: 20,
    legendaryEnabled: true,
    legendaryBaseChance: 0.0005,
    goldCost: 1800,
    requirements: {
      completedOrdersTotal: 25,
      craftedEpicCount: 1,
      upgradeOwned: "reinforced_forge"
    }
  }
} as const;
```

---

# `blueprints.config.ts`

```ts
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
] as const;
```

---

# `inventory.config.ts`

```ts
export const INVENTORY_CONFIG = {
  startingSlots: 20,
  marketSellMultiplier: 0.35,
  earlyExpansionCurrency: "gold",
  permanentExpansionCurrency: "forgeSigil",
  warnBeforeUsingEpicOrBetterForGuildContract: true
} as const;
```

---

# `timing.config.ts`

```ts
export const TIMING_CONFIG = {
  heroArrivalSecondsByRepLevel: {
    1: 300,
    2: 300,
    3: 240,
    4: 180,
    5: 120
  },

  heroActiveDurationSeconds: 90,
  heroDismissCooldownSeconds: 300,

  guildOfferedRotationMinSeconds: 300,
  guildOfferedRotationMaxSeconds: 600,

  maxOfflineSeconds: 8 * 60 * 60,

  autosaveIntervalSeconds: 20
} as const;
```

---

# `prestige.config.ts`

```ts
export const PRESTIGE_CONFIG = {
  firstPrestige: {
    requiredRepLevel: 5,
    requiredForgeTier: 3,
    requiredItemRarityOrBetter: "epic",
    requiredItemLevel: 15,
    requiredBlueprintId: "bp_masterwork_frame",
    requiredHeroCommissionsCompleted: 5,
    requiredGuildContractsCompleted: 5,
    rewardForgeSigilMin: 1,
    rewardForgeSigilMax: 3,
    consumeMasterworkItem: true,
    archiveMasterworkItem: true
  },

  resetRules: {
    resetGold: true,
    resetBasicMaterials: true,
    resetActiveOrders: true,
    resetActiveCrafts: true,
    resetGoldUpgrades: true,
    resetGoldInventorySlots: true,

    keepForgeSigils: true,
    keepPrestigeUpgrades: true,
    keepLegendaryArchive: true,
    keepMasterworkHistory: true,
    keepPermanentInventorySlots: true
  }
} as const;
```

---

# Megjegyzés

A fenti configok nem végleges balance-t jelentenek.  
A cél az, hogy az első TypeScript implementáció ne üres konstansokkal induljon.
