# Development Tasks

## Cél

Ez a dokumentum fejlesztői taskokra bontja az MVP-t.

A taskok milestone-ok szerint vannak csoportosítva:

- Milestone A: Craftable Prototype
- Milestone B: Order Economy Prototype
- Milestone C: Progression Prototype
- Milestone D: MVP Candidate

Minden task célja, hogy kicsi, tesztelhető és commitolható legyen.

---

# Milestone A — Craftable Prototype

## A1. Create base TypeScript types

### Cél

Létrehozni az alap domain type fájlokat.

### Érintett fájlok

```txt
src/types/common.types.ts
src/types/item.types.ts
src/types/resources.types.ts
src/types/gameState.types.ts
src/types/save.types.ts
```

### Acceptance criteria

- `EntityId`, `TimestampMs`, `ItemType`, `Rarity`, `AffixType` létezik.
- `GameState` alap shape fordul.
- TypeScript compile hibamentes.

---

## A2. Create baseline config files

### Cél

A core balance adatok configból jöjjenek.

### Érintett fájlok

```txt
src/config/resources.config.ts
src/config/itemTypes.config.ts
src/config/rarities.config.ts
src/config/affixes.config.ts
src/config/blueprints.config.ts
src/config/inventory.config.ts
```

### Acceptance criteria

- Sword Blueprint owned-by-default konfigban van.
- Sword cost: 4 Iron Ore + 1 Wood.
- Sword craft time: 10 sec.
- Rarity table tartalmaz Common–Legendary értékeket.

---

## A3. Create initial game state

### Cél

Induló `GameState` létrehozása.

### Érintett fájlok

```txt
src/game/state/createInitialGameState.ts
src/game/state/gameStore.ts
```

### Acceptance criteria

- Gold = 0.
- Iron Ore = 12 / 30.
- Wood = 6 / 25.
- Rep = 0, Level 1.
- Tier = 1.
- Sword Blueprint owned.
- 1 forge slot unlocked.
- Inventory max slots = 20.

---

## A4. Implement resource tick

### Cél

Iron Ore és Wood auto-fill capig.

### Érintett fájlok

```txt
src/game/systems/resourceSystem.ts
src/game/state/actions.ts
```

### Acceptance criteria

- Iron Ore nő 1 / 8 sec rate-tel.
- Wood nő 1 / 10 sec rate-tel.
- Egyik sem megy cap fölé.
- Negatív elapsed nem ad resource-t.
- Resource tick tesztelve.

---

## A5. Implement craft start

### Cél

Player tudjon Sword craftot indítani.

### Érintett fájlok

```txt
src/game/systems/craftSystem.ts
src/game/rules/unlockRules.ts
```

### Acceptance criteria

- Craft nem indul material nélkül.
- Craft nem indul nem owned blueprinttel.
- Craft nem indul foglalt slotban.
- Craft start levonja a materialt.
- Craft létrehoz `ActiveCraft` objektumot.
- Forge slot foglalt lesz.

---

## A6. Implement item generation

### Cél

Craft completionkor item roll generálódik.

### Érintett fájlok

```txt
src/game/systems/itemGenerationSystem.ts
src/game/rng/rng.ts
src/game/rng/weightedRandom.ts
```

### Acceptance criteria

- Item level számolódik.
- Rarity roll működik.
- Legendary Tier 1-en nem rollol.
- Affix roll működik Rare+ esetén.
- Power és sellValue számolódik.
- Display name generálódik.

---

## A7. Implement craft completion

### Cél

Kész craftból inventory item lesz.

### Érintett fájlok

```txt
src/game/systems/craftSystem.ts
src/game/systems/inventorySystem.ts
```

### Acceptance criteria

- Kész craft complete-elhető.
- Item bekerül `itemsById` mapbe.
- Item ID bekerül inventoryba.
- Forge slot felszabadul.
- Active craft törlődik.
- Craft counter nő.

---

## A8. Implement inventory and market sell

### Cél

Item lifecycle minimum működjön.

### Érintett fájlok

```txt
src/game/systems/inventorySystem.ts
```

### Acceptance criteria

- Inventory max 20 item.
- Market sell Goldot ad.
- Market sell 35% sellValue.
- Market sell nem ad Reputationt.
- Sold item kikerül inventoryból.
- Item state `sold_market`.

---

## A9. Build Forge UI

### Cél

Player UI-ból tudjon craftolni és eladni.

### Érintett fájlok

```txt
src/features/forge/ForgeTab.tsx
src/features/forge/ForgeSlot.tsx
src/features/forge/CraftResultPanel.tsx
src/components/game/TopResourceBar.tsx
src/components/game/ItemCard.tsx
```

