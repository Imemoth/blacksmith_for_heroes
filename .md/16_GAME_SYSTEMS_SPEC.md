# Game Systems Spec

## Cél

Ez a dokumentum a játék fő system functionjeit definiálja.

A cél:

- UI ne tartalmazzon domain logicot,
- rendszerek legyenek tesztelhetők,
- szabályok legyenek tisztán elválasztva,
- game state módosítások kontrolláltak legyenek.

---

# System design elv

## Pure-first megközelítés

A legtöbb system:

```ts
function systemName(state: GameState, input: Input, context?: SystemContext): GameState
```

Vagy számolófüggvényként:

```ts
function calculateSomething(state: GameState): Result
```

## SystemContext

```ts
export type SystemContext = {
  now: number;
  rng: Rng;
};
```

## Rng interface

```ts
export type Rng = {
  nextFloat(): number;
};
```

---

# 1. Resource System

## `tickResources`

```ts
function tickResources(state: GameState, now: number): GameState
```

Feladat:

- eltelt idő számítása `lastResourceTickAt` óta,
- Iron Ore és Wood növelése rate alapján,
- cap alkalmazása,
- `lastResourceTickAt` frissítése.

Szabály:

- Gold nem tickel.
- Forge Sigil nem tickel.
- Iron/Wood nem mehet cap fölé.

---

## `canSpendResources`

```ts
function canSpendResources(
  state: GameState,
  cost: { gold?: number; ironOre?: number; wood?: number; forgeSigil?: number }
): boolean
```

## `spendResources`

```ts
function spendResources(
  state: GameState,
  cost: { gold?: number; ironOre?: number; wood?: number; forgeSigil?: number }
): GameState
```

Ha nincs elég resource, ne módosítsa a state-et, vagy dobjon domain errort.

---

# 2. Craft System

## `canStartCraft`

```ts
function canStartCraft(
  state: GameState,
  blueprintId: string
): { ok: boolean; reason?: string }
```

Ellenőrzések:

- blueprint owned,
- van szabad forge slot,
- van elég material,
- item type craftolható,
- required Tier teljesül,
- inventory nincs tele vagy completionkor kezelhető.

---

## `startCraft`

```ts
function startCraft(
  state: GameState,
  blueprintId: string,
  slotId: string,
  context: SystemContext
): GameState
```

Feladat:

- material levonása,
- craft duration kiszámítása,
- ActiveCraft létrehozása,
- forge slothoz rendelés,
- log entry: `craft_started`.

---

## `completeCraft`

```ts
function completeCraft(
  state: GameState,
  craftId: string,
  context: SystemContext
): GameState
```

Feladat:

- ellenőrzi, hogy craft kész-e,
- itemet generál,
- inventoryba teszi,
- craftot törli,
- forge slotot felszabadítja,
- stat countereket frissít,
- Legendary esetén archive,
- log entry: `craft_completed` / `legendary_crafted`.

---

# 3. Item Generation System

## `generateItem`

```ts
function generateItem(
  state: GameState,
  blueprintId: string,
  context: SystemContext
): ItemState
```

Lépések:

1. Blueprint config beolvasása.
2. Item type config beolvasása.
3. Item level roll:
   - blueprint base bonus,
   - forge tier bonus,
   - tool bonus,
   - random roll.
4. Tier cap alkalmazása.
5. Rarity roll.
6. Legendary csak Tier 3 után.
7. Affix roll.
8. Power számítás.
9. Sell value számítás.
10. Display name generálás.

---

## `rollRarity`

```ts
function rollRarity(
  state: GameState,
  context: SystemContext
): Rarity
```

Szabály:

- Tier 1–2: Legendary chance 0.
- Tier 3+: Legendary chance baseline 0.05%, Polishing Kit után 0.08%.
- Rarity table normalizálható, ha Legendary tiltva van.

---

## `generateItemName`

```ts
function generateItemName(
  itemType: ItemType,
  rarity: Rarity,
  affix?: AffixType,
  context?: SystemContext
): string
```

Szabály:

- Common: Iron Sword.
- Fine: Fine Iron Sword.
- Rare: Sharp Iron Sword.
- Epic: Mastercrafted Iron Sword.
- Legendary: weighted random Legendary név poolból.

---

# 4. Inventory System

## `addItemToInventory`

```ts
function addItemToInventory(state: GameState, item: ItemState): GameState
```

Ellenőrzés:

- inventory slot van-e,
- item bekerül `itemsById` mapbe,
- itemId bekerül inventory listába.

---

## `sellItemToMarket`

```ts
function sellItemToMarket(
  state: GameState,
  itemId: string
): GameState
```

Szabály:

- Gold reward = sellValue × 0.35.
- Reputation = 0.
- item state = `sold_market`.
- inventoryból kikerül.
- log entry: `item_sold_market`.

---

## `shouldWarnBeforeGuildDelivery`

