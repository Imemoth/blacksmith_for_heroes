# Config Schema

## Cél

Ez a dokumentum meghatározza az MVP adatvezérelt konfigurációinak szerkezetét.

Fő elv:

> Rendszerlogika kódban, balance és content configban.

A config legyen bővíthető város, Reputation, Tier, blueprint, material, prestige count és tag alapján.

---

# Mappaszerkezet

## Balance config

```txt
config/
  resources.config.ts
  itemTypes.config.ts
  rarities.config.ts
  affixes.config.ts
  reputation.config.ts
  tiers.config.ts
  blueprints.config.ts
  upgrades.config.ts
  prestige.config.ts
  inventory.config.ts
```

## Content config

```txt
content/
  heroNames.config.ts
  guildNames.config.ts
  feedbackTemplates.config.ts
  legendaryNames.config.ts
  guildContractTemplates.config.ts
  heroCommissionTemplates.config.ts
  cityContent.config.ts
```

## Elv

- `config/` = balance, formula, unlock, gazdasági számok.
- `content/` = nevek, szövegek, template-ek, világ flavor.

---

# Common types

```ts
export type ItemType = "sword" | "bow" | "staff" | "axe";

export type Rarity =
  | "common"
  | "fine"
  | "rare"
  | "epic"
  | "legendary";

export type HeroClass =
  | "guard"
  | "ranger"
  | "mage"
  | "mercenary"
  | "duelist"
  | "veteran";

export type AffixType =
  | "sharp"
  | "balanced"
  | "precise"
  | "arcane"
  | "heavy";
```

---

# Unlock scope

Minden content elem opcionálisan ilyen unlock scope-pal rendelkezhet.

```ts
export type UnlockScope = {
  cities?: string[];
  minRepLevel?: number;
  minTier?: number;
  minPrestigeCount?: number;
  requiredBlueprintIds?: string[];
  requiredMaterialIds?: string[];
  requiredAchievementIds?: string[];
  tags?: string[];
};
```

## Használat

Ezt lehet használni:

- hero névre,
- guild névre,
- feedback template-re,
- Legendary névre,
- order template-re,
- city-specific contentre.

---

# Resource config schema

```ts
export type ResourceConfig = {
  id: string;
  displayName: string;
  role: string;
  startingAmount: number;
  startingCap?: number;
  baseRatePerSecond?: number;
};
```

## MVP entries

```ts
export const resources = [
  {
    id: "gold",
    displayName: "Gold",
    role: "upgrade_and_blueprint_currency",
    startingAmount: 0
  },
  {
    id: "ironOre",
    displayName: "Iron Ore",
    role: "main_material_sword_axe",
    startingAmount: 12,
    startingCap: 30,
    baseRatePerSecond: 1 / 8
  },
  {
    id: "wood",
    displayName: "Wood",
    role: "main_material_bow_staff",
    startingAmount: 6,
    startingCap: 25,
    baseRatePerSecond: 1 / 10
  },
  {
    id: "forgeSigil",
    displayName: "Forge Sigil",
    role: "prestige_currency",
    startingAmount: 0
  }
];
```

---

# Item type config schema

```ts
export type ItemTypeConfig = {
  itemType: ItemType;
  displayName: string;
  baseCost: {
    ironOre: number;
    wood: number;
  };
  baseCraftTimeSeconds: number;
  typeMultiplier: number;
  primaryMaterial: "ironOre" | "wood";
};
```

## MVP entries

```ts
export const itemTypes = {
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
};
```

---

# Rarity config schema

```ts
export type RarityConfig = {
  rarity: Rarity;
  displayName: string;
  baseChance: number;
  powerMultiplier: number;
  minTier?: number;
  uniqueName: boolean;
};
```

## MVP entries

