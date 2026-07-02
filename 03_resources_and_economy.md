# Resources and Economy

## MVP resource-ok

| Resource | Szerep |
|---|---|
| Gold | blueprint, upgrade, Tier fejlesztés, inventory bővítés |
| Iron Ore | Sword és Axe fő alapanyag |
| Wood | Bow és Staff fő alapanyag |
| Reputation XP | nem költhető társadalmi progression |
| Forge Sigil | prestige utáni permanent upgrade currency |

## Nem MVP resource-ok

| Resource | Későbbi szerep |
|---|---|
| Leather | optional quality boost / későbbi blueprint material |
| Gold Ore | rarity boost catalyst |
| Titanium | item level / Epic chance / advanced gear material |
| Dragon Scale | Legendary blueprint material |
| Dragonfire Core | unique fire/mage legendary material |
| Magimania Crystal | unique mage staff material |
| Coal | későbbi fuel vagy smelting layer |
| Essence | későbbi enchant layer |
| Guild Favor | későbbi special token |

## Economy split

| Loop | Fő reward | Mellék reward |
|---|---|---|
| Guild Contracts | Gold | kevés Reputation |
| Hero Commissions | Reputation | alacsonyabb Gold |
| Market fallback | kevés Gold | 0 Reputation |
| Masterwork | Forge Sigil | soft reset / legacy |

## Market fallback

- Bármely inventory item eladható.
- Reward: **35% item value**.
- Reputation: **0**.
- Nincs feedback, nincs hero memory.

Cél: rossz roll mentése, nem fő progression út.

## Inventory

Induló cap:

| Elem | Érték |
|---|---:|
| Inventory slots | 20 |

Bővítés:

- MVP early game-ben Gold upgrade.
- Prestige után Forge Sigil alapú permanent storage bővítés.

Prestige esetén:

- Goldból vett inventory upgrade resetelődhet.
- Forge Sigilből vett permanent inventory bővítés megmarad.

## Bottleneck sorrend

| Szakasz | Fő bottleneck |
|---|---|
| 0–5 perc | Iron Ore / Wood |
| 5–15 perc | Craft time |
| 15–30 perc | Blueprint Gold cost |
| 30–60 perc | Reputation / Tier / order capacity |
| Prestige előtt | Epic Lv 15+ Masterwork alap |

## Reward arányok

| Leadás | Gold | Reputation |
|---|---:|---:|
| Market | 35% item value | 0 |
| Guild | 85–110% item value összesen | kevés |
| Hero | 50–90% item value | sok |

## Kezdő resource baseline

| Resource | Kezdő érték |
|---|---:|
| Gold | 0 |
| Iron Ore | 12 |
| Wood | 6 |
| Forge Sigil | 0 |

## Termelés baseline

| Resource | Rate | Cap |
|---|---:|---:|
| Iron Ore | 1 / 8 sec | 30 |
| Wood | 1 / 10 sec | 25 |

## Offline progress

MVP-ben light offline progress:

- Iron Ore capig termelődik,
- Wood capig termelődik,
- futó craft befejeződhet,
- új order / feedback / prestige nem fut komplexen offline.
