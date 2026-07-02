# Domain Types

## Cél

Ez a dokumentum a runtime domain modelleket írja le.

A `12_CONFIG_SCHEMA.md` a config/content adatokat definiálja.  
Ez a fájl az élő játékállapotot írja le:

- mit tárol a save,
- milyen objektumok változnak játék közben,
- milyen state kell a rendszerekhez.

---

# Common types

```ts
export type EntityId = string;
export type TimestampMs = number;
export type Seconds = number;

export type ItemType = "sword" | "bow" | "staff" | "axe";

export type Rarity =
  | "common"
  | "fine"
  | "rare"
  | "epic"
  | "legendary";

export type AffixType =
  | "sharp"
  | "balanced"
  | "precise"
  | "arcane"
  | "heavy";

export type HeroClass =
  | "guard"
  | "ranger"
  | "mage"
  | "mercenary"
  | "duelist"
  | "veteran";
```

---

# GameState

```ts
export type GameState = {
  version: number;

  player: PlayerState;
  resources: ResourcesState;
  workshop: WorkshopState;
  inventory: InventoryState;

  itemsById: Record<EntityId, ItemState>;

  blueprints: BlueprintRuntimeState;
  upgrades: UpgradeRuntimeState;

  orders: OrdersState;
  heroes: HeroRuntimeState;

  prestige: PrestigeState;
  log: EventLogState;

  timers: TimerState;

  currentCityId: string;
  lastSavedAt: TimestampMs;
};
```

## Megjegyzés

A config nem a `GameState` része. A config statikus import.  
A save csak runtime állapotot tároljon.

---

# PlayerState

```ts
export type PlayerState = {
  reputationXp: number;
  reputationLevel: number;

  completedGuildContracts: number;
  completedHeroCommissions: number;
  completedOrdersTotal: number;

  craftedItemCount: number;
  craftedRareCount: number;
  craftedEpicCount: number;
  craftedLegendaryCount: number;

  currentRunId: EntityId;
  totalPrestiges: number;
};
```

## Szerep

- Rep level számítás,
- unlockok,
- Tier requirementek egy része,
- prestige requirementek,
- analytics / progression.

---

# ResourcesState

```ts
export type ResourcesState = {
  gold: number;

  ironOre: number;
  wood: number;

  forgeSigil: number;

  ironOreCap: number;
  woodCap: number;

  ironOreRatePerSecond: number;
  woodRatePerSecond: number;
};
```

## Szabály

Resource nem lehet negatív.  
Iron Ore / Wood nem mehet cap fölé.

---

# WorkshopState

```ts
export type WorkshopState = {
  forgeTier: number;
  maxItemLevelCap: number;

  forgeSlots: ForgeSlot[];
  activeCraftsById: Record<EntityId, ActiveCraft>;

  craftSpeedMultiplier: number;
  itemLevelMinBonus: number;
  rarityBonusTier: number;

  guildContractSlots: number;
  heroCommissionSlots: number;

  manualGuildRefreshEnabled: boolean;
  manualGuildRefreshCooldownUntil?: TimestampMs;

  inventorySlotBonusFromGold: number;
  inventorySlotBonusFromSigils: number;
};
```

## ForgeSlot

```ts
export type ForgeSlot = {
  slotId: EntityId;
  isUnlocked: boolean;
  activeCraftId?: EntityId;
};
```

## ActiveCraft

```ts
export type ActiveCraft = {
  craftId: EntityId;

  blueprintId: EntityId;
  itemType: ItemType;

  startedAt: TimestampMs;
  completesAt: TimestampMs;
  durationSeconds: Seconds;

  inputMaterials: {
    ironOre: number;
    wood: number;
  };
};
```

---

# InventoryState

```ts
export type InventoryState = {
  itemIds: EntityId[];
  maxSlots: number;
};
```

## ItemState

```ts
export type ItemState = {
  itemId: EntityId;

  itemType: ItemType;
  blueprintId: EntityId;

  displayName: string;
  rarity: Rarity;
  level: number;
  power: number;
  sellValue: number;

  affix?: {
    type: AffixType;
    value: number;
  };

  state:
    | "inventory"
    | "assigned_guild"
    | "assigned_hero"
    | "sold_market"
    | "archived_legendary"
    | "archived_masterwork";

  ownerId?: EntityId;

  createdAt: TimestampMs;
  runId: EntityId;

  isLegendary: boolean;
  isMasterwork: boolean;
};
```

