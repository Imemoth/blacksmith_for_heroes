# Crafting and Items

## Craft input

MVP craft:

> Blueprint + Iron Ore/Wood + Workshop stats + Timer → Item

## Craft output

Minden craft eredménye:

- item type,
- item level,
- rarity,
- affix,
- power,
- sell value,
- display name.

## Item type-ok

| Item | Iron Ore | Wood | Time | Type multiplier |
|---|---:|---:|---:|---:|
| Sword | 4 | 1 | 10s | 10 |
| Bow | 1 | 5 | 12s | 9 |
| Staff | 1 | 6 | 16s | 11 |
| Axe | 5 | 2 | 14s | 12 |

## Item level formula

> Item Level = Blueprint Base Level + Forge Tier Bonus + Tool Upgrade Bonus + Material Quality Bonus + Random Roll

MVP random roll:

- base: 0–3
- tool upgrade javíthatja a minimumot.

## Tier cap

| Tier | Max Item Level | Legendary |
|---:|---:|---|
| 1 | 8 | nincs |
| 2 | 15 | nincs |
| 3 | 20 | 0.05% baseline |

## Rarity

| Rarity | Chance | Power multiplier | Naming |
|---|---:|---:|---|
| Common | 81.5% | 1.00 | Iron Sword |
| Fine | 15% | 1.08 | Fine Iron Sword |
| Rare | 3% | 1.22 | Sharp Iron Sword |
| Epic | 0.45% | 1.50 | Mastercrafted Iron Sword |
| Legendary | 0.05% | 2.20 | Mooncleaver |

Legendary csak **Tier 3 után** rollolhat.

## Epic vs Legendary név

- Epic még nem teljesen egyedi artifact.
- Epic descriptor-t kap: Mastercrafted, Flawless, Reinforced.
- Legendary kap egyedi nevet: Mooncleaver, Dragonsbreath of Magimania.

## Affix pool

| Affix | Hatás | Item típus |
|---|---|---|
| Sharp | flat power bonus | Sword, Axe |
| Balanced | order value / general match | All |
| Precise | Ranger match | Bow, Sword |
| Arcane | Mage match | Staff |
| Heavy | Warrior / Mercenary match | Axe |

## Affix rarity szabály

| Rarity | Affix |
|---|---|
| Common | nincs |
| Fine | minor chance |
| Rare | 1 garantált |
| Epic | 1 erősebb garantált |
| Legendary | 1 affix + később unique trait |

## Power formula

> Power = Item Level × Type Multiplier × Rarity Multiplier + Affix Bonus

## Sell value

> Sell Value = Power × 1.0

## Epic+ warning

Ha player Epic vagy Legendary itemet guild contractra adna le, warning kell.

Epic warning:

> This item may be better used for Hero Commission or Masterwork. Deliver anyway?

Legendary warning:

> Legendary items are extremely rare. Are you sure?

## Legendary archive

Legendary craft után:

- item bekerül inventoryba,
- automatikusan bekerül Legendary Archive-ba,
- külön Log eventet kap,
- nem veszhet el végleg akkor sem, ha leadásra kerül.
