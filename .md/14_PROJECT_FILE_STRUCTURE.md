# Project File Structure

## Cél

Ez a dokumentum a **Blacksmith for Heroes Idle** MVP javasolt projektstruktúráját írja le.

Fő célok:

- UI és game logic tiszta szétválasztása.
- Config és content adatvezérelt kezelése.
- Pure function alapú, tesztelhető game systems.
- Későbbi dungeon / arena / city / prestige bővítés támogatása.
- Ne nőjön minden egyetlen `App.tsx` fájlba.

---

# Alapelv

## 1. UI ne számoljon game logicot

Rossz:

```ts
const rarity = Math.random() < 0.03 ? "rare" : "common";
```

Jó:

```ts
const nextState = completeCraft(gameState, craftId, { now, rng });
```

## 2. Config és content külön

- `config/` = balance, economy, formula, unlock.
- `content/` = nevek, feedback text, guild template, hero template.

## 3. Game systems legyenek pure functionök

A legtöbb rendszer:

```ts
function someSystem(state: GameState, input: Input): GameState
```

vagy:

```ts
function calculateSomething(state: GameState): Result
```

---

# Javasolt mappaszerkezet

```txt
src/
  app/
    App.tsx
    providers.tsx

  components/
    common/
      Button.tsx
      Card.tsx
      ProgressBar.tsx
      TimerBar.tsx
      Modal.tsx
      Tabs.tsx

    game/
      TopResourceBar.tsx
      ItemCard.tsx
      BlueprintCard.tsx
      UpgradeCard.tsx
      GuildContractCard.tsx
      HeroCommissionCard.tsx
      EventLogEntry.tsx

  features/
    forge/
      ForgeTab.tsx
      ForgeSlot.tsx
      CraftResultPanel.tsx
      MatchingOrdersPanel.tsx

    orders/
      OrdersTab.tsx
      GuildContractsSection.tsx
      HeroCommissionsSection.tsx

    shop/
      ShopTab.tsx
      BlueprintShopSection.tsx

    workshop/
      WorkshopTab.tsx
      UpgradeSection.tsx
      TierUpgradeSection.tsx

    log/
      LogTab.tsx

  game/
    state/
      createInitialGameState.ts
      gameStore.ts
      selectors.ts
      actions.ts

    systems/
      resourceSystem.ts
      craftSystem.ts
      itemGenerationSystem.ts
      inventorySystem.ts
      orderSystem.ts
      reputationSystem.ts
      blueprintSystem.ts
      upgradeSystem.ts
      tierSystem.ts
      feedbackSystem.ts
      prestigeSystem.ts
      saveSystem.ts
      offlineProgressSystem.ts

    rules/
      matchingRules.ts
      unlockRules.ts
      rewardRules.ts
      validationRules.ts

    rng/
      rng.ts
      weightedRandom.ts

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
    timing.config.ts

  content/
    heroNames.config.ts
    guildNames.config.ts
    feedbackTemplates.config.ts
    legendaryNames.config.ts
    guildContractTemplates.config.ts
    heroCommissionTemplates.config.ts
    cityContent.config.ts

  types/
    common.types.ts
    resources.types.ts
    item.types.ts
    blueprint.types.ts
    order.types.ts
    hero.types.ts
    upgrade.types.ts
    prestige.types.ts
    gameState.types.ts
    save.types.ts
    config.types.ts
    content.types.ts

  utils/
    time.ts
    ids.ts
    math.ts
    format.ts
    assertions.ts

  tests/
    systems/
      craftSystem.test.ts
      orderSystem.test.ts
      reputationSystem.test.ts
      tierSystem.test.ts
      prestigeSystem.test.ts

    fixtures/
      testGameState.ts
```

---

# Mappák szerepe

## `app/`

App bootstrap:

- root component,
- provider setup,
- global layout.

Nem tartalmaz domain logicot.

## `components/common/`

Általános UI komponensek:

- Button,
- Card,
- Modal,
- ProgressBar,
- TimerBar,
- Tabs.

Nem ismerik a game domaint.

## `components/game/`

Újrahasználható játék-specifikus komponensek:

- ItemCard,
- BlueprintCard,
- GuildContractCard,
- HeroCommissionCard,
- UpgradeCard.

Megjeleníthetnek domain adatot, de mély game logicot nem számolnak.

## `features/`

Tab- és screen-szintű UI:

- Forge,
- Orders,
- Shop,
- Workshop,
- Log.

A feature komponensek actionöket hívnak, nem közvetlenül módosítanak state-et.

---

# `game/state/`

Runtime state kezelés.

## `createInitialGameState.ts`

Induló state:

- resources,
- player progression,
- starting blueprint,
- starting slots,
- empty inventory,
- first orders.

## `gameStore.ts`

State management helye.

MVP-re jó:

- Zustand,
- React reducer,
- Redux Toolkit.

## `selectors.ts`

Derived state:

```ts
getAvailableBlueprints(state)
getOwnedBlueprints(state)
getActiveGuildContracts(state)
getActiveHeroCommissions(state)
getCurrentRepLevel(state)
canPrestige(state)
```