## Item storage

Ajánlott:

```ts
itemsById: Record<EntityId, ItemState>
```

Ne csak inventory listában tároljuk, mert Legendary Archive és Masterwork History is hivatkozik rá.

---

# BlueprintRuntimeState

A blueprint config statikus. Runtime csak azt tárolja, mi owned.

```ts
export type BlueprintRuntimeState = {
  ownedBlueprintIds: EntityId[];
};
```

Shop availability derived:

```ts
getAvailableBlueprints(state, blueprintConfig)
```

---

# UpgradeRuntimeState

```ts
export type UpgradeRuntimeState = {
  ownedUpgradeIds: EntityId[];
  ownedPrestigeUpgradeIds: EntityId[];
};
```

Gold upgrade-ek prestige resetnél törlődhetnek.  
Prestige upgrade-ek Forge Sigilből permanentek.

---

# OrdersState

```ts
export type OrdersState = {
  guildContractsById: Record<EntityId, GuildContractState>;
  activeGuildContractIds: EntityId[];

  heroCommissionsById: Record<EntityId, HeroCommissionState>;
  activeHeroCommissionIds: EntityId[];

  lastHeroArrivalAt?: TimestampMs;
  nextHeroArrivalAt?: TimestampMs;

  heroDismissCooldownUntil?: TimestampMs;
};
```

---

# GuildContractState

```ts
export type GuildContractState = {
  contractId: EntityId;
  templateId: EntityId;

  guildName: string;
  guildType: string;

  requiredItems: GuildRequiredItemState[];

  minLevel: number;

  goldReward: number;
  reputationReward: number;

  status:
    | "offered"
    | "accepted"
    | "completed"
    | "rotated";

  generatedAt: TimestampMs;
  rotateAt?: TimestampMs;
  acceptedAt?: TimestampMs;
  completedAt?: TimestampMs;
};
```

## GuildRequiredItemState

```ts
export type GuildRequiredItemState = {
  itemType: ItemType;
  quantityRequired: number;
  deliveredItemIds: EntityId[];
};
```

Ha status = `accepted`, akkor nem rotál automatikusan.

---

# HeroCommissionState

```ts
export type HeroCommissionState = {
  commissionId: EntityId;
  templateId: EntityId;

  heroId: EntityId;
  heroName: string;
  heroClass: HeroClass;

  requiredBlueprintId: EntityId;
  requiredItemType: ItemType;

  minLevel: number;
  preferredAffix?: AffixType;
  bonusRarity?: Rarity;

  goldRewardMultiplier: number;
  reputationReward: number;

  baseFeedbackChance: number;

  status:
    | "active"
    | "waiting_for_blueprint"
    | "completed"
    | "dismissed"
    | "expired";

  isMissingBlueprintCommission: boolean;

  arrivedAt: TimestampMs;
  expiresAt: TimestampMs;
  completedAt?: TimestampMs;
  dismissedAt?: TimestampMs;
};
```

Hero commission max 90 sec aktív.  
Dismiss után 5 perc cooldown.

---

# HeroRuntimeState

```ts
export type HeroRuntimeState = {
  heroesById: Record<EntityId, HeroState>;
};
```

## HeroState

```ts
export type HeroState = {
  heroId: EntityId;
  name: string;
  heroClass: HeroClass;

  firstSeenAt: TimestampMs;
  lastSeenAt: TimestampMs;

  relationshipXp: number;

  completedCommissionIds: EntityId[];
  equippedItemIds: EntityId[];

  historyEventIds: EntityId[];
};
```

MVP-ben hero memory light:

- hero név,
- completed commission,
- feedback log,
- equipped item hivatkozás.

---

# PrestigeState

```ts
export type PrestigeState = {
  forgeSigilsEarnedTotal: number;
  forgeSigilsSpentTotal: number;

  masterworkItemIds: EntityId[];
  legendaryItemIds: EntityId[];

  completedPrestigeRuns: PrestigeRunRecord[];
};
```

## PrestigeRunRecord

```ts
export type PrestigeRunRecord = {
  runId: EntityId;
  completedAt: TimestampMs;

  masterworkItemId: EntityId;
  forgeSigilsEarned: number;

  repLevelAtPrestige: number;
  forgeTierAtPrestige: number;
};
```

---

# EventLogState

```ts
export type EventLogState = {
  entries: EventLogEntry[];
  maxEntries: number;
};
```

## EventLogEntry