### Acceptance criteria

- Top bar mutatja resource-okat.
- Sword craft indítható UI-ból.
- Craft timer látható.
- Completion után item látható.
- Item eladható marketre.

---

## A10. Implement basic save/load

### Cél

Refresh után ne vesszen el az állapot.

### Érintett fájlok

```txt
src/game/systems/saveSystem.ts
src/game/systems/offlineProgressSystem.ts
```

### Acceptance criteria

- State mentődik local storage-ba.
- Reload után state visszatölt.
- Save version szerepel.
- Offline resource capig számol.
- Offline craft completion működik legalább 1 slotra.

---

# Milestone B — Order Economy Prototype

## B1. Create order types and templates

### Cél

Guild és Hero order runtime modellek létrehozása.

### Érintett fájlok

```txt
src/types/order.types.ts
src/content/guildContractTemplates.config.ts
src/content/heroCommissionTemplates.config.ts
```

### Acceptance criteria

- GuildContractState létezik.
- HeroCommissionState létezik.
- Legalább 2 guild template.
- Legalább 1 hero template.

---

## B2. Generate starter guild contracts

### Cél

2 guild contract induláskor.

### Acceptance criteria

- 2 offered guild contract generálódik.
- Csak owned blueprintből kér.
- Rotation timer beáll.
- UI-ban megjelenik.

---

## B3. Generate hero commission

### Cél

1 aktív hero commission loop.

### Acceptance criteria

- Hero arrival timer működik.
- Hero commission generálódik.
- Hero 90 sec után lejár.
- Dismiss 5 perc cooldownnal működik.

---

## B4. Implement order matching

### Cél

Item leadható orderre.

### Acceptance criteria

- Item type match működik.
- Min level check működik.
- Guild partial delivery működik.
- Hero single delivery működik.
- Wrong item rejected.

---

## B5. Implement rewards

### Cél

Gold vs Reputation split működjön.

### Acceptance criteria

- Guild magas Goldot és kevés Repet ad.
- Hero sok Repet és kevesebb Goldot ad.
- Player counters frissülnek.
- Log entry létrejön.

---

# Milestone C — Progression Prototype

## C1. Reputation levels

### Acceptance criteria

- Rep thresholds működnek: 0 / 100 / 250 / 625 / 1650.
- Rep level up log jön.
- Shop unlockok derived state-ből frissülnek.

## C2. Blueprint Shop

### Acceptance criteria

- Bow Rep 2 után elérhető.
- Staff Rep 3 után elérhető.
- Axe Rep 4 után elérhető.
- Lock reason világos.
- Purchase levon Goldot.

## C3. Workshop upgrades

### Acceptance criteria

- Better Mine növeli Iron rate-et.
- Better Lumber Yard növeli Wood rate-et.
- Better Anvil csökkenti craft time-ot.
- Fine Tools javít item level minimumot.
- Polishing Kit rarity boostot ad.

## C4. Tier upgrades

### Acceptance criteria

- Tier 2: 700 Gold + 10 orders + Better Anvil I.
- Tier 3: 1800 Gold + 25 orders + 1 Epic + Tier 2.
- Nincs hard Rep requirement.
- Tier cap működik.

## C5. Advanced blueprints

### Acceptance criteria

- Advanced patternök Tier 2 mögött vannak.
- +base level működik.
- material/craft time multiplier működik.
- Shop lock reason helyes.

---

# Milestone D — MVP Candidate

## D1. Feedback system

### Acceptance criteria

- Hero commission után feedback roll fut.
- Feedback chance cap 90%.
- Template filter működik.
- Reward adódik.
- Log entry létrejön.

## D2. Legendary archive

### Acceptance criteria

- Legendary craft külön logot kap.
- Legendary bekerül archive-ba.
- Legendary nem veszhet el végleg leadással.

## D3. Masterwork and prestige

### Acceptance criteria

- canPrestige minden feltételt ellenőriz.
- Masterwork item elhasználódik.
- Masterwork History frissül.
- Forge Sigil reward 1–3.
- Reset rules működnek.

## D4. Prestige upgrades

### Acceptance criteria

- Forge Sigil költhető.
- Permanent storage upgrade megmarad reset után.
- Gold upgrade resetelődik.
- Sigil upgrade nem resetelődik.

---

# Első implementációs fókusz

Ne kezdj Milestone B/C/D elemekkel.

Első cél:

> Milestone A végére legyen egy játszható craft → item → market loop.

Ha ez nem jó érzésű, a későbbi rendszerek nem mentik meg.
