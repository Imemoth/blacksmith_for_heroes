import { Landmark, Sparkles } from "lucide-react";
import { Button } from "../../components/common/Button";
import { ItemCard } from "../../components/game/ItemCard";
import { TopResourceBar } from "../../components/game/TopResourceBar";
import type { GameStore } from "../../game/state/gameStore";
import {
  getMasterworkHistoryItems,
  getPrestigeRequirementState,
  getPrestigeUpgradeEntries
} from "../../game/state/selectors";
import { formatNumber } from "../../utils/format";

type PrestigeTabProps = {
  store: GameStore;
};

export function PrestigeTab({ store }: PrestigeTabProps) {
  const { state, actions, lastError } = store;
  const prestigeState = getPrestigeRequirementState(state);
  const eligibleItems = prestigeState.eligibleItemIds
    .map((itemId) => state.itemsById[itemId])
    .filter((item) => item !== undefined);
  const historyItems = getMasterworkHistoryItems(state);
  const upgradeEntries = getPrestigeUpgradeEntries(state);
  const selectedItemId = eligibleItems[0]?.itemId;

  return (
    <div className="forge-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Legacy</h1>
          <p className="page-subtitle">Turn a Masterwork into Forge Sigils and begin a new run.</p>
        </div>
      </header>

      <TopResourceBar state={state} />
      {lastError ? <div className="notice global-notice">{lastError}</div> : null}

      <section className="panel">
        <h2 className="panel-title">
          <Landmark size={19} aria-hidden="true" /> Forge Legacy
        </h2>
        <div className="metric-grid">
          <Metric label="Forge Sigils" value={formatNumber(state.resources.forgeSigil)} />
          <Metric label="Prestiges" value={formatNumber(state.player.totalPrestiges)} />
          <Metric
            label="Status"
            value={prestigeState.ok ? "Available" : "Locked"}
          />
          <Metric label="Reward" value="+1 Forge Sigil" />
        </div>

        {prestigeState.lockReasons.length ? (
          <div className="notice">{prestigeState.lockReasons.join(", ")}</div>
        ) : null}

        <div className="button-row">
          <Button
            disabled={!prestigeState.ok || !selectedItemId}
            onClick={() => actions.performPrestige(selectedItemId)}
          >
            <Sparkles size={16} aria-hidden="true" /> Begin Legacy
          </Button>
          {selectedItemId ? (
            <span className="muted">
              Uses {state.itemsById[selectedItemId]?.displayName ?? "eligible Masterwork item"}.
            </span>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Eligible Masterwork Items</h2>
        <div className="item-list">
          {eligibleItems.length ? (
            eligibleItems.map((item) => (
              <ItemCard key={item.itemId} item={item} compact isMasterworkEligible />
            ))
          ) : (
            <p className="muted">No eligible Epic or Legendary Lv 15+ inventory item yet.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Forge Sigil Upgrades</h2>
        <div className="shop-grid">
          {upgradeEntries.map((entry) => {
            const isOwned = entry.status === "owned";
            const isBuyable = entry.status === "available" && entry.canAfford;

            return (
              <article className="progression-card" key={entry.upgrade.id}>
                <div className="order-card-header">
                  <div>
                    <h3>{entry.upgrade.name}</h3>
                    <p className="muted">{entry.upgrade.description}</p>
                  </div>
                  <span className={`status-pill ${entry.status}`}>{entry.status}</span>
                </div>

                <dl className="stat-list">
                  <div>
                    <dt>Cost</dt>
                    <dd>{formatNumber(entry.upgrade.forgeSigilCost ?? 0)} Forge Sigil</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>Permanent</dd>
                  </div>
                </dl>

                {!isOwned && entry.reasons.length ? (
                  <div className="notice">{entry.reasons.join(", ")}</div>
                ) : null}

                {!isOwned ? (
                  <Button
                    disabled={!isBuyable}
                    onClick={() => actions.purchasePrestigeUpgrade(entry.upgrade.id)}
                  >
                    Buy Upgrade
                  </Button>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Masterwork History</h2>
        <div className="item-list">
          {historyItems.length ? (
            historyItems.map((item) => <ItemCard key={item.itemId} item={item} compact />)
          ) : (
            <p className="muted">No Masterwork item has been committed to the legacy yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="resource-chip">
      <span className="resource-label">{label}</span>
      <span className="resource-value">{value}</span>
    </div>
  );
}
