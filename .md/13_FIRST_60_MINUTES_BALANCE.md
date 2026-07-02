# First 60 Minutes Balance

## Cél

Ez a dokumentum az első 60 perc várható ritmusát írja le.

A számok tesztértékek. A cél nem végleges balansz, hanem egy ellenőrizhető pacing baseline:

> A játékos 60 perc alatt értse meg a craftot, a Guild vs Hero splitet, a Blueprint Shopot, a Tier rendszert, és lássa a Masterwork célt.

## Aktív játék feltételezés

Ez a pacing aktív, figyelő játékosra vonatkozik.

- Player gyakran craftol.
- Player figyeli a hero arrivalokat.
- Player teljesít guild orderöket.
- Player marketre eladja a rossz rollokat.
- Offline progress csak material capig számít.

---

# Globális első óra célok

| Idősáv | Domináns cél |
|---|---|
| 0–5 perc | Sword craft loop |
| 5–12 perc | első hero / guild döntés |
| 12–20 perc | Rep 2 + Bow Blueprint |
| 20–35 perc | Staff unlock / Tier 2 pressure |
| 35–50 perc | Axe / larger guild contracts |
| 50–60 perc | Tier 3 preview / Rep 5 aspiráció |

Rep 5 várhatóan nem biztos, hogy 60 percen belül megvan. A cél inkább az, hogy a player lássa és értse a Masterwork célt.

---

# Starting state

| Stat | Érték |
|---|---:|
| Gold | 0 |
| Iron Ore | 12 |
| Wood | 6 |
| Iron Ore cap | 30 |
| Wood cap | 25 |
| Rep XP | 0 |
| Rep Level | 1 |
| Tier | 1 |
| Forge slot | 1 |
| Guild slots | 2 |
| Hero slots | 1 |
| Inventory slots | 20 |

## Starting blueprint

| Blueprint | Állapot |
|---|---|
| Sword Blueprint | owned |

---

# 0–5 perc: Sword onboarding

## Cél

A player tanulja meg:

- alapanyag fogy,
- craft timer fut,
- item roll van,
- inventory van,
- market fallback van.

## Elvárt craftok

| Action | Várható szám |
|---|---:|
| Sword craft | 3–5 |
| Market sell | 0–2 |
| Guild delivery | 1 |
| Hero delivery | 0–1 |

## Kezdő guild contract példák

| Contract | Reward |
|---|---:|
| Town Guard: 2 Sword Lv 1+ | 80 Gold + 4 Rep |
| Village Militia: 3 Sword Lv 1+ | 120 Gold + 6 Rep |

## Első hero

Hero arrival Rep 1-en legfeljebb 5 percenként.

| Hero | Request | Reward |
|---|---|---:|
| Borin the Guard | Sword Lv 2+ | 25 Gold + 30 Rep |

## Balance cél

A player az első 5 percben legalább egyszer döntse el:

> A jobb Sword menjen Borinnak Repért, vagy a guildnek Goldért?

---

# 5–12 perc: első split megértése

## Cél

A player értse:

- Guild = Gold,
- Hero = Reputation,
- Market = rossz roll mentése.

## Várható állapot

| Stat | Várható |
|---|---:|
| Gold | 80–250 |
| Rep XP | 30–90 |
| Inventory | 2–8 item |
| Completed guild | 1–2 |
| Completed hero | 1–2 |

## Design check

Ha a player 12 percnél:

- nem érti, honnan jön a Reputation → hero UI túl gyenge,
- nincs Goldja Bowra → guild reward túl alacsony,
- túl sokat vár materialra → resource rate túl lassú.

---

# 12–20 perc: Rep 2 + Bow Blueprint

## Rep 2 threshold

| Rep | XP |
|---:|---:|
| 2 | 100 |

## Unlock

- Bow Blueprint megjelenik Shopban.
- Ranger hero pool aktív.
- Hunters' Guild csak Bow owned után jön.

## Bow Blueprint

