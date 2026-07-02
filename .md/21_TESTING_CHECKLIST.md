# Testing Checklist

## Cél

Ez a dokumentum MVP QA és dev teszt checklist.

A cél: a core economy és progression ne törjön el, mielőtt tartalmat bővítünk.

---

# Resource tests

## Must pass

- Iron Ore idővel nő.
- Wood idővel nő.
- Iron Ore nem megy cap fölé.
- Wood nem megy cap fölé.
- Resource nem lehet negatív.
- Gold nem tickel automatikusan.
- Forge Sigil nem tickel automatikusan.
- Spending fail esetén state nem sérül.

---

# Craft tests

## Start craft

- Nem indul craft, ha nincs owned blueprint.
- Nem indul craft, ha nincs elég Iron Ore.
- Nem indul craft, ha nincs elég Wood.
- Nem indul craft, ha nincs szabad forge slot.
- Craft start levonja a materialt.
- Craft start létrehoz ActiveCraftot.
- Forge slot foglalt lesz.

## Complete craft

- Craft completion itemet generál.
- Item bekerül `itemsById` mapbe.
- Item bekerül inventoryba.
- Forge slot felszabadul.
- ActiveCraft törlődik.
- Crafted counters frissülnek.
- Log entry létrejön.

## Rarity

- Legendary nem rollol Tier 1-en.
- Legendary nem rollol Tier 2-n.
- Legendary rollolhat Tier 3-on.
- Polishing Kit módosítja rarity table-t.
- Epic counter nő Epic craftnál.
- Legendary archive frissül Legendary craftnál.

---

# Inventory tests

- Inventory induló cap 20.
- Item add fail, ha inventory full.
- Market sell eltávolítja inventoryból.
- Market sell Goldot ad.
- Market sell nem ad Reputationt.
- Epic guild delivery warning true.
- Legendary guild delivery warning true.
- Common/Fine/Rare warning false.

---

# Guild contract tests

## Generation

- Guild contract csak owned blueprintből generál.
- Bow contract nem jön Bow Blueprint nélkül.
- Staff contract nem jön Staff Blueprint nélkül.
- Rep requirement működik.
- Tier requirement működik.
- City filter működik.
- Weighted random nem választ ineligible template-et.

## State

- Offered contract rotálhat.
- Accepted contract nem rotál.
- Completed contract után új contract jön.
- Rotated contract nem teljesíthető.

## Delivery

- Nem megfelelő item type rejected.
- Alacsony item level rejected.
- Matching item accepted.
- Partial delivery működik.
- Completionkor Gold nő.
- Completionkor kevés Rep nő.
- Completed guild counter nő.
- Item state `assigned_guild`.

---

# Hero commission tests

## Generation

- Hero Rep requirement működik.
- Hero Tier requirement működik.
- Hero owned blueprintre generálható.
- Hero shop-available, de not-owned blueprintre generálható.
- Hero nem generál nem elérhető blueprintre.
- Max 1 missing-blueprint hero aktív.
- Hero név class szerint valid.
- Hero arrival timer Rep szerint működik.

## Timer

- Hero 90 sec után expired.
- Expired hero nem teljesíthető.
- Dismiss hero status dismissed.
- Dismiss után 5 perc cooldown.
- Cooldown alatt dismiss nem használható vagy korlátozott.

## Completion

- Wrong item type rejected.
- Low level item rejected.
- Matching item accepted.
- Gold reward item value × multiplier.
- Reputation reward magasabb, mint guild baseline.
- Hero completed counter nő.
- Hero history frissül.
- Item state `assigned_hero`.
- Feedback roll triggerelhető.

---

# Reputation tests

- 0 XP = Rep 1.
- 100 XP = Rep 2.
- 250 XP = Rep 3.
- 625 XP = Rep 4.
- 1650 XP = Rep 5.
- Rep level up log létrejön.
- Reputation nem költhető el.
- Rep unlock után blueprint shop kínálat frissül.

---

# Blueprint shop tests

