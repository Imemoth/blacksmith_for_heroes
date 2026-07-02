# Save and Offline Progress

## Cél

Idle játékban a save/offline rendszer nem mellékes feature, hanem core infrastruktúra.  
Ez a dokumentum rögzíti, mit mentünk, hogyan töltünk vissza, és mit számolunk offline.

## Alapelv

- A save csak runtime állapotot tárol.
- A config/content statikus importból jön.
- Derived state-et nem mentünk.
- Offline progress MVP-ben egyszerű és kontrollált.
- Save version már MVP-ben legyen.

---

# SaveGame struktúra

```ts
export type SaveGame = {
  saveVersion: number;
  savedAt: number;
  gameState: GameState;
};
```

## Kötelező mezők

| Mező | Szerep |
|---|---|
| `saveVersion` | későbbi migration |
| `savedAt` | utolsó mentés timestamp |
| `gameState` | runtime state |

## Nem mentjük

| Adat | Miért? |
|---|---|
| config objektumok | statikus importból jönnek |
| content poolok | statikus importból jönnek |
| available blueprints | derived |
| current Rep title | derived |
| can prestige | derived |
| matching orders | derived |
| item type display name | configból jön |

---

# Save versioning

## MVP

```ts
const CURRENT_SAVE_VERSION = 1;
```

## Load flow

```txt
1. raw save beolvasás
2. JSON parse
3. saveVersion ellenőrzés
4. migration, ha kell
5. validation / repair
6. offline progress alkalmazás
7. game state betöltés
```

## Migration stub

```ts
function migrateSave(save: SaveGame): SaveGame {
  if (save.saveVersion === CURRENT_SAVE_VERSION) return save;

  // future migration steps here

  return {
    ...save,
    saveVersion: CURRENT_SAVE_VERSION
  };
}
```

Már MVP-ben legyen helye, még ha nincs is tényleges migration.

---

# Save frequency

## Ajánlott mentési pontok

Save fusson:

- craft start után,
- craft complete után,
- item sell után,
- guild delivery után,
- hero delivery után,
- blueprint purchase után,
- upgrade purchase után,
- tier upgrade után,
- prestige után,
- tab váltáskor opcionálisan,
- 10–30 másodpercenként autosave-ként.

## Ne mentsünk minden frame-ben

Resource tick ne triggereljen folyamatos mentést másodpercenként.  
Elég periodikus autosave + fontos actionök.

---

# Offline progress MVP

## Számoljuk offline

| Rendszer | Offline? |
|---|---|
| Iron Ore termelés | igen, capig |
| Wood termelés | igen, capig |
| Futó craft completion | igen |
| Több futó craft | igen, ha több slot van |
| Resource cap | igen |

## Nem számoljuk offline MVP-ben

| Rendszer | Offline? |
|---|---|
| Új guild contract generálás komplexen | nem |
| Hero arrival | nem vagy csak load után újraszámolva |
| Hero feedback event | nem |
| Prestige progress | nem |
| Automatikus market sell | nem |
| Order completion | nem |
| Blueprint purchase | nem |

## Miért?

Az MVP offline legyen érthető, ne exploitálható.  
A player térjen vissza nyersanyaggal és kész crafttal, de ne játssza le a teljes gazdaságot helyette a rendszer.

---

# Offline resource számítás

## Formula

```ts
elapsedSeconds = (now - lastResourceTickAt) / 1000

ironOre = min(
  ironOreCap,
  ironOre + elapsedSeconds * ironOreRatePerSecond
)

wood = min(
  woodCap,
  wood + elapsedSeconds * woodRatePerSecond
)
```

## Kerekítés

Resource lehet integer.

Ajánlás:

```ts
Math.floor(value)
```

vagy belső fractional storage később. MVP-ben integer elég.

---

# Offline craft completion

## Szabály

Ha egy craft `completesAt <= now`, akkor load során complete-elhető.

```ts
for each activeCraft:
  if activeCraft.completesAt <= now:
    completeCraftOffline()
```

## Fontos

Offline craft completion itemet generál.  
RNG szükséges hozzá.

## Determinisztikusabb opció

A craft startkor előre le lehet generálni a craft eredményt, és completionkor csak reveal történik.

### Előnye

- offline load nem randomizál visszamenőleg,
- kevesebb exploit,
- könnyebb save/load.

### Hátránya

- item már craft startkor eldől.

## Ajánlás MVP-re

**Craft result generálódjon completionkor**, de save/load során is ugyanaz a `completeCraft` function fusson.  
Később seeded RNG vagy pre-roll jöhet, ha exploit gond van.

---

# Offline cap guard

## Maximum offline time

Ajánlott MVP guard:

```ts
maxOfflineSeconds = 8 * 60 * 60
```

Tehát max 8 óra offline progress.

## Miért?

- ne legyen többnapos exploit,
- mobil/idle játékban mégis hasznos,
- később prestige upgrade növelheti.

## UI üzenet

```txt
While you were away:
+30 Iron Ore
+25 Wood
2 crafts completed
```

---

# Time manipulation guard

## Probléma

A player átállíthatja az órát.

## MVP guard

- Ha `now < savedAt`, ne adj offline progresszt.
- Ha elapsed extrém nagy, capeld.
- Ha elapsed negatív, állítsd 0-ra.

```ts
elapsed = clamp(now - savedAt, 0, maxOfflineMs)
```

Ez nem teljes anti-cheat, de MVP-re elég.

---

# Save validation / repair

Load után ellenőrizzük:

| Ellenőrzés | Javítás |
|---|---|
| resource negatív | 0-ra clamp |
| material cap alatt? | cap szerint clamp |
| missing owned sword blueprint | add `bp_sword_base` |
| inventory item id nem létezik | remove inventoryból |
| active craft id nem létezik | forge slot clear |
| Rep level nem egyezik XP-vel | recalculate |
| Tier cap nem egyezik Tierrel | recalculate |

Dev módban lehet warning log.

---

# Prestige save hatása

## Resetelődik

| State | Reset |
|---|---|
| Gold | 0 |
| Iron Ore | starting amount |
| Wood | starting amount |
| active orders | clear |
| active crafts | clear |
| Gold upgrade-ek | clear |
| Gold inventory slot bónusz | clear |
| normal blueprints | baseline szerint, vagy reset policy szerint |

## Megmarad

| State | Megmarad |
|---|---|
| Forge Sigil | igen |
| Sigil upgrade-ek | igen |
| permanent inventory slot bonus | igen |
| Legendary archive | igen |
| Masterwork History | igen |
| prestige run records | igen |
| totalPrestiges | igen |

## Masterwork item

Prestige-nél:

- normál inventoryból kikerül,
- state = `archived_masterwork`,
- bekerül `masterworkItemIds` listába.

---

# Save UX

## Manual save kell?

MVP-ben nem kötelező, de debug buildben hasznos.

## Export/import save

Could Have, de fejlesztéshez erősen ajánlott.

```txt
[Export Save JSON]
[Import Save JSON]
[Reset Save]
```

## Reset confirmation

```txt
This will erase your current forge. Are you sure?
```

---

# Acceptance criteria

A save/offline rendszer akkor kész, ha:

- refresh után megmarad a state,
- craft start után reloadolva futó craft megmarad,
- offline eltelt idő után material capig nő,
- offline craft completion működik,
- negatív idő nem ad rewardot,
- extrém offline idő capelve van,
- prestige után a megfelelő dolgok resetelődnek,
- Forge Sigil upgrade megmarad.