```ts
export const rarities = [
  { rarity: "common", displayName: "Common", baseChance: 0.815, powerMultiplier: 1.0, uniqueName: false },
  { rarity: "fine", displayName: "Fine", baseChance: 0.15, powerMultiplier: 1.08, uniqueName: false },
  { rarity: "rare", displayName: "Rare", baseChance: 0.03, powerMultiplier: 1.22, uniqueName: false },
  { rarity: "epic", displayName: "Epic", baseChance: 0.0045, powerMultiplier: 1.5, uniqueName: false },
  { rarity: "legendary", displayName: "Legendary", baseChance: 0.0005, powerMultiplier: 2.2, minTier: 3, uniqueName: true }
];
```

---

# Blueprint config schema

```ts
export type BlueprintKind = "base" | "advanced" | "masterwork";

export type BlueprintConfig = {
  id: string;
  name: string;
  itemType: ItemType | "any";
  kind: BlueprintKind;
  goldCost: number;
  requiredRepLevel: number;
  requiredForgeTier: number;
  ownedByDefault?: boolean;
  baseLevelBonus: number;
  allowedAffixes?: AffixType[];
  materialCostMultiplier?: number;
  craftTimeMultiplier?: number;
};
```

## Szabályok

- Base blueprint item type-ot nyit.
- Advanced blueprint Tier 2 mögött van.
- Masterwork blueprint prestige előfeltétel.
- Reputation unlockolja a shop kínálatot.
- Gold a fizetőeszköz.

---

# Upgrade config schema

```ts
export type UpgradeCategory =
  | "forge_speed"
  | "material_income"
  | "storage"
  | "order_slots"
  | "order_refresh"
  | "item_level"
  | "rarity"
  | "tier"
  | "prestige";

export type UpgradeConfig = {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  goldCost?: number;
  forgeSigilCost?: number;
  requirements?: {
    upgradeOwned?: string;
    completedOrdersTotal?: number;
    craftedEpicCount?: number;
    minTier?: number;
    minPrestigeCount?: number;
  };
  effect: {
    craftSpeedMultiplierAdd?: number;
    ironOreRateMultiplierAdd?: number;
    woodRateMultiplierAdd?: number;
    materialCapMultiplierAdd?: number;
    inventorySlotAdd?: number;
    permanentInventorySlotAdd?: number;
    itemLevelMinBonusAdd?: number;
    rarityBonusTier?: number;
    guildContractSlotAdd?: number;
    heroCommissionSlotAdd?: number;
    manualGuildRefreshEnabled?: boolean;
    manualGuildRefreshCooldownSeconds?: number;
    forgeTierSet?: number;
  };
};
```

---

# Hero name content schema

```ts
export type HeroNameEntry = {
  id: string;
  name: string;
  allowedClasses: HeroClass[];
  weight: number;
  unlock?: UnlockScope;
};
```

## Példa

```ts
export const heroNamePool = [
  {
    id: "hero_name_borin",
    name: "Borin",
    allowedClasses: ["guard", "mercenary"],
    weight: 12,
    unlock: { cities: ["oakvale"], minRepLevel: 1, minTier: 1 }
  },
  {
    id: "hero_name_mira",
    name: "Mira",
    allowedClasses: ["mage"],
    weight: 8,
    unlock: { cities: ["oakvale"], minRepLevel: 3, minTier: 1 }
  }
];
```

---

# Guild name content schema

```ts
export type GuildType =
  | "guard"
  | "hunter"
  | "mage"
  | "mercenary"
  | "caravan"
  | "royal";

export type GuildNameEntry = {
  id: string;
  name: string;
  guildType: GuildType;
  preferredItemTypes: ItemType[];
  weight: number;
  unlock?: UnlockScope;
};
```

---

# Feedback template schema

```ts
export type FeedbackEventType =
  | "success"
  | "partial_success"
  | "failure"
  | "praise"
  | "repair_request"
  | "legendary_reaction";

export type FeedbackTemplate = {
  id: string;
  eventType: FeedbackEventType;
  text: string;
  allowedHeroClasses?: HeroClass[];
  allowedItemTypes?: ItemType[];
  minRarity?: Rarity;
  rewardType?: "reputation" | "material" | "gold" | "none";
  weight: number;
  unlock?: UnlockScope;
};
```

