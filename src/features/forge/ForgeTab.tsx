import { Hammer, Package, Play } from "lucide-react";
import { Button } from "../../components/common/Button";
import { ItemCard } from "../../components/game/ItemCard";
import { TopResourceBar } from "../../components/game/TopResourceBar";
import { BLUEPRINTS } from "../../config/blueprints.config";
import { ITEM_TYPES } from "../../config/itemTypes.config";
import { canStartCraft } from "../../game/systems/craftSystem";
import { useGameStore } from "../../game/state/gameStore";
import {
  getActiveCraftForSlot,
  getBlueprintLevelRange,
  getInventoryItems,
  getLastCraftedItem,
  isLegendaryEnabled
} from "../../game/state/selectors";
import { formatResource } from "../../utils/format";
import { CraftResultPanel } from "./CraftResultPanel";
import { DebugPanel } from "./DebugPanel";
import { ForgeSlot } from "./ForgeSlot";

export function ForgeTab() {
  const store = useGameStore();
  const { state, actions, lastError } = store;
  const now = Date.now();
  const swordBlueprint = BLUEPRINTS.find((blueprint) => blueprint.id === "bp_sword_base")!;
  const swordConfig = ITEM_TYPES.sword;
  const canCraftSword = canStartCraft(state, swordBlueprint.id);
  const levelRange = getBlueprintLevelRange(state, swordBlueprint.id);
  const inventoryItems = getInventoryItems(state);
  const lastCraftedItem = getLastCraftedItem(state);
  const legendaryState = isLegendaryEnabled(state) ? "Legendary enabled" : "Legendary locked";

  return (
    <div className="forge-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Blacksmith for Heroes Idle</h1>
          <p className="page-subtitle">
            Craft a sword, reveal its quality, keep it in inventory, or sell it to the market.
          </p>
        </div>
      </header>

      <TopResourceBar state={state} />

      <div className="forge-grid">
        <div>
          <section className="panel">
            <h2 className="panel-title">
              <Hammer size={19} aria-hidden="true" /> Forge Slot
            </h2>
            {state.workshop.forgeSlots.map((slot) => (
              <ForgeSlot
                key={slot.slotId}
                slot={slot}
                activeCraft={getActiveCraftForSlot(state, slot.slotId)}
                now={now}
                onForceComplete={() => actions.forceCompleteCraft()}
              />
            ))}
          </section>

          <section className="panel">
            <h2 className="panel-title">Craft Options</h2>
            <article className="craft-card">
              <div className="craft-row">
                <div>
                  <div className="slot-name">{swordBlueprint.name.replace(" Blueprint", "")}</div>
                  <div className="muted">Owned by default</div>
                </div>
                <Button onClick={actions.startSwordCraft} disabled={!canCraftSword.ok}>
                  <Play size={16} aria-hidden="true" /> Start Craft
                </Button>
              </div>

              <dl className="stat-list">
                <div>
                  <dt>Cost</dt>
                  <dd>
                    {swordConfig.baseCost.ironOre} Iron Ore + {swordConfig.baseCost.wood} Wood
                  </dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{swordConfig.baseCraftTimeSeconds}s</dd>
                </div>
                <div>
                  <dt>Expected Level</dt>
                  <dd>
                    {levelRange ? `${levelRange.min}-${levelRange.max}` : "Unavailable"}
                  </dd>
                </div>
                <div>
                  <dt>Tier State</dt>
                  <dd>
                    Tier {state.workshop.forgeTier}, {legendaryState}
                  </dd>
                </div>
              </dl>

              {!canCraftSword.ok ? <div className="notice">{canCraftSword.reason}</div> : null}
              {lastError ? <div className="notice">{lastError}</div> : null}
            </article>
          </section>

          <CraftResultPanel item={lastCraftedItem} onSell={actions.sellItem} />
        </div>

        <aside>
          <section className="panel">
            <h2 className="panel-title">
              <Package size={19} aria-hidden="true" /> Inventory{" "}
              <span className="muted">
                {inventoryItems.length}/{state.inventory.maxSlots}
              </span>
            </h2>
            <div className="item-list">
              {inventoryItems.length ? (
                inventoryItems.map((item) => (
                  <ItemCard key={item.itemId} item={item} onSell={actions.sellItem} />
                ))
              ) : (
                <p className="muted">No crafted items yet. Start crafting in the Forge.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <h2 className="panel-title">Event Log</h2>
            <div className="log-list">
              {state.log.entries.length ? (
                state.log.entries.slice(0, 8).map((entry) => (
                  <p className="log-entry" key={entry.eventId}>
                    {new Date(entry.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}{" "}
                    - {entry.text}
                  </p>
                ))
              ) : (
                <p className="muted">The forge is quiet.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <h2 className="panel-title">Milestone A Status</h2>
            <p className="muted">
              Rep is shown as {formatResource(state.player.reputationXp)}/100. Market sales give
              Gold only.
            </p>
          </section>

          <DebugPanel store={store} />
        </aside>
      </div>
    </div>
  );
}
