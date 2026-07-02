# Open Questions Cleanup

## Lezárt döntések

### Inventory bővítés

- Induló cap: 20.
- Early bővítés: Gold upgrade.
- Prestige esetén Gold alapú bővítés resetelhet.
- Permanent bővítés: Forge Sigil.

### Offline progress

MVP-ben light verzió:

- Iron Ore capig,
- Wood capig,
- futó craft completion,
- nincs komplex order/feedback/prestige offline simulation.

### Hero commission timer

- Rep 1–2: legfeljebb 5 percenként érkezik új hős.
- Magasabb Rep csökkenti az arrival timert.
- Hero aktív maradási ideje: max 1,5 perc.
- Ez szándékos pressure.

### Hero dismiss

- Engedélyezett.
- Cooldown: 5 perc.
- Cél: ne legyen ingyenes reroll exploit.

### Guild contract rotation

- Ha még nem fogadtad el: 5–10 perc után cserélődhet.
- Ha elfogadtad: marad, amíg teljesíted.
- Completion után új contract jön.

### Advanced blueprint hatása

- Tier 2 mögött.
- +1/+2 base level.
- jobb / szűkített affix pool.
- +20–30% material cost.
- +10–20% craft time.
- nincs direkt rarity boost MVP-ben.

### Polishing Kit

Baseline jó:

| Rarity | Polishing Kit I után |
|---|---:|
| Common | 78.8% |
| Fine | 16.5% |
| Rare | 4.0% |
| Epic | 0.62% |
| Legendary | Tier 3 után 0.08% |

### Legendary kezelés

- Tier 3 után rollolhat.
- Base chance: 0.05%.
- Automatikusan archiválódik.
- Csak Legendary kap egyedi artifact nevet.
- First prestige nem kér Legendaryt.

### Epic+ guild warning

Kötelező.

### Masterwork item prestige-nél

- Elhasználódik normál inventory szempontból.
- Átkerül Masterwork History / Hall of Legacy listába.
- Nem marad sima itemként.

## Ténylegesen nyitva maradt kérdések

Ezek már nem strukturálisak, hanem balance/content/UI finomítások.

### Balance

- pontos craft időgörbe,
- pontos Gold reward formula,
- pontos Hero Rep reward,
- Tier 2/3 árak finomítása,
- Masterwork Frame ára,
- offline cap méret,
- hero timer pontos Rep skálázása.

### Content

- hősnevek száma,
- guild nevek száma,
- feedback text mennyiség,
- Legendary névlista,
- order template mennyiség,
- Epic descriptor lista.

### UI

- Log tab listanézet vagy event kártya,
- inventory lista vagy kompakt grid,
- craft reveal animáció,
- shop lock vizuális nyelv,
- hero timer pressure mennyire legyen hangsúlyos.

## Fejlesztés előtt még érdemes eldönteni

1. Vizuális stílus: cozy medieval, dark fantasy, cartoon RPG vagy semi-serious?
2. Milyen technológiával készül az MVP?
3. Mobil portrait, web responsive vagy desktop-first?
4. Szükséges-e analytics/debug panel a balance teszthez?
5. Lesz-e exportálható save/debug state?

## Következő ajánlott lépés

Fejlesztés előtt érdemes készíteni egy:

- `MVP_IMPLEMENTATION_PLAN.md`,
- `CONFIG_SCHEMA.md`,
- `FIRST_60_MINUTES_BALANCE.md`.

Ezek már közvetlenül fejlesztői specifikációk lennének.
