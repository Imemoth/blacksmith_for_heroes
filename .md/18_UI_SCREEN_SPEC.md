# UI Screen Spec

## Cél

Ez a dokumentum az MVP képernyők funkcionális wireframe-jét írja le.

Nem vizuális art direction, hanem komponens- és állapotspecifikáció.

## MVP tabok

```txt
Forge | Orders | Shop | Workshop | Log
```

Minden tab felett legyen top resource bar.

---

# Top Resource Bar

## Tartalom

```txt
Gold: 420 | Iron Ore: 18/30 | Wood: 11/25 | Rep: 180/250 | Tier 1
```

## Kötelező elemek

| Elem | Mutassa |
|---|---|
| Gold | aktuális mennyiség |
| Iron Ore | aktuális / cap |
| Wood | aktuális / cap |
| Reputation | aktuális XP / következő threshold |
| Tier | current forge tier |

## Tooltip / extra

- Rep tooltip: title + next unlock.
- Tier tooltip: max item level + Legendary állapot.

---

# Forge Tab

## Cél

A fő crafting képernyő.

## Layout

```txt
[Top Resource Bar]

[Forge Slots]
  Slot 1: Empty / Crafting / Complete

[Blueprint Selector]
  Sword
  Bow
  Staff
  Axe
  Advanced patterns if owned

[Selected Blueprint Card]
  Cost
  Craft time
  Expected level range
  Possible rarity
  Start Craft button

[Craft Result Panel]
  Last crafted item

[Matching Orders Panel]
  This item matches...
```

## Forge Slot állapotok

### Empty

```txt
[Empty Slot]
Select a blueprint to start crafting.
```

### Crafting

```txt
Crafting: Iron Sword
Time left: 00:07
```

### Complete

```txt
Craft complete!
[Reveal Item]
```

MVP-ben auto reveal is elfogadható.

---

# Item Reveal Panel

## Tartalom

```txt
Rare Sharp Iron Sword
Lv 7
Power: 72
Affix: Sharp +8
Sell Value: 72 Gold

[Assign to Order] [Sell to Market]
```

## Rarity feedback

Minimum text/visual hierarchy:

- Common: normál
- Fine: enyhén kiemelt
- Rare: erős kiemelés
- Epic: nagy reveal
- Legendary: külön modal / Log event

---

# Matching Orders Panel

Craft után mutassa, hova jó az item.

```txt
Matches:
- Town Guard Contract: Sword Lv 3+
- Borin Commission: Sword Lv 5+
```

## Ha nincs match

```txt
No active orders match this item.
[Sell to Market]
```

## Epic+ warning

Ha Epic vagy Legendary itemet guild contractra adna:

```txt
This item may be better used for Hero Commission or Masterwork.
Deliver anyway?
[Cancel] [Deliver]
```

---

# Orders Tab

## Layout

```txt
[Top Resource Bar]

[Guild Contracts]
  Contract cards

[Hero Commissions]
  Hero cards
```

---

# Guild Contract Card

## Offered state

```txt
Town Guard
Need: 0 / 3 Sword Lv 2+
Reward: 120 Gold + 6 Rep
Rotates in: 04:32

[Accept Contract]
```

## Accepted state

```txt
Town Guard
Need: 1 / 3 Sword Lv 2+
Reward: 120 Gold + 6 Rep
Status: Accepted

[Deliver Matching Items]
```

## Completed state

```txt
Completed!
+120 Gold
+6 Rep
```

## Szabály

- Offered contract mutat rotation timert.
- Accepted contract nem rotál.
- Partial delivery látszódjon.

---

# Hero Commission Card

## Active state

```txt
Borin the Guard
Wants: Sword Lv 2+
Preference: Sharp
Reward: 25 Gold + 30 Rep
Feedback Chance: 35%
Leaves in: 01:12

[Deliver Item] [Dismiss]
```

## Waiting for blueprint

```txt
Arin the Ranger
Wants: Bow Lv 4+
Requires: Bow Blueprint
Available in Shop: 180 Gold
Leaves in: 01:12

[Go to Shop] [Dismiss]
```

