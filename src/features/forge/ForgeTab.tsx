import { Hammer, Package, Play } from "lucide-react";
import { Button } from "../../components/common/Button";
import { ItemCard } from "../../components/game/ItemCard";
import { TopResourceBar } from "../../components/game/TopResourceBar";
import { ITEM_TYPES } from "../../config/itemTypes.config";
import { canStartCraft } from "../../game/systems/craftSystem";
import type { GameStore } from "../../game/state/gameStore";
import {
  getActiveCraftForSlot,
  getCraftCostDisplay,
  getCraftDurationDisplay,
  getBlueprintLevelRange,
  getInventoryItems,
  getLastCraftedItem,
  getMatchingOrderLabelsForItem,
  getOwnedCraftableBlueprints,
  isLegendaryEnabled
} from "../../game/state/selectors";
import { formatResource } from "../../utils/format";
import { CraftResultPanel } from "./CraftResultPanel";
import { DebugPanel } from "./DebugPanel";
import { ForgeSlot } from "./ForgeSlot";

type ForgeTabProps = {
  store: GameStore;
};

export function ForgeTab({ store }: ForgeTabProps) {
  const { state, actions, lastError } = store;
  const now = Date.now();
  const craftableBlueprints = getOwnedCraftableBlueprints(state);
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
            <div className="craft-options-list">
              {craftableBlueprints.map((blueprint) => {
                if (blueprint.itemType === "any") return null;

                const itemTypeConfig = ITEM_TYPES[blueprint.itemType];
                const canCraft = canStartCraft(state, blueprint.id);
                const levelRange = getBlueprintLevelRange(state, blueprint.id);

                return (
                  <article className="craft-card" key={blueprint.id}>
                    <div className="craft-row">
                      <div>
                        <div className="slot-name">{blueprint.name}</div>
                        <div className="muted">
                          {itemTypeConfig.displayName} - {blueprint.kind}
                        </div>
                      </div>
                      <Button onClick={() => actions.startCraft(blueprint.id)} disabled={!canCraft.ok}>
                        <Play size={16} aria-hidden="true" /> Start Craft
                      </Button>
                    </div>

                    <dl className="stat-list">
                      <div>
                        <dt>Cost</dt>
                        <dd>{getCraftCostDisplay(blueprint.id)}</dd>
                      </div>
                      <div>
                        <dt>Time</dt>
                        <dd>{getCraftDurationDisplay(state, blueprint.id)}</dd>
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

                    {!canCraft.ok ? <div className="notice">{canCraft.reason}</div> : null}
                  </article>
                );
              })}
              {lastError ? <div className="notice">{lastError}</div> : null}
              {!craftableBlueprints.length ? (
                <p className="muted">No craftable blueprints owned.</p>
              ) : null}
            </div>
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
                  <ItemCard
                    key={item.itemId}
                    item={item}
                    matchingOrderLabels={getMatchingOrderLabelsForItem(state, item)}
                    onSell={actions.sellItem}
                  />
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
            <h2 className="panel-title">Progression</h2>
            <p className="muted">
              Rep {state.player.reputationLevel}: {formatResource(state.player.reputationXp)} XP.
              Max item level {state.workshop.maxItemLevelCap}.
            </p>
          </section>

          <DebugPanel store={store} />
        </aside>
      </div>
    </div>
  );
}
