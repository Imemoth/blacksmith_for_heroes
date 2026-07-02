# UI and Data Model

## MVP tabok

| Tab | Funkció |
|---|---|
| Forge | craft indítás, active slot, item reveal |
| Orders | Guild Contracts + Hero Commissions |
| Shop | Blueprint Shop |
| Workshop | upgrade-ek, Tier, material income |
| Log | hero feedback, craft history, Legendary, prestige |

## Top bar

Minden képernyő tetején:

```txt
Gold: 420 | Iron Ore: 18/30 | Wood: 11/25 | Rep: 180/250 | Tier 1
```

## Forge tab

Tartalom:

- resource státusz,
- forge slot,
- blueprint választás,
- craft cost,
- craft time,
- start craft gomb,
- legutóbbi item reveal,
- matching order suggestion.

Craft után a UI mutassa:

- mely guild contractra jó,
- mely hero commissionre jó,
- market sell opció.

## Orders tab

Két szekció:

### Guild Contracts

Mutassa:

- guild név,
- required itemek,
- delivered / required,
- min level,
- reward,
- accepted állapot,
- rotáció timer, ha nem accepted.

### Hero Commissions

Mutassa:

- hero név,
- class,
- required item,
- min level,
- preferred affix / rarity bonus,
- reward,
- maradási timer,
- feedback chance,
- missing-blueprint esetén Go to Shop.

## Shop tab

Blueprint card mutassa:

- Gold cost,
- required Rep,
- required Tier,
- owned / locked,
- miért locked.

## Workshop tab

Szekciók:

- Forge upgrades,
- Material upgrades,
- Storage upgrades,
- Order upgrades,
- Quality upgrades,
- Tier upgrades.

Tier UI:

```txt
Forge Tier: 2
Max Item Level: 15
Legendary Roll: Locked until Tier 3
```

Tier 3 után:

```txt
Legendary Roll: 0.05%
```

## Log tab

Log eventek:

- craft completed,
- guild contract completed,
- hero commission completed,
- hero feedback,
- blueprint unlocked,
- tier upgraded,
- legendary crafted,
- prestige completed.

## Minimum adatmodellek

### PlayerState

```ts
type PlayerState = {
  reputationXp: number;
  reputationLevel: number;
  forgeTier: number;
  maxItemLevelCap: number;
  completedGuildContracts: number;
  completedHeroCommissions: number;
  currentRunId: string;
  totalPrestiges: number;
};
```

### Resources

```ts
type Resources = {
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

### Item

```ts
type Item = {
  itemId: string;
  itemType: "sword" | "bow" | "staff" | "axe";
  blueprintId: string;
  displayName: string;
  rarity: "common" | "fine" | "rare" | "epic" | "legendary";
  level: number;
  power: number;
  sellValue: number;
  affix?: string;
  ownerType: "inventory" | "guild" | "hero" | "market" | "masterwork";
  ownerId?: string;
  createdAt: number;
  runId: string;
  isArchived: boolean;
};
```

### GuildContract

```ts
type GuildContract = {
  contractId: string;
  guildName: string;
  requiredItems: {
    itemType: string;
    quantityRequired: number;
    quantityDelivered: number;
  }[];
  minLevel: number;
  goldReward: number;
  reputationReward: number;
  status: "offered" | "accepted" | "completed" | "rotated";
  generatedAt: number;
  rotateAt?: number;
};
```

### HeroCommission

```ts
type HeroCommission = {
  commissionId: string;
  heroId: string;
  requiredItemType: string;
  minLevel: number;
  preferredAffix?: string;
  bonusRarity?: string;
  goldRewardMultiplierMin: number;
  goldRewardMultiplierMax: number;
  reputationReward: number;
  status: "active" | "waiting_for_blueprint" | "completed" | "dismissed" | "expired";
  requiredBlueprintId?: string;
  isMissingBlueprintCommission: boolean;
  arrivalAt: number;
  expiresAt: number;
  baseFeedbackChance: number;
};
```

### EventLogEntry

```ts
type EventLogEntry = {
  eventId: string;
  type: string;
  text: string;
  relatedHeroId?: string;
  relatedItemId?: string;
  relatedContractId?: string;
  createdAt: number;
};
```
