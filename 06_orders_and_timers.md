# Orders and Timers

## Két rendelési csatorna

| Típus | Fő cél | Reward |
|---|---|---|
| Guild Contracts | bulk gyártás, pénztermelés | magas Gold, kevés Rep |
| Hero Commissions | személyes craft, hírnév | magas Rep, alacsonyabb Gold |

## Orders tab

Két külön szekció:

```txt
Guild Contracts
Hero Commissions
```

## Kezdő slotok

| Slot | Kezdő érték |
|---|---:|
| Guild Contract slot | 2 |
| Hero Commission slot | 1 |
| Forge slot | 1 |

## Guild Contracts

### Szabály

Guild contract csak owned blueprintből generálódik.

### Refresh / rotáció

- Ha a guild contractot **elfogadtad**, addig marad, amíg teljesíted.
- Ha még **nem fogadtad el**, 5–10 perc után automatikusan lecserélődhet.
- Completion után új contract generálódik.
- Manual refresh csak későbbi upgrade után.

### Miért jó?

A playernek van döntése:

- elfogadom és megtartom,
- hagyom rotálni,
- később manual refresh upgrade-del kontrollálom.

### Guild contract reward

| Méret | Rep XP baseline |
|---|---:|
| 2–3 item | 4–8 |
| 4–6 item | 10–18 |
| 7–10 item | 20–35 |

Gold reward:

> expected item value × quantity × 0.85–1.10

## Hero Commissions

### Szabály

Hero commission jöhet:

- owned blueprintre,
- vagy shopban elérhető, de még nem owned blueprintre.

Max 1 aktív missing-blueprint hero commission lehet.

### Timer pressure

Hero commission nem marad örökké.

| Progress | Hero érkezési maximum / ritmus |
|---|---|
| Rep 1–2 | legfeljebb 5 percenként új hero |
| Rep 3 | rövidebb timer |
| Rep 4 | még gyakoribb |
| Rep 5 | legismertebb állapot, leggyakoribb |

Pontos tesztérték:

| Rep | Hero arrival interval |
|---:|---|
| 1 | 5 perc |
| 2 | 5 perc |
| 3 | 4 perc |
| 4 | 3 perc |
| 5 | 2 perc |

### Hero maradási idő

A hős maximum **1,5 percig** marad aktív commissionként.

Ez szándékos pressure:

> Guild ordert gyártasz Goldért, vagy gyorsan kiszolgálod a hőst Reputationért?

### Hero dismiss

Dismiss engedélyezett, de cooldownnal:

- dismiss cooldown: **5 perc**,
- cél: ne legyen ingyenes hero reroll exploit,
- player fontolja meg, hogy elküldi-e.

### Missing-blueprint hero

Ha a hős olyan itemet kér, amelynek blueprintje shopban már elérhető, de nincs owned:

- megjelenhet,
- mutatja a szükséges blueprintet és árat,
- Go to Shop gombot kap,
- max 1 ilyen aktív.

Mivel a hős csak 1,5 percig marad, a missing-blueprint order pressure-t ad: van-e elég Goldod gyorsan megvenni?

## Hero reward

Hero Gold reward:

> item value × 0.50–0.90

Hero Reputation reward:

| Hero tier | Rep reward |
|---|---:|
| Basic hero | 25–40 |
| Ranger / early specialist | 40–65 |
| Mage / mid specialist | 60–90 |
| Mercenary / advanced | 85–130 |
| Veteran / Rep 5 candidate | 120–180 |

## Hero commission preference

MVP-ben preferencia bónusz, nem kötelező feltétel.

Példa:

- minimum: Bow Lv 4+
- preferred: Precise
- Precise nélkül teljesíthető,
- Precise affixszel extra Reputation / feedback chance.

## Order matching

MVP alap matching:

```txt
itemType egyezik
itemLevel >= minLevel
```

Preference és rarity csak bónusz.

## Guild vs Hero feszültség

A timer pressure miatt a player dönt:

- Guild contractot termel Goldért,
- vagy megszakítja a bulk ritmust és hőst szolgál ki Repért.

Ez jó játékfeszültség.
