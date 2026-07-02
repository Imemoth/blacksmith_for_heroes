# MVP Config Tables

## Reputation config

```ts
export const reputationLevels = [
  { level: 1, xpRequired: 0, title: "Local Smith" },
  { level: 2, xpRequired: 100, title: "Known Crafter" },
  { level: 3, xpRequired: 250, title: "Guild-Recognized Smith" },
  { level: 4, xpRequired: 625, title: "Warband Supplier" },
  { level: 5, xpRequired: 1650, title: "Masterwork Candidate" }
];
```

## Tier config

```ts
export const tiers = [
  {
    tier: 1,
    name: "Basic Forge",
    maxItemLevel: 8,
    legendaryEnabled: false
  },
  {
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
  {
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
];
```

## Rarity config

```ts
export const rarities = {
  common: { chance: 0.815, multiplier: 1.0 },
  fine: { chance: 0.15, multiplier: 1.08 },
  rare: { chance: 0.03, multiplier: 1.22 },
  epic: { chance: 0.0045, multiplier: 1.5 },
  legendary: { chance: 0.0005, multiplier: 2.2, minTier: 3 }
};
```

## Item type config

```ts
export const itemTypes = {
  sword: { ironOre: 4, wood: 1, time: 10, multiplier: 10 },
  bow: { ironOre: 1, wood: 5, time: 12, multiplier: 9 },
  staff: { ironOre: 1, wood: 6, time: 16, multiplier: 11 },
  axe: { ironOre: 5, wood: 2, time: 14, multiplier: 12 }
};
```

## Base blueprints

```ts
export const baseBlueprints = [
  { id: "bp_sword_base", itemType: "sword", cost: 0, rep: 1, tier: 1, ownedByDefault: true },
  { id: "bp_bow_base", itemType: "bow", cost: 180, rep: 2, tier: 1 },
  { id: "bp_staff_base", itemType: "staff", cost: 350, rep: 3, tier: 1 },
  { id: "bp_axe_base", itemType: "axe", cost: 500, rep: 4, tier: 1 }
];
```

## Advanced blueprints

```ts
export const advancedBlueprints = [
  { id: "bp_sword_basic_pattern", itemType: "sword", cost: 250, rep: 2, tier: 2, baseLevelBonus: 1 },
  { id: "bp_hunter_bow_pattern", itemType: "bow", cost: 450, rep: 2, tier: 2, baseLevelBonus: 1 },
  { id: "bp_apprentice_staff_pattern", itemType: "staff", cost: 650, rep: 3, tier: 2, baseLevelBonus: 2 },
  { id: "bp_heavy_axe_pattern", itemType: "axe", cost: 850, rep: 4, tier: 2, baseLevelBonus: 2 }
];
```

## Masterwork blueprints

```ts
export const masterworkBlueprints = [
  { id: "bp_masterwork_frame", cost: 1500, rep: 5, tier: 3 },
  { id: "bp_legacy_weapon_pattern", cost: 2000, rep: 5, tier: 3 }
];
```

## Hero arrival timers

```ts
export const heroArrivalTimers = {
  1: 300,
  2: 300,
  3: 240,
  4: 180,
  5: 120
};
```

## Hero expiry

```ts
export const heroCommissionTiming = {
  activeDurationSeconds: 90,
  dismissCooldownSeconds: 300,
  maxMissingBlueprintCommissions: 1
};
```

## Guild rotation

```ts
export const guildContractTiming = {
  offeredRotationMinSeconds: 300,
  offeredRotationMaxSeconds: 600,
  acceptedContractsDoNotRotate: true
};
```

## Reward multipliers

```ts
export const rewardConfig = {
  marketSellMultiplier: 0.35,
  guildGoldMultiplier: { min: 0.85, max: 1.10 },
  heroGoldMultiplier: { min: 0.50, max: 0.90 },
  marketReputation: 0
};
```

## Prestige config

```ts
export const firstPrestige = {
  requiredRepLevel: 5,
  requiredForgeTier: 3,
  requiredItemRarityOrBetter: "epic",
  requiredItemLevel: 15,
  requiredBlueprintId: "bp_masterwork_frame",
  requiredHeroCommissionsCompleted: 5,
  requiredGuildContractsCompleted: 5,
  rewardForgeSigilRange: [1, 3],
  consumeMasterworkItem: true,
  archiveMasterworkItem: true
};
```

## Inventory config

```ts
export const inventoryConfig = {
  startingSlots: 20,
  earlyExpansionCurrency: "gold",
  permanentExpansionCurrency: "forgeSigil",
  warnBeforeUsingEpicOrBetterForGuildContract: true
};
```