## Template változók

Engedélyezett tokenek:

```txt
{heroName}
{itemName}
{itemType}
{guildName}
{cityName}
{locationName}
{rarity}
```

---

# Legendary name schema

```ts
export type LegendaryTheme =
  | "fire"
  | "moon"
  | "forest"
  | "arcane"
  | "war"
  | "dragon"
  | "shadow";

export type LegendaryNameEntry = {
  id: string;
  name: string;
  allowedItemTypes: ItemType[];
  theme: LegendaryTheme;
  weight: number;
  unlock?: UnlockScope;
};
```

---

# Guild contract template schema

```ts
export type GuildContractTemplate = {
  id: string;
  guildType: GuildType;
  requiredRepLevel: number;
  requiredTier: number;
  requiredOwnedBlueprints: string[];
  itemRequirements: {
    itemType: ItemType;
    quantityMin: number;
    quantityMax: number;
  }[];
  minLevelRange: [number, number];
  goldRewardRange: [number, number];
  reputationRewardRange: [number, number];
  weight: number;
  unlock?: UnlockScope;
};
```

## Szabály

Guild contract csak owned blueprintből generálódhat.

---

# Hero commission template schema

```ts
export type HeroCommissionTemplate = {
  id: string;
  heroClass: HeroClass;
  requiredRepLevel: number;
  requiredTier: number;
  requiredBlueprintId: string;
  requiredItemType: ItemType;
  minLevelRange: [number, number];
  preferredAffix?: AffixType;
  bonusRarity?: Rarity;
  goldMultiplierRange: [number, number];
  reputationRewardRange: [number, number];
  baseFeedbackChance: number;
  weight: number;
  unlock?: UnlockScope;
};
```

## Szabály

Hero commission generálható, ha:

- Rep requirement teljesül,
- Tier requirement teljesül,
- required blueprint owned **vagy** shopban elérhető,
- max 1 missing-blueprint commission aktív.

---

# Weighted random util

```ts
export function pickWeighted<T extends { weight: number }>(items: T[]): T | undefined {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return undefined;

  let roll = Math.random() * total;

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}
```

## Eligibility filter

```ts
export function isUnlocked(scope: UnlockScope | undefined, context: ContentContext): boolean {
  if (!scope) return true;

  if (scope.cities && !scope.cities.includes(context.cityId)) return false;
  if (scope.minRepLevel && context.repLevel < scope.minRepLevel) return false;
  if (scope.minTier && context.tier < scope.minTier) return false;
  if (scope.minPrestigeCount && context.prestigeCount < scope.minPrestigeCount) return false;

  if (scope.requiredBlueprintIds) {
    for (const id of scope.requiredBlueprintIds) {
      if (!context.ownedBlueprintIds.includes(id)) return false;
    }
  }

  if (scope.requiredMaterialIds) {
    for (const id of scope.requiredMaterialIds) {
      if (!context.knownMaterialIds.includes(id)) return false;
    }
  }

  return true;
}
```

## Content context

```ts
export type ContentContext = {
  cityId: string;
  repLevel: number;
  tier: number;
  prestigeCount: number;
  ownedBlueprintIds: string[];
  shopAvailableBlueprintIds: string[];
  knownMaterialIds: string[];
};
```

---

# Validation rules

Config betöltéskor ellenőrizni kell:

1. Minden `id` egyedi.
2. Minden blueprint `itemType` valid.
3. Minden order template valid item type-ot kér.
4. Hero commission required blueprint létezik.
5. Legendary name allowed item type valid.
6. Rarity esélyek összege baseline táblában 1.0.
7. Tier cap növekvő.
8. Rep threshold növekvő.
9. Advanced blueprint required tier >= 2.
10. Legendary min tier >= 3.

Ha validation fail van, dev módban hard error legyen.