```ts
function shouldWarnBeforeGuildDelivery(item: ItemState): boolean
```

Szabály:

- Epic vagy Legendary esetén true.

---

# 5. Order System

## `generateGuildContract`

```ts
function generateGuildContract(
  state: GameState,
  context: SystemContext
): GuildContractState | undefined
```

Szűrés:

- current city,
- Rep requirement,
- Tier requirement,
- required owned blueprints,
- item type compatibility,
- weighted random.

Szabály:

- Guild contract csak owned blueprintből jöhet.

---

## `generateHeroCommission`

```ts
function generateHeroCommission(
  state: GameState,
  context: SystemContext
): HeroCommissionState | undefined
```

Szűrés:

- current city,
- Rep requirement,
- Tier requirement,
- required blueprint:
  - owned, vagy
  - shopban elérhető, de nem owned,
- max 1 missing-blueprint commission aktív,
- weighted random.

---

## `acceptGuildContract`

```ts
function acceptGuildContract(
  state: GameState,
  contractId: string,
  now: number
): GameState
```

Szabály:

- status `offered` → `accepted`.
- accepted után nem rotál.

---

## `rotateOfferedGuildContracts`

```ts
function rotateOfferedGuildContracts(
  state: GameState,
  context: SystemContext
): GameState
```

Szabály:

- csak `offered` contract rotálhat,
- ha `rotateAt <= now`, új offered contract generálódik,
- accepted contract marad.

---

## `canItemSatisfyGuildRequirement`

```ts
function canItemSatisfyGuildRequirement(
  item: ItemState,
  contract: GuildContractState
): boolean
```

MVP matching:

- item type szerepel a required itemek között,
- item level >= contract minLevel,
- item state = inventory.

---

## `deliverItemToGuildContract`

```ts
function deliverItemToGuildContract(
  state: GameState,
  itemId: string,
  contractId: string
): GameState
```

Feladat:

- matching ellenőrzés,
- item state = assigned_guild,
- required item delivered listába kerül,
- ha minden quantity teljesült:
  - reward,
  - completion stat,
  - log,
  - új contract generálása.

---

## `canItemSatisfyHeroCommission`

```ts
function canItemSatisfyHeroCommission(
  item: ItemState,
  commission: HeroCommissionState
): boolean
```

MVP matching:

- item type egyezik,
- item level >= minLevel,
- item state = inventory.

---

## `completeHeroCommission`

```ts
function completeHeroCommission(
  state: GameState,
  itemId: string,
  commissionId: string,
  context: SystemContext
): GameState
```

Feladat:

- item matching,
- Gold reward = item value × commission multiplier,
- Reputation reward adása,
- item state = assigned_hero,
- hero history frissítése,
- commission complete,
- feedback roll előkészítése,
- log entry.

---

## `expireHeroCommissions`

```ts
function expireHeroCommissions(
  state: GameState,
  now: number
): GameState
```

Szabály:

- ha `expiresAt <= now`,
- status = expired,
- slot felszabadul.

---

## `dismissHeroCommission`

```ts
function dismissHeroCommission(
  state: GameState,
  commissionId: string,
  now: number
): GameState
```

Szabály:

- status = dismissed,
- heroDismissCooldownUntil = now + 5 perc,
- log entry.

---

# 6. Reputation System

## `addReputation`

```ts
function addReputation(
  state: GameState,
  amount: number
): GameState
```

Feladat:

- XP növelése,
- új Rep level számítása,
- Rep level up esetén log event.

---

## `calculateReputationLevel`

```ts
function calculateReputationLevel(reputationXp: number): number
```

Threshold:

- 0,
- 100,
- 250,
- 625,
- 1650.

---

# 7. Blueprint System

## `getAvailableBlueprints`

```ts
function getAvailableBlueprints(state: GameState): BlueprintConfig[]
```

Feltétel:

- requiredRepLevel <= current Rep,
- requiredForgeTier <= current Tier,
- nem owned.

---

## `canPurchaseBlueprint`

```ts
function canPurchaseBlueprint(
  state: GameState,
  blueprintId: string
): { ok: boolean; reason?: string }
```

Ellenőrzés:

- blueprint létezik,
- nem owned,
- Rep requirement,
- Tier requirement,
- elég Gold.

---

## `purchaseBlueprint`

```ts
function purchaseBlueprint(
  state: GameState,
  blueprintId: string
): GameState
```

Feladat:

- Gold levonása,
- blueprint owned listához adása,
- log entry.

---

# 8. Upgrade System

## `canPurchaseUpgrade`

```ts
function canPurchaseUpgrade(
  state: GameState,
  upgradeId: string
): { ok: boolean; reason?: string }
```

## `purchaseUpgrade`

```ts
function purchaseUpgrade(
  state: GameState,
  upgradeId: string
): GameState
```

Feladat:

- cost ellenőrzés,
- requirement ellenőrzés,
- resource levonás,
- ownedUpgradeIds frissítés,
- effect alkalmazás,
- log entry.

