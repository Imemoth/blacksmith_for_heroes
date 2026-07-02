# Balance Tables

## Cél

Ez a dokumentum egy helyen tartja a legfontosabb MVP balance számokat.

A számok tesztértékek, nem véglegesek.

---

# Resources

| Resource | Starting | Cap | Rate |
|---|---:|---:|---:|
| Gold | 0 | nincs | nincs tick |
| Iron Ore | 12 | 30 | 1 / 8 sec |
| Wood | 6 | 25 | 1 / 10 sec |
| Forge Sigil | 0 | nincs | prestige reward |

---

# Craft costs

| Item | Iron Ore | Wood | Time | Type multiplier |
|---|---:|---:|---:|---:|
| Sword | 4 | 1 | 10s | 10 |
| Bow | 1 | 5 | 12s | 9 |
| Staff | 1 | 6 | 16s | 11 |
| Axe | 5 | 2 | 14s | 12 |

---

# Rarity

| Rarity | Chance | Power multiplier | Notes |
|---|---:|---:|---|
| Common | 81.5% | 1.00 | no affix |
| Fine | 15.0% | 1.08 | minor affix chance |
| Rare | 3.0% | 1.22 | affix guaranteed |
| Epic | 0.45% | 1.50 | strong affix |
| Legendary | 0.05% | 2.20 | Tier 3 only |

## Polishing Kit I rarity

| Rarity | Chance |
|---|---:|
| Common | 78.8% |
| Fine | 16.5% |
| Rare | 4.0% |
| Epic | 0.62% |
| Legendary | 0.08%, Tier 3 only |

---

# Reputation thresholds

| Rep Level | XP | Title |
|---:|---:|---|
| 1 | 0 | Local Smith |
| 2 | 100 | Known Crafter |
| 3 | 250 | Guild-Recognized Smith |
| 4 | 625 | Warband Supplier |
| 5 | 1650 | Masterwork Candidate |

---

# Blueprint costs

## Base blueprints

| Blueprint | Cost | Requirement |
|---|---:|---|
| Sword Blueprint | 0 | start |
| Bow Blueprint | 180 Gold | Rep 2 + Tier 1 |
| Staff Blueprint | 350 Gold | Rep 3 + Tier 1 |
| Axe Blueprint | 500 Gold | Rep 4 + Tier 1 |

## Advanced blueprints

| Blueprint | Cost | Requirement | Bonus |
|---|---:|---|---|
| Basic Sword Pattern | 250 | Rep 2 + Tier 2 | +1 base level |
| Hunter Bow Pattern | 450 | Rep 2 + Tier 2 | +1 base level |
| Apprentice Staff Pattern | 650 | Rep 3 + Tier 2 | +2 base level |
| Heavy Axe Pattern | 850 | Rep 4 + Tier 2 | +2 base level |

## Masterwork

| Blueprint | Cost | Requirement |
|---|---:|---|
| Masterwork Frame | 1500 | Rep 5 + Tier 3 |
| Legacy Weapon Pattern | 2000 | Rep 5 + Tier 3 |

---

# Tier upgrades

| Tier | Name | Cost | Requirement | Effect |
|---:|---|---:|---|---|
| 1 | Basic Forge | 0 | start | max Lv 8 |
| 2 | Reinforced Forge | 700 | 10 completed orders + Better Anvil I | max Lv 15 |
| 3 | Master Forge | 1800 | 25 completed orders + 1 Epic + Tier 2 | max Lv 20 + Legendary |

No hard Reputation requirement for Tier upgrades.

---

# Workshop upgrades

| Upgrade | Cost | Effect |
|---|---:|---|
| Better Mine I | 100 | Iron income +50% |
| Better Lumber Yard I | 120 | Wood income +50% |
| Larger Stockpile I | 150 | Iron/Wood cap +50% |
| Better Anvil I | 120 | craft speed +15% |
| Better Anvil II | 300 | craft speed +15% |
| Fine Tools I | 250 | item level min +1 |
| Polishing Kit I | 500 | rarity boost |
| Guild Ledger I | 400 | +1 guild slot |
| Clerk Desk I | 350 | manual guild refresh |

---

# Inventory

| Stat | Value |
|---|---:|
| Starting slots | 20 |
| Early expansion | Gold |
| Permanent expansion | Forge Sigil |
| Prestige reset | Gold slots reset |
| Prestige keep | Sigil slots remain |

---

# Reward multipliers

| Output | Gold | Reputation |
|---|---:|---:|
| Market | 35% item value | 0 |
| Guild Contract | 85–110% expected value | low |
| Hero Commission | 50–90% item value | high |

## Guild Rep baseline

| Size | Rep |
|---|---:|
| 2–3 items | 4–8 |
| 4–6 items | 10–18 |
| 7–10 items | 20–35 |

## Hero Rep baseline

| Hero tier | Rep |
|---|---:|
| Basic hero | 25–40 |
| Ranger / early specialist | 40–65 |
| Mage / mid specialist | 60–90 |
| Mercenary / advanced | 85–130 |
| Veteran / Rep 5 | 120–180 |

---

# Timers

## Hero arrival

| Rep | Arrival interval |
|---:|---:|
| 1 | 5 min |
| 2 | 5 min |
| 3 | 4 min |
| 4 | 3 min |
| 5 | 2 min |

## Hero active duration

| Parameter | Value |
|---|---:|
| Active duration | 90 sec |
| Dismiss cooldown | 5 min |

## Guild rotation

| Contract state | Timer |
|---|---:|
| Offered, not accepted | rotates after 5–10 min |
| Accepted | no rotation |
| Completed | replaced |

---

# Prestige

## First prestige requirement

| Requirement | Value |
|---|---|
| Reputation | Rep 5 |
| Tier | Tier 3 |
| Item | Epic or better |
| Item level | 15+ |
| Blueprint | Masterwork Frame owned |
| Hero commissions | 5+ |
| Guild contracts | 5+ |

## Reward

| Reward | Value |
|---|---:|
| Forge Sigil | 1–3 |

## Reset

Reset:

- Gold,
- Iron Ore,
- Wood,
- active orders,
- active crafts,
- Gold upgrades,
- Gold inventory slots.

Keep:

- Forge Sigil,
- Sigil upgrades,
- Legendary archive,
- Masterwork History,
- permanent inventory slots.
