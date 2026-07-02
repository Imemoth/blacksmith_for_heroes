# Milestone A Build Spec — Craftable Prototype

## Cél

Az első játszható build célja:

> A player tudjon resource-ból Swordöt craftolni, item rollt kapni, inventoryba tenni, majd marketre eladni.

Ez az MVP legkisebb valódi gameplay slice-a.

---

# Scope

## Benne van

| Feature | Státusz |
|---|---|
| GameState | kell |
| Resource tick | kell |
| Iron Ore / Wood cap | kell |
| Sword Blueprint | kell |
| 1 forge slot | kell |
| Sword craft | kell |
| Craft timer | kell |
| Item level roll | kell |
| Rarity roll | kell |
| Affix roll alap | kell |
| Power / sell value | kell |
| Inventory | kell |
| Market sell | kell |
| Basic save/load | kell |
| Forge tab UI | kell |

## Nincs benne

| Feature | Miért nincs |
|---|---|
| Guild Contracts | Milestone B |
| Hero Commissions | Milestone B |
| Blueprint Shop | Milestone C |
| Reputation progression | Milestone C |
| Tier upgrades | Milestone C |
| Feedback | Milestone D |
| Prestige | Milestone D |

---

# Starting state

```ts
{
  gold: 0,
  ironOre: 12,
  wood: 6,
  ironOreCap: 30,
  woodCap: 25,
  reputationXp: 0,
  reputationLevel: 1,
  forgeTier: 1,
  maxItemLevelCap: 8,
  ownedBlueprintIds: ["bp_sword_base"],
  inventorySlots: 20,
  forgeSlots: 1
}
```

---

# Player flow

## 1. Player belép

Látja:

```txt
Gold: 0 | Iron Ore: 12/30 | Wood: 6/25 | Rep: 0/100 | Tier 1
```

## 2. Player kiválasztja Sword craftot

UI mutatja:

```txt
Sword
Cost: 4 Iron Ore + 1 Wood
Time: 10s
[Start Craft]
```

## 3. Player elindítja

Material levonódik:

```txt
Iron Ore: 8/30
Wood: 5/25
```

Forge slot:

```txt
Crafting Sword...
Time left: 00:10
```

## 4. Craft befejeződik

Item reveal:

```txt
Fine Iron Sword
Lv 3
Power: 32
Sell Value: 32 Gold
[Sell to Market]
```

## 5. Player eladja

Gold nő:

```txt
+11 Gold
```

Market formula:

```txt
floor(sellValue * 0.35)
```

---

# Required UI

## ForgeTab

Minimum layout:

```txt
[Top Resource Bar]

[Forge Slot]
- Empty / Crafting / Complete

[Craft Options]
- Sword

[Last Craft Result]
- Item Card

[Inventory]
- Item list
```

## TopResourceBar

Mutassa:

- Gold,
- Iron Ore / cap,
- Wood / cap,
- Rep,
- Tier.

## ItemCard

Mutassa:

- display name,
- rarity,
- level,
- power,
- sell value,
- affix if exists,
- Sell to Market button.

---

# Core rules

## Resource tick

```txt
Iron Ore: +1 every 8 sec, cap 30
Wood: +1 every 10 sec, cap 25
```

## Sword craft

```txt
Cost: 4 Iron Ore + 1 Wood
Time: 10 sec
```

## Item level

```txt
level = clamp(
  blueprintBaseLevel + forgeTierBonus + toolBonus + randomRoll,
  1,
  maxItemLevelCap
)
```

For Milestone A:

```txt
blueprintBaseLevel = 1
forgeTierBonus = 0
toolBonus = 0
randomRoll = 0–3
maxItemLevelCap = 8
```

Expected level: 1–4.

## Rarity

Milestone A can use full rarity table, but Legendary disabled due Tier 1.

| Rarity | Chance |
|---|---:|
| Common | normalized after Legendary removal |
| Fine | normalized |
| Rare | normalized |
| Epic | normalized |
| Legendary | 0 |

Simpler option:

| Rarity | Chance |
|---|---:|
| Common | 82% |
| Fine | 15% |
| Rare | 2.6% |
| Epic | 0.4% |
| Legendary | 0% |

## Power

```txt
power = level * typeMultiplier * rarityMultiplier + affixBonus
```

Sword type multiplier:

```txt
10
```

## Sell value

```txt
sellValue = floor(power)
```

## Market

```txt
marketGold = floor(sellValue * 0.35)
```

No Reputation.

---

# Implementation files

## Types

```txt
src/types/common.types.ts
src/types/item.types.ts
src/types/resources.types.ts
src/types/gameState.types.ts
src/types/save.types.ts
```

## Config

```txt
src/config/resources.config.ts
src/config/itemTypes.config.ts
src/config/rarities.config.ts
src/config/blueprints.config.ts
src/config/inventory.config.ts
```

## Systems

```txt
src/game/systems/resourceSystem.ts
src/game/systems/craftSystem.ts
src/game/systems/itemGenerationSystem.ts
src/game/systems/inventorySystem.ts
src/game/systems/saveSystem.ts
src/game/systems/offlineProgressSystem.ts
```

## UI

```txt
src/components/game/TopResourceBar.tsx
src/components/game/ItemCard.tsx
src/features/forge/ForgeTab.tsx
src/features/forge/ForgeSlot.tsx
src/features/forge/CraftResultPanel.tsx
```

---

# Debug tools for Milestone A

Minimum debug panel:

```txt
[+10 Iron]
[+10 Wood]
[+100 Gold]
[Force Complete Craft]
[Force Rare]
[Force Epic]
[Reset Save]
[Export Save]
```

Ez gyorsítja a balance tesztet.

---

# Acceptance checklist

Milestone A akkor kész, ha:

- app elindul error nélkül,
- resource tick működik,
- craft nem indul material nélkül,
- craft materialt von le,
- craft timer működik,
- craft completion itemet generál,
- item inventoryba kerül,
- item eladható marketre,
- Gold nő market sell után,
- Reputation nem nő market sell után,
- save/load működik refresh után,
- offline resource capig számol,
- offline craft completion működik.

---

# Nem cél

Ne próbáld Milestone A-ban már szépíteni:

- advanced UI animáció,
- hősök,
- guildök,
- shop,
- prestige,
- balance perfect.

Milestone A célja csak ez:

> működik-e és jó érzésű-e a craft reveal pillanat?
