# MVP Implementation Plan

## Cél

Ez a dokumentum fejlesztési sorrendet és implementációs fókuszt ad a **Blacksmith for Heroes Idle** MVP-hez.

A cél nem minden rendszer egyszerre való megépítése, hanem egy gyorsan játszható, iterálható vertical slice:

> Resource tick → craft → item roll → inventory → order leadás → reward → unlock → prestige.

## Prioritási elv

Először azt kell validálni, hogy:

1. jó érzés-e craftolni,
2. jó-e a Guild vs Hero döntés,
3. érthető-e a Rep / Gold / Tier bottleneck,
4. működik-e az első prestige cél.

A UI, log, feedback és content mélyítés csak akkor értékes, ha a core craft loop már működik.

---

# Milestone A — Craftable Prototype

## Cél

A játékos tudjon alapanyagból Swordöt craftolni, item rollt kapni, inventoryba tenni és marketre eladni.

## Beépítendő rendszerek

| Modul | Kötelező |
|---|---|
| App state | igen |
| Save/load alap | igen |
| Resource tick | igen |
| Iron Ore / Wood cap | igen |
| Forge tab | igen |
| 1 forge slot | igen |
| Sword Blueprint owned | igen |
| Craft timer | igen |
| Item roll | igen |
| Inventory | igen |
| Market sell | igen |

## Implementációs lépések

1. Hozd létre a globális game state-et.
2. Kösd be a `resources.config`.
3. Implementáld a resource ticket timestamp alapján.
4. Hozd létre a Forge slot modellt.
5. Implementáld a Sword craft indítást.
6. Craft completion után generálj itemet.
7. Tedd inventoryba.
8. Market sell: `sellValue * 0.35`, 0 Reputation.
9. Mentsd a state-et local storage / persistent save alapján.

## Elfogadási teszt

- Player látja az Iron Ore / Wood növekedést.
- Player elindít egy Sword craftot.
- Timer lefut.
- Item reveal megjelenik.
- Item inventoryba kerül.
- Player eladja marketre.
- Gold nő.
- Reputation nem nő.

## Ne épüljön még

- Guild order,
- hero commission,
- prestige,
- advanced blueprint,
- feedback log.

---

# Milestone B — Order Economy Prototype

## Cél

Működjön a két fő gazdasági csatorna:

- Guild Contract = Gold,
- Hero Commission = Reputation.

## Beépítendő rendszerek

| Modul | Kötelező |
|---|---|
| Orders tab | igen |
| Guild Contracts section | igen |
| Hero Commissions section | igen |
| 2 guild slot | igen |
| 1 hero slot | igen |
| Guild contract generation | igen |
| Hero commission generation | igen |
| Order matching | igen |
| Guild partial delivery | igen |
| Hero delivery | igen |
| Reward application | igen |

## Implementációs lépések

1. Hozd létre a `GuildContract` és `HeroCommission` state modelleket.
2. Kösd be a guild/hero template configot.
3. Generálj 2 guild contractot owned blueprint alapján.
4. Generálj 1 hero commissiont current Rep / Tier alapján.
5. Implementáld az order matchinget:
   - item type egyezik,
   - item level >= minimum.
6. Guild contractnál engedd a partial deliveryt.
7. Hero commissionnél egy item leadásával complete.
8. Reward:
   - guild: Gold magas, Rep alacsony,
   - hero: Rep magas, Gold alacsonyabb.
9. Completion után event log bejegyzés később vagy egyszerű debug log.

## Elfogadási teszt

- Player guild contractot teljesít és Goldot kap.
- Player hero commissiont teljesít és sok Reputationt kap.
- Player érti, hogy miért kell mindkét csatorna.

---

# Milestone C — Progression Prototype

## Cél

Bejön a Rep / Shop / Gold / Tier bottleneck.

## Beépítendő rendszerek

| Modul | Kötelező |
|---|---|
| Reputation XP bar | igen |
| Rep level calculation | igen |
| Blueprint Shop | igen |
| Bow / Staff / Axe Blueprint | igen |
| Shop lock reason | igen |
| Workshop tab | igen |
| Basic upgrades | igen |
| Tier 2 / Tier 3 | igen |
| Advanced blueprints | igen |
| Multi-item crafting | igen |

## Implementációs lépések

1. Implementáld a Rep threshold számítást:
   - 0 / 100 / 250 / 625 / 1650.
2. Rep level változáskor unlock eventet dobj.
3. Shop tab:
   - owned,
   - available,
   - locked.