- Sword Blueprint owned startkor.
- Bow Rep 2 előtt locked.
- Bow Rep 2 után available, ha elég Gold.
- Bow purchase levon 180 Goldot.
- Purchased blueprint owned lesz.
- Owned blueprint nem vásárolható újra.
- Staff Rep 3 után available.
- Axe Rep 4 után available.
- Advanced blueprint Tier 2 előtt locked.
- Masterwork Frame Rep 5 + Tier 3 előtt locked.
- Lock reason helyes:
  - Rep missing,
  - Tier missing,
  - Gold missing,
  - owned.

---

# Upgrade tests

- Upgrade nem vehető meg Gold nélkül.
- Better Anvil I csökkenti craft time-ot.
- Better Mine I növeli Iron rate-et.
- Better Lumber Yard I növeli Wood rate-et.
- Larger Stockpile növeli capet.
- Fine Tools növeli item level minimumot.
- Polishing Kit rarity boostot ad.
- Guild Ledger növeli guild slotot.
- Upgrade nem vehető meg kétszer.

---

# Tier tests

- Tier 2 nem vehető meg 700 Gold nélkül.
- Tier 2 nem vehető meg 10 completed order nélkül.
- Tier 2 nem vehető meg Better Anvil I nélkül.
- Tier 2 után max item level 15.
- Tier 2 után advanced blueprint látható, ha Rep is elég.
- Tier 3 nem kér hard Repet.
- Tier 3 nem vehető meg 1800 Gold nélkül.
- Tier 3 nem vehető meg 25 completed order nélkül.
- Tier 3 nem vehető meg Epic nélkül.
- Tier 3 után max item level 20.
- Tier 3 után Legendary enabled.

---

# Feedback tests

- Guild contract nem ad personal feedbacket.
- Hero commission adhat feedbacket.
- Feedback chance cap 90%.
- Preferred affix növeli feedback chance-et.
- Rare/Epic/Legendary növeli feedback chance-et.
- Feedback template class/item/rarity filter működik.
- Feedback reward hozzáadódik.
- Feedback log entry létrejön.

---

# Prestige tests

## Eligibility

- Nem prestige-elhet Rep 5 előtt.
- Nem prestige-elhet Tier 3 előtt.
- Nem prestige-elhet Masterwork Frame nélkül.
- Nem prestige-elhet Epic+ item nélkül.
- Nem prestige-elhet Lv 15 alatt.
- Nem prestige-elhet 5 hero commission alatt.
- Nem prestige-elhet 5 guild contract alatt.

## Apply prestige

- Masterwork item state `archived_masterwork`.
- Masterwork item inventoryból kikerül.
- Masterwork item bekerül historyba.
- Forge Sigil reward 1–3.
- Gold reset.
- Iron Ore / Wood reset.
- Active orders clear.
- Active crafts clear.
- Gold upgrades reset.
- Gold inventory slot bonus reset.
- Forge Sigil megmarad.
- Sigil upgrade-ek megmaradnak.
- Legendary archive megmarad.
- Permanent inventory slots megmaradnak.
- Új runId generálódik.

---

# Save / offline tests

- Save/load megtartja GameState-et.
- Save version olvasható.
- Load migration stub fut.
- Offline Iron Ore capig nő.
- Offline Wood capig nő.
- Offline craft completion működik.
- Negatív elapsed time nem ad rewardot.
- Extrém elapsed time capelve van.
- Corrupt inventory item id javítható vagy eltávolítható.
- Rep level recalculated XP alapján.

---

# UI acceptance tests

- Player 3 kattintáson belül craftot indít.
- Craft után világos az item rarity/level/power.
- Item card mutat matching ordert.
- Orders tab külön mutat Guild és Hero szekciót.
- Hero timer látható.
- Guild offered rotation timer látható.
- Accepted guilden nincs rotation timer.
- Shop lock reason egyértelmű.
- Workshop Tier cél látható.
- Prestige modal mutatja, mi resetelődik és mi marad.

---

# Analytics events

Minimum mérendő eventek:

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
prestige_completed
```

## Funnel check

- first craft complete,
- first market sell,
- first guild complete,
- first hero complete,
- Rep 2 reached,
- Bow Blueprint purchased,
- Tier 2 reached,
- first Epic crafted,
- first prestige.