```ts
export type EventLogEntry = {
  eventId: EntityId;

  type:
    | "craft_started"
    | "craft_completed"
    | "item_sold_market"
    | "guild_contract_accepted"
    | "guild_contract_completed"
    | "guild_contract_rotated"
    | "hero_commission_arrived"
    | "hero_commission_completed"
    | "hero_commission_expired"
    | "hero_commission_dismissed"
    | "hero_feedback"
    | "blueprint_purchased"
    | "upgrade_purchased"
    | "tier_upgraded"
    | "rep_level_up"
    | "legendary_crafted"
    | "prestige_completed";

  text: string;

  relatedItemId?: EntityId;
  relatedHeroId?: EntityId;
  relatedContractId?: EntityId;
  relatedCommissionId?: EntityId;

  createdAt: TimestampMs;
};
```

---

# TimerState

```ts
export type TimerState = {
  lastResourceTickAt: TimestampMs;
  lastOfflineProgressAt?: TimestampMs;
};
```

Resource tick és offline progress timestamp ne keveredjen a save timestamp-pel.

---

# SaveGame

```ts
export type SaveGame = {
  saveVersion: number;
  savedAt: TimestampMs;
  gameState: GameState;
};
```

MVP-ben is kell save version.  
Később migration:

```ts
migrateSave(save): SaveGame
```

---

# Derived state, amit ne tároljunk

| Derived | Forrás |
|---|---|
| available blueprints | Rep + Tier + config + owned |
| current Rep title | reputation config |
| can prestige | prestige requirement check |
| matching orders for item | inventory + orders |
| item type display name | item type config |
| rarity multiplier | rarity config |
| current hero arrival interval | Rep + timing config |

Kevesebb save corruption, könnyebb balance update.

---

# Prestige reset runtime szabály

## Resetelődik

- Gold,
- Iron Ore,
- Wood,
- active orders,
- normal workshop upgrades,
- Goldból vett inventory bővítés,
- active crafts.

## Megmarad

- Forge Sigil,
- Forge Sigil upgrade-ek,
- Legendary archive,
- Masterwork History,
- completed prestige run records,
- permanent inventory slot bonus,
- cosmetic / collection.

Prestige után új `currentRunId` generálódik.

---

# Minimum initial GameState

```ts
export const createInitialGameState = (now: number): GameState => ({
  version: 1,

  player: {
    reputationXp: 0,
    reputationLevel: 1,
    completedGuildContracts: 0,
    completedHeroCommissions: 0,
    completedOrdersTotal: 0,
    craftedItemCount: 0,
    craftedRareCount: 0,
    craftedEpicCount: 0,
    craftedLegendaryCount: 0,
    currentRunId: createId(),
    totalPrestiges: 0
  },

  resources: {
    gold: 0,
    ironOre: 12,
    wood: 6,
    forgeSigil: 0,
    ironOreCap: 30,
    woodCap: 25,
    ironOreRatePerSecond: 1 / 8,
    woodRatePerSecond: 1 / 10
  },

  workshop: {
    forgeTier: 1,
    maxItemLevelCap: 8,
    forgeSlots: [{ slotId: createId(), isUnlocked: true }],
    activeCraftsById: {},
    craftSpeedMultiplier: 1,
    itemLevelMinBonus: 0,
    rarityBonusTier: 0,
    guildContractSlots: 2,
    heroCommissionSlots: 1,
    manualGuildRefreshEnabled: false,
    inventorySlotBonusFromGold: 0,
    inventorySlotBonusFromSigils: 0
  },

  inventory: {
    itemIds: [],
    maxSlots: 20
  },

  itemsById: {},

  blueprints: {
    ownedBlueprintIds: ["bp_sword_base"]
  },

  upgrades: {
    ownedUpgradeIds: [],
    ownedPrestigeUpgradeIds: []
  },

  orders: {
    guildContractsById: {},
    activeGuildContractIds: [],
    heroCommissionsById: {},
    activeHeroCommissionIds: []
  },

  heroes: {
    heroesById: {}
  },

  prestige: {
    forgeSigilsEarnedTotal: 0,
    forgeSigilsSpentTotal: 0,
    masterworkItemIds: [],
    legendaryItemIds: [],
    completedPrestigeRuns: []
  },

  log: {
    entries: [],
    maxEntries: 200
  },

  timers: {
    lastResourceTickAt: now
  },

  currentCityId: "oakvale",
  lastSavedAt: now
});
```