## Expired state

```txt
Borin left.
```

## Dismiss cooldown display

```txt
New hero can be dismissed in: 04:55
```

vagy

```txt
Dismiss unavailable: cooldown active.
```

---

# Shop Tab

## Layout

```txt
[Blueprint Shop]

Base Blueprints
Advanced Patterns
Masterwork
```

## Blueprint Card

### Available

```txt
Bow Blueprint
Unlocks: Bow crafting
Cost: 180 Gold
Requires: Rep 2 + Tier 1
[Buy]
```

### Locked

```txt
Apprentice Staff Pattern
Advanced Staff craft
Cost: 650 Gold
Requires: Rep 3 + Tier 2
Locked: Tier 2 required
```

### Owned

```txt
Sword Blueprint
Owned
```

## Lock reason priority

Ha több okból locked:

1. Rep hiány
2. Tier hiány
3. Gold hiány
4. prerequisite hiány

UI mutathat több okot is.

---

# Workshop Tab

## Layout

```txt
[Forge Tier Panel]
[Material Upgrades]
[Forge Upgrades]
[Quality Upgrades]
[Order Upgrades]
[Storage Upgrades]
[Prestige Upgrades if available]
```

## Tier Panel

```txt
Forge Tier: 2
Max Item Level: 15
Legendary Roll: Locked until Tier 3
```

Tier 3 után:

```txt
Forge Tier: 3
Max Item Level: 20
Legendary Roll: 0.05%
```

## Upgrade Card

```txt
Better Anvil I
Craft time -15%
Cost: 120 Gold
[Buy]
```

## Locked upgrade

```txt
Master Forge
Cost: 1800 Gold
Requires:
- 25 completed orders
- 1 Epic item crafted
- Reinforced Forge

[Locked]
```

---

# Log Tab

## Cél

Világreakció és history.

## Log entry típusok

- craft completed,
- guild completed,
- hero completed,
- hero feedback,
- blueprint purchased,
- tier upgraded,
- legendary crafted,
- prestige completed.

## Layout

```txt
[Event Log]

12:04 — Borin used your Fine Iron Sword to defend the north gate.
12:02 — You crafted a Rare Sharp Iron Sword.
11:58 — Bow Blueprint purchased.
```

## Max entries

MVP baseline:

```txt
200 entries
```

Régi entryk törölhetők, de Legendary/Masterwork history külön maradjon.

---

# Modalok

## Epic+ guild warning

```txt
This item may be better used for Hero Commission or Masterwork.
Deliver anyway?

[Cancel] [Deliver]
```

## Legendary warning

```txt
Legendary items are extremely rare.
Are you sure you want to deliver it to this guild contract?

[Cancel] [Deliver Legendary]
```

## Prestige confirmation

```txt
Forge Legacy

This will consume your Masterwork item and reset your current forge.
You will gain 1–3 Forge Sigils.

Kept:
- Legendary Archive
- Masterwork History
- Forge Sigil upgrades

Reset:
- Gold
- Materials
- Current orders
- Gold upgrades

[Cancel] [Begin Legacy]
```

---

# Empty states

## Empty inventory

```txt
No crafted items yet.
Start crafting in the Forge.
```

## No matching orders

```txt
No active orders match this item.
Sell it to the market or keep it for later.
```

## No hero active

```txt
No hero is waiting right now.
Next hero arrives in: 03:42
```

## No shop unlock

```txt
Gain more Reputation to attract better blueprint sellers.
```

---

# Mobile / responsive note

MVP legyen mobile-friendly, de nem kell teljes mobile polish.

Ajánlott:

- top bar compact,
- tabs sticky,
- cards stacked,
- no dense tables in actual game UI.

---

# Acceptance criteria

UI akkor MVP-kész, ha:

- player 3 kattintáson belül tud craftot indítani,
- craft után világos, mit kapott,
- itemről látszik, mire jó,
- Orders tabon külön látszik Guild és Hero,
- Shop lock reason egyértelmű,
- Workshopban látszik a Tier cél,
- Logban megjelenik a világreakció,
- prestige előtt világos, mi fog resetelődni.
