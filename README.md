# Blacksmith for Heroes Idle – Dokumentációs Index

## Cél

Ez a mappa a **Blacksmith for Heroes Idle** eddig megbeszélt rendszereit bontja szét külön `.md` fájlokra.  
Minden fájl egy önálló területet fed le, minimális átfedéssel.

## Alap koncepció

A játékos egy RPG-város kovácsa, aki hősöknek gyárt fegyvereket és páncélokat. A tárgyak nem egyszerű eladási tételek: visszahatnak a világra, mert a hősök használják őket, fejlődnek velük, később pedig akár dungeon-rendszerben, arénában vagy bajnoki kihívásokban is megjelenhetnek.

## Fő dokumentumok

| Fájl | Terület |
|---|---|
| `01_product_pillars.md` | Alap fantasy, USP, termékpozicionálás |
| `02_core_loop.md` | Fő MVP loop és session flow |
| `03_crafting_system.md` | Crafting folyamat és műhelylogika |
| `04_item_model.md` | Tárgyak szintje, rarityje, affixei |
| `05_reputation_system.md` | Reputation mint hozzáférési és bizalmi rendszer |
| `06_customer_and_hero_memory.md` | Hősök, rendelések, visszatérő karakterek |
| `07_economy_resources.md` | Currency-k, bottleneckek, sink/faucet modell |
| `08_prestige_system.md` | Forge Legacy / Masterwork prestige rendszer |
| `09_town_and_region_progression.md` | Város, district, region és craft cap modell |
| `10_personal_character.md` | Saját karakter és bound gear hosszabb távra |
| `11_dungeon_expeditions.md` | Dungeon expedition rendszer későbbi fázisra |
| `12_arena_hall_of_champions.md` | Aréna / Hall of Champions rendszer |
| `13_monetization.md` | Rewarded ad, IAP, pass és kozmetikai monetizáció |
| `14_mvp_scope.md` | MVP scope, kivágandó elemek, első verzió célja |
| `15_open_questions.md` | MVP előtt tisztázandó nyitott kérdések |

## Tervezési szabály

A projekt jelenlegi legfontosabb szabálya:

> Először legyen élvezetes tárgyat gyártani. Csak ezután kapjon súlyt a saját karakter, dungeon és aréna.

Ez védi a játékot a túl korai túlépítéstől.

# Blacksmith for Heroes Idle – Dokumentáció v2

## Verzió célja

Ez a dokumentáció a korábbi koncepciót frissíti az MVP-ről meghozott döntésekkel.

A v2 fő változásai:

- A **Tier nem hard Reputation-gate**.
- A **Reputation** a shop kínálatot, hősöket és társadalmi hozzáférést nyitja.
- A **Tier** craft technológiai szint: cap, Legendary roll, advanced blueprint használhatóság.
- A **Guild Contracts** és **Hero Commissions** külön rendelési csatornák.
- A Hero Commission erősebb Reputation forrás, de időnyomást kap.
- A Guild Contract főleg Gold forrás, automatikusan rotál, ha nem fogadod el.
- A Blueprint Shopban a Reputation unlockolja a kínálatot, de Goldért vásárolsz.
- Az inventory bővítés early game-ben Gold upgrade, prestige után Forge Sigil permanent bővítés.
- Az MVP tartalmaz light prestige-et.

## Dokumentumok

| Fájl | Tartalom |
|---|---|
| `01_product_pillars.md` | Alap fantasy, USP, fő design pillérek |
| `02_mvp_scope.md` | Végleges MVP scope és kizárt rendszerek |
| `03_resources_and_economy.md` | Resource-ok, bottleneckek, reward split |
| `04_crafting_and_items.md` | Craft formula, item level, rarity, affix |
| `05_reputation_tier_blueprints.md` | Reputation, Tier, Blueprint Shop progression |
| `06_orders_and_timers.md` | Guild és Hero rendeléslogika, timer, rotáció |
| `07_ui_and_data_model.md` | MVP UI tabok és minimális adatmodell |
| `08_mvp_config_tables.md` | Fejlesztésközeli baseline config táblák |
| `09_mvp_backlog.md` | Fejlesztési sorrend és milestone-ok |
| `10_open_questions_cleaned.md` | Lezárt és maradó nyitott kérdések |

## MVP alapmondat

A játékos egy kezdő kovács, aki guild bulk rendelésekből Goldot, személyes hős commissionökből Reputationt szerez, blueprinteket vásárol, fejleszti a műhelyét, jobb tárgyakat craftol item level + rarity rollal, majd Rep 5 és Tier 3 után elkészíti az első Masterworköt és prestige-el.

| `14_PROJECT_FILE_STRUCTURE.md` | Projekt mappaszerkezet és architektúra |
| `15_DOMAIN_TYPES.md` | Runtime domain modellek és save state típusok |
| `16_GAME_SYSTEMS_SPEC.md` | Pure system functionök és szabályspecifikáció |

| `17_SAVE_AND_OFFLINE_PROGRESS.md` | Save/load, offline progress, anti-exploit guard, prestige reset hatás |
| `18_UI_SCREEN_SPEC.md` | Forge/Orders/Shop/Workshop/Log képernyőspecifikáció |
| `19_CONTENT_STARTER_PACK.md` | Induló Oakvale content: hősök, guildök, feedback, legendary nevek, template-ek |
| `20_BALANCE_TABLES.md` | Egy helyre gyűjtött MVP balance táblák |
| `21_TESTING_CHECKLIST.md` | QA/dev tesztlista core rendszerekhez |

| `22_DEVELOPMENT_TASKS.md` | MVP task bontás milestone-ok és acceptance criteria szerint |
| `23_MILESTONE_A_BUILD_SPEC.md` | Első playable craft prototype részletes build spec |
| `24_CONFIG_FILES_STARTER_CODE.md` | TypeScript starter config exportok |
| `25_SYSTEMS_STARTER_CODE.md` | Core systems TypeScript skeleton code |