---

# 9. Tier System

## `canUpgradeTier`

```ts
function canUpgradeTier(
  state: GameState,
  targetTier: number
): { ok: boolean; reason?: string }
```

Tier 2:

- 700 Gold,
- 10 completed order,
- Better Anvil I.

Tier 3:

- 1800 Gold,
- 25 completed order,
- 1 Epic,
- Tier 2.

Fontos:

- nincs hard Rep requirement.

---

## `upgradeTier`

```ts
function upgradeTier(
  state: GameState,
  targetTier: number
): GameState
```

Feladat:

- Gold levonása,
- forgeTier beállítása,
- maxItemLevelCap frissítése,
- Legendary enabled derived Tierből,
- log entry.

---

# 10. Feedback System

## `rollFeedback`

```ts
function rollFeedback(
  state: GameState,
  commissionId: string,
  itemId: string,
  context: SystemContext
): FeedbackResult | undefined
```

Chance:

```txt
base hero chance
+ rarity bonus
+ preferred affix bonus
+ overdelivery bonus
cap 90%
```

## `generateFeedbackEvent`

```ts
function generateFeedbackEvent(
  state: GameState,
  feedback: FeedbackResult,
  context: SystemContext
): GameState
```

Feladat:

- feedback template kiválasztása,
- tokenek behelyettesítése,
- reward adása,
- log entry.

---

# 11. Prestige System

## `canPrestige`

```ts
function canPrestige(state: GameState): { ok: boolean; reason?: string }
```

Első prestige feltétel:

- Rep 5,
- Tier 3,
- Masterwork Frame owned,
- Epic vagy jobb item,
- Lv 15+,
- 5 hero commission,
- 5 guild contract.

---

## `applyPrestige`

```ts
function applyPrestige(
  state: GameState,
  masterworkItemId: string,
  context: SystemContext
): GameState
```

Feladat:

- item eligibility ellenőrzés,
- Forge Sigil reward generálás,
- Masterwork item state = archived_masterwork,
- Masterwork History frissítés,
- reset rules alkalmazása,
- új runId,
- log entry.

## Reset rules

Resetelődik:

- Gold,
- Iron Ore,
- Wood,
- active orders,
- active crafts,
- Gold upgrade-ek,
- Gold inventory bővítés.

Megmarad:

- Forge Sigil,
- Forge Sigil upgrade-ek,
- Legendary archive,
- Masterwork History,
- permanent inventory bővítés.

---

# 12. Save and Offline Progress System

## `saveGame`

```ts
function saveGame(state: GameState, now: number): SaveGame
```

## `loadGame`

```ts
function loadGame(save: SaveGame, now: number): GameState
```

Feladat:

- version check,
- migration,
- offline progress alkalmazása,
- invalid state guard.

---

## `applyOfflineProgress`

```ts
function applyOfflineProgress(
  state: GameState,
  now: number
): GameState
```

MVP offline számolja:

- Iron Ore capig,
- Wood capig,
- futó craft completiont.

Ne számolja:

- új order generálást komplexen,
- feedback eventeket,
- prestige-et,
- automatikus market sellt.

---

# 13. Content Selection System

## `filterUnlockedContent`

```ts
function filterUnlockedContent<T extends { unlock?: UnlockScope }>(
  entries: T[],
  context: ContentContext
): T[]
```

## `pickWeightedContent`

```ts
function pickWeightedContent<T extends { weight: number }>(
  entries: T[],
  rng: Rng
): T | undefined
```

Használat:

- hero name,
- guild name,
- feedback template,
- Legendary name,
- order template.

---

# 14. Validation System

## `validateConfig`

```ts
function validateConfig(): ValidationResult
```

Ellenőrizze:

- unique ID-k,
- valid item type-ok,
- rarity sum 1.0,
- advanced blueprint Tier >= 2,
- Legendary minTier >= 3,
- Rep threshold növekvő,
- Tier cap növekvő,
- template-ek blueprint reference-e létezik.

Dev módban fail esetén hard error.

---

# Kötelező system tesztek

## Craft

- nem indul craft material nélkül,
- craft után item inventoryba kerül,
- Tier cap működik,
- Legendary nem rollol Tier 1-en.

## Orders

- guild csak owned blueprintből generál,
- accepted guild nem rotál,
- offered guild rotál,
- hero kérhet shop-available nem-owned blueprintet,
- max 1 missing-blueprint hero aktív.

## Reputation / Tier

- Rep level threshold működik,
- Tier 2 requirement működik,
- Tier 3 nem kér Repet,
- Tier 3 engedélyezi Legendaryt.

## Prestige

- Rep 5 + Tier 3 + Epic Lv 15+ kell,
- Masterwork item archiválódik,
- Forge Sigil megmarad,
- Gold upgrade resetelődik,
- Sigil inventory upgrade megmarad.