## `actions.ts`

UI által hívott action wrapperök:

```ts
startCraftAction
completeCraftAction
sellItemAction
deliverItemToGuildAction
deliverItemToHeroAction
buyBlueprintAction
purchaseUpgradeAction
prestigeAction
```

Az action hívja a pure system functiont, majd menti az új state-et.

---

# `game/systems/`

Domain logic.

| Fájl | Felelősség |
|---|---|
| `resourceSystem.ts` | resource tick, cap, spending |
| `craftSystem.ts` | craft start / completion |
| `itemGenerationSystem.ts` | level, rarity, affix, name, power |
| `inventorySystem.ts` | add, remove, sell, capacity |
| `orderSystem.ts` | guild/hero generation, delivery, timers |
| `reputationSystem.ts` | XP, level, unlock check |
| `blueprintSystem.ts` | shop availability, purchase |
| `upgradeSystem.ts` | upgrade purchase, effects |
| `tierSystem.ts` | Tier eligibility, cap |
| `feedbackSystem.ts` | feedback roll, template, rewards |
| `prestigeSystem.ts` | Masterwork check, reset, Forge Sigil |
| `saveSystem.ts` | serialize / deserialize |
| `offlineProgressSystem.ts` | offline resources / craft completion |

---

# `game/rules/`

Kisebb újrahasználható szabályfüggvények:

```ts
canItemSatisfyGuildRequirement(item, contract)
canItemSatisfyHeroCommission(item, commission)
isBlueprintAvailableInShop(state, blueprintId)
isLegendaryEnabled(state)
isAdvancedBlueprint(blueprint)
```

---

# `game/rng/`

Minden random közös helyen legyen.

```ts
export type Rng = {
  nextFloat(): number;
};
```

Miért kell?

- determinisztikus tesztek,
- későbbi seeded run,
- weighted random központosítás.

---

# `config/`

Balance és rendszer config.

| Fájl | Tartalom |
|---|---|
| `resources.config.ts` | Gold, Iron Ore, Wood, Forge Sigil |
| `itemTypes.config.ts` | Sword/Bow/Staff/Axe cost/time/multiplier |
| `rarities.config.ts` | rarity esélyek és multiplier |
| `affixes.config.ts` | affix hatások |
| `reputation.config.ts` | Rep thresholdok |
| `tiers.config.ts` | Tier cap, Legendary unlock |
| `blueprints.config.ts` | blueprint árak és requirementek |
| `upgrades.config.ts` | workshop és prestige upgrade-ek |
| `prestige.config.ts` | prestige requirement/reset |
| `inventory.config.ts` | starting slots, expansion |
| `timing.config.ts` | hero/guild timer értékek |

---

# `content/`

Bővíthető content poolok.

| Fájl | Tartalom |
|---|---|
| `heroNames.config.ts` | hero név pool |
| `guildNames.config.ts` | guild név pool |
| `feedbackTemplates.config.ts` | feedback template-ek |
| `legendaryNames.config.ts` | Legendary item név pool |
| `guildContractTemplates.config.ts` | guild order template-ek |
| `heroCommissionTemplates.config.ts` | hero commission template-ek |
| `cityContent.config.ts` | városhoz kötött unlock/flavor |

Content selection:

1. feltételszűrés,
2. weighted random.

Szűrők:

- city,
- Rep,
- Tier,
- class,
- item type,
- blueprint,
- material,
- prestige count,
- tag.

---

# `types/`

TypeScript domain és config típusok.

| Fájl | Tartalom |
|---|---|
| `common.types.ts` | ID, timestamp, utility types |
| `resources.types.ts` | Resources |
| `item.types.ts` | Item, Rarity, Affix |
| `blueprint.types.ts` | Blueprint |
| `order.types.ts` | GuildContract, HeroCommission |
| `hero.types.ts` | Hero |
| `upgrade.types.ts` | Upgrade |
| `prestige.types.ts` | PrestigeState |
| `gameState.types.ts` | GameState |
| `save.types.ts` | SaveGame |
| `config.types.ts` | config schema |
| `content.types.ts` | content schema |

---

# Import szabályok

## UI importálhat

- components,
- features,
- game/actions,
- game/selectors,
- types.

## Systems importálhat

- config,
- content,
- types,
- rules,
- rng,
- utils.

## Config/content ne importáljon runtime state-et

Config legyen statikus.

Tiltott:

```txt
config/ -> game/
content/ -> game/state
```

---

# MVP egyszerűsített struktúra

Ha első körben túl soknak érződik:

```txt
src/
  components/
  features/
  game/
    systems/
    state/
  config/
  content/
  types/
  utils/
```

A lényeg:

- UI külön,
- system logic külön,
- config/content külön,
- types külön.

---

# Ajánlott első commit sorrend

1. `types/`
2. `config/`
3. `content/`
4. `game/state/createInitialGameState.ts`
5. `game/systems/resourceSystem.ts`
6. `game/systems/craftSystem.ts`
7. `game/systems/itemGenerationSystem.ts`
8. `features/forge/ForgeTab.tsx`

Ezzel gyorsan lesz játszható core.