4. Shop lock mutassa:
   - Gold cost,
   - Rep requirement,
   - Tier requirement.
5. Blueprint purchase.
6. Multi-item crafting:
   - Sword,
   - Bow,
   - Staff,
   - Axe.
7. Workshop upgrade purchase.
8. Tier upgrade:
   - Tier 2: 700 Gold + 10 completed order + Better Anvil I.
   - Tier 3: 1800 Gold + 25 completed order + 1 Epic + Tier 2.
9. Tier cap alkalmazása item levelre.
10. Tier 3 után Legendary roll engedélyezése.

## Elfogadási teszt

- Rep 2 után Bow Blueprint megjelenik shopban.
- Player Goldért megveszi.
- Bow craftolható.
- Rep 3 után Staff elérhető.
- Tier 2 után advanced blueprintek elérhetővé válnak.
- Tier 3 után Legendary roll engedélyezett.

---

# Milestone D — MVP Candidate

## Cél

Az első teljes run prestige-ig játszható.

## Beépítendő rendszerek

| Modul | Kötelező |
|---|---|
| Missing-blueprint hero commission | igen |
| Hero arrival timer | igen |
| Hero expiry timer | igen |
| Hero dismiss cooldown | igen |
| Guild offered rotation | igen |
| Event Log | igen |
| Hero feedback | igen |
| Epic+ guild warning | igen |
| Legendary archive | igen |
| Masterwork Frame | igen |
| Masterwork History | igen |
| Light prestige | igen |
| Forge Sigil upgrades | igen |

## Implementációs lépések

1. Hero commission timing:
   - Rep 1–2: 5 perc arrival,
   - Rep 3: 4 perc,
   - Rep 4: 3 perc,
   - Rep 5: 2 perc,
   - active duration: 90 sec.
2. Dismiss:
   - 5 perc cooldown.
3. Guild offered rotation:
   - nem accepted contract 5–10 perc után rotál,
   - accepted contract marad.
4. Missing-blueprint hero:
   - ha blueprint shopban elérhető, de nincs owned,
   - max 1 aktív.
5. Event Log tab.
6. Feedback template pool.
7. Legendary archive.
8. Epic+ warning guild deliverynél.
9. Masterwork eligibility:
   - Rep 5,
   - Tier 3,
   - Masterwork Frame,
   - Epic+ Lv 15+,
   - 5 hero,
   - 5 guild.
10. Prestige:
   - Masterwork item elhasználódik,
   - Masterwork History-ba kerül,
   - player Forge Sigilt kap,
   - soft reset,
   - permanent upgrade választás.

## Elfogadási teszt

- Player végig tud játszani egy teljes run-t.
- Rep 5 és Tier 3 után képes Masterworköt készíteni.
- Prestige után Forge Sigilt kap.
- Sigil upgrade megmarad reset után.

---

# Implementation order összefoglaló

| Sorrend | Modul | Milestone |
|---:|---|---|
| 1 | Resource tick | A |
| 2 | Forge + craft timer | A |
| 3 | Item roll | A |
| 4 | Inventory + market sell | A |
| 5 | Guild contracts | B |
| 6 | Hero commissions | B |
| 7 | Reputation levels | C |
| 8 | Blueprint Shop | C |
| 9 | Multi-item crafting | C |
| 10 | Workshop upgrades | C |
| 11 | Tier upgrades | C |
| 12 | Advanced blueprints | C |
| 13 | Timers / rotation / dismiss | D |
| 14 | Feedback + Log | D |
| 15 | Masterwork + prestige | D |

---

# Debug / test tools ajánlás

Fejlesztéshez érdemes debug panelt építeni.

## Debug actions

- Add Gold +100 / +1000
- Add Rep +50 / +500
- Add Iron Ore / Wood
- Force craft complete
- Force rarity roll
- Force Epic
- Force Legendary
- Set Rep Level
- Set Tier
- Spawn guild contract
- Spawn hero commission
- Reset run
- Export save JSON

## Miért kell?

Idle balance-t debug tool nélkül nagyon lassú tesztelni. Ez nem extra feature, hanem fejlesztési gyorsító.

---

# Technikai scope guard

Ne épüljön MVP előtt:

- dungeon,
- arena,
- armor,
- saját karakter,
- monetization,
- live events,
- complex catalyst system,
- repair / durability.

Ezek mind bővíthetők később, de az MVP validációt nem segítik.