| Blueprint | Ár |
|---|---:|
| Bow Blueprint | 180 Gold |

## Missing-blueprint pressure

Ha Rep 2 megvan, de Bow nincs owned:

```txt
Arin the Ranger
Wants: Bow Lv 4+
Requires: Bow Blueprint
Available in Shop: 180 Gold
Time remaining: 01:30
```

## Balance cél

A player tudja:

> Ha nincs elég Gold Bowra, guild ordert kell csinálnom.

Ez az első komoly rendszerösszekötés.

---

# 20–35 perc: Rep 3 + Staff + Tier 2 pressure

## Rep 3 threshold

| Rep | XP |
|---:|---:|
| 3 | 250 |

## Staff Blueprint

| Blueprint | Ár |
|---|---:|
| Staff Blueprint | 350 Gold |

## Tier 2

| Upgrade | Ár | Feltétel |
|---|---:|---|
| Reinforced Forge | 700 Gold | 10 completed order + Better Anvil I |

## Várható állapot 35 perc körül

| Stat | Várható |
|---|---:|
| Rep XP | 250–500 |
| Gold earned total | 800–1500 |
| Tier | 1 vagy 2 |
| Owned blueprints | Sword, Bow, esetleg Staff |
| Completed orders total | 8–15 |

## Balance cél

A player ütközzön bele:

- Staff drága,
- Tier 1 cap szűk,
- Tier 2 kéne advanced progressionhöz.

---

# 35–50 perc: Rep 4 + Axe + bulk economy

## Rep 4 threshold

| Rep | XP |
|---:|---:|
| 4 | 625 |

## Axe Blueprint

| Blueprint | Ár |
|---|---:|
| Axe Blueprint | 500 Gold |

## Rep 4 gameplay

A playernek már 3–4 item type lehet nyitva:

- Sword: stabil,
- Bow: Wood-heavy,
- Staff: drágább / lassabb,
- Axe: Iron-heavy / magasabb value.

## Várható új guildök

| Guild | Order |
|---|---|
| Mercenary Company | Axe bulk |
| Caravan Guard | mixed Sword + Bow |
| Advanced Town Guard | Sword Lv 7+ |

## Balance cél

A player érezze, hogy a material mix fontos:

- sok Axe → Iron Ore pressure,
- sok Staff/Bow → Wood pressure.

---

# 50–60 perc: Masterwork preview

## Rep 5 threshold

| Rep | XP |
|---:|---:|
| 5 | 1650 |

Rep 5 nem feltétlen 60 perces cél. A 60. percre a player inkább lássa:

- Masterwork Frame locked,
- Tier 3 locked,
- Epic Lv 15+ cél,
- Forge Legacy prestige preview.

## Tier 3

| Upgrade | Ár | Feltétel |
|---|---:|---|
| Master Forge | 1800 Gold | 25 completed order + 1 Epic + Tier 2 |

## Masterwork Frame

| Blueprint | Ár | Feltétel |
|---|---:|---|
| Masterwork Frame | 1500 Gold | Rep 5 + Tier 3 |

## Balance cél

A player kapjon egy hosszabb távú célt:

> Most már nem csak jobb orderöket csinálok; az első Masterwork felé megyek.

---

# Hero timer balance

## Arrival interval

| Rep | Arrival interval |
|---:|---:|
| 1 | 5 perc |
| 2 | 5 perc |
| 3 | 4 perc |
| 4 | 3 perc |
| 5 | 2 perc |

## Active duration

| Paraméter | Érték |
|---|---:|
| Hero active duration | 90 sec |
| Dismiss cooldown | 5 perc |

## Design intent

A hero nem örök order. Pressure-t ad:

- megszakítod a guild productiont Repért,
- vagy hagyod elmenni és Goldra fókuszálsz.

## Kockázat

90 sec túl rövid lehet, ha craft time hosszabb és nincs megfelelő item inventoryban.

## Ellenszer

- Early hero minimum legyen teljesíthető stock itemmel.
- Missing-blueprint hero csak akkor jöjjön, ha a blueprint shopban elérhető.
- Hero UI mutassa világosan az időt és rewardot.
- Ha kell, Rep 1–2 hero active duration lehet 120 sec, később 90 sec.

---

# Guild rotation balance

## Offered contract

| Állapot | Viselkedés |
|---|---|
| Not accepted | 5–10 perc után rotál |
| Accepted | marad teljesítésig |
| Completed | új contract generálódik |

## Design intent

A player ne ragadjon rossz ajánlatba, de ha elfogadta, ne veszítse el progress közben.

## Kockázat

Ha a contract túl gyorsan rotál, a player nem tud tervezni.

## Baseline

- rotáció random 300–600 sec,
- UI mutassa: `Rotates in 04:32`,
- accepted után timer eltűnik.

---

# Expected first hour economy

## Target totals aktív játékosnál

| Mutató | 60 perc körüli cél |
|---|---:|
| Total crafts | 60–120 |
| Completed guild contracts | 8–18 |
| Completed hero commissions | 4–10 |
| Total Gold earned | 1800–3500 |
| Rep XP | 600–1400 |
| Owned base blueprints | 2–4 |
| Tier | 2 valószínű, Tier 3 preview |
| Epic crafts | 0–2 |

## Megjegyzés

Az Epic 0.45% base chance mellett 100 craftból átlagosan 0.45 Epic várható. Polishing Kit nélkül az első Epic lehet később. Ez rendben van, mert Tier 3-hoz 1 Epic kell, így ez természetes bottleneck.

Ha túl lassú:

- Polishing Kit legyen korábban,
- Rare/Epic esély kis mértékben nőhet,
- Tier 3 feltétel lehet `1 Rare+` prototípusban, majd vissza Epicre.

---

# First hour red flags

## Red flag 1: Player nem vesz Bow Blueprintet 20 percig

Lehetséges ok:

- Gold túl lassú,
- Bow nem elég vonzó,
- Ranger commission nem jelenik meg elég erősen.

## Red flag 2: Player ignorálja a hero commissionöket

Lehetséges ok:

- Rep reward túl alacsony,
- hero timer túl stresszes,
- guild Gold túl domináns,
- Rep unlock nem elég látható.

## Red flag 3: Player csak hero commissiont csinál

Lehetséges ok:

- hero Gold reward túl magas,
- blueprint árak túl alacsonyak,
- guild contract nem elég hatékony.

## Red flag 4: Inventory túl gyorsan betelik

Lehetséges ok:

- 20 slot kevés,
- market sell UX túl lassú,
- matching suggestion hiányzik.

## Red flag 5: Tier 2 túl későn jön

Lehetséges ok:

- 700 Gold túl magas,
- 10 completed order túl sok,
- Better Anvil I requirement nincs eléggé kommunikálva.

---

# First hour analytics events

Fejlesztéshez mérni kell:

```txt
craft_started
craft_completed
item_sold_market
guild_contract_accepted
guild_contract_completed
hero_commission_arrived
hero_commission_completed
hero_commission_expired
hero_commission_dismissed
blueprint_unlocked
blueprint_purchased
upgrade_purchased
tier_upgraded
rep_level_up
inventory_full
```

## Fontos funnel

1. First craft complete.
2. First market sell.
3. First guild complete.
4. First hero complete.
5. Rep 2 reached.
6. Bow Blueprint purchased.
7. Tier 2 reached.
8. First Epic crafted.

Ha ezek közül bármelyik túl sokáig tart, pacing gond van.

---

# Ajánlott első balance teszt cél

Egy friss player 60 perc alatt:

- érje el legalább Rep 3-at,
- vegye meg legalább Bow Blueprintet,
- lássa Staff Blueprintet,
- érje el vagy közelítse Tier 2-t,
- teljesítsen legalább 3 hero commissiont,
- teljesítsen legalább 5 guild contractot,
- értse a Masterwork preview-t.

Ha ez sikerül, az MVP első órája valószínűleg elég olvasható.
