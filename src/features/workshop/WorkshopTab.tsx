import { ArrowUpCircle, Wrench } from "lucide-react";
import { Button } from "../../components/common/Button";
import { TopResourceBar } from "../../components/game/TopResourceBar";
import type { GameStore } from "../../game/state/gameStore";
import {
  getCurrentTierConfig,
  getForgeTierUpgradeEntries,
  getWorkshopUpgradeEntries,
  isLegendaryEnabled
} from "../../game/state/selectors";
import { formatNumber } from "../../utils/format";

type WorkshopTabProps = {
  store: GameStore;
};

export function WorkshopTab({ store }: WorkshopTabProps) {
  const { state, actions, lastError } = store;
  const currentTier = getCurrentTierConfig(state);
  const upgradeEntries = getWorkshopUpgradeEntries(state);
  const tierEntries = getForgeTierUpgradeEntries(state);

  return (
    <div className="forge-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Workshop</h1>
          <p className="page-subtitle">Forge upgrades and tier progression.</p>
        </div>
      </header>

      <TopResourceBar state={state} />
      {lastError ? <div className="notice global-notice">{lastError}</div> : null}

      <section className="panel">
        <h2 className="panel-title">
          <Wrench size={19} aria-hidden="true" /> Current Workshop
        </h2>
        <div className="metric-grid">
          <Metric label="Forge Tier" value={`${state.workshop.forgeTier} - ${currentTier.name}`} />
          <Metric label="Max Item Level" value={state.workshop.maxItemLevelCap.toString()} />
          <Metric label="Iron Rate" value={`${state.resources.ironOreRatePerSecond.toFixed(3)}/s`} />
          <Metric label="Wood Rate" value={`${state.resources.woodRatePerSecond.toFixed(3)}/s`} />
          <Metric label="Craft Speed" value={`${state.workshop.craftSpeedMultiplier.toFixed(2)}x`} />
          <Metric label="Item Level Bonus" value={`+${state.workshop.itemLevelMinBonus}`} />
          <Metric
            label="Rarity Modifier"
            value={state.workshop.rarityBonusTier > 0 ? "Polished" : "Baseline"}
          />
          <Metric label="Legendary" value={isLegendaryEnabled(state) ? "Enabled" : "Locked"} />
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Workshop Upgrades</h2>
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
                    <dd>{formatNumber(entry.upgrade.goldCost ?? 0)} Gold</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{entry.upgrade.category.replaceAll("_", " ")}</dd>
                  </div>
                </dl>

                {!isOwned && entry.reasons.length ? (
                  <div className="notice">{entry.reasons.join(", ")}</div>
                ) : null}

                {!isOwned ? (
                  <Button onClick={() => actions.purchaseWorkshopUpgrade(entry.upgrade.id)} disabled={!isBuyable}>
                    Buy Upgrade
                  </Button>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <ArrowUpCircle size={19} aria-hidden="true" /> Forge Tier
        </h2>
        <div className="shop-grid">
          {tierEntries.map((entry) => {
            const isOwned = entry.status === "owned";
            const isBuyable = entry.status === "available" && entry.canAfford;

            return (
              <article className="progression-card" key={entry.targetTier}>
                <div className="order-card-header">
                  <div>
                    <h3>Tier {entry.targetTier}: {entry.name}</h3>
                    <p className="muted">
                      Max Lv {entry.maxItemLevel}; Legendary {entry.legendaryEnabled ? "enabled" : "locked"}
                    </p>
                  </div>
                  <span className={`status-pill ${entry.status}`}>{entry.status}</span>
                </div>

                <dl className="stat-list">
                  <div>
                    <dt>Cost</dt>
                    <dd>{formatNumber(entry.goldCost)} Gold</dd>
                  </div>
                  <div>
                    <dt>Cap</dt>
                    <dd>{entry.maxItemLevel}</dd>
                  </div>
                </dl>

                {!isOwned && entry.reasons.length ? (
                  <div className="notice">{entry.reasons.join(", ")}</div>
                ) : null}

                {!isOwned ? (
                  <Button onClick={() => actions.upgradeForgeTier(entry.targetTier)} disabled={!isBuyable}>
                    Upgrade Tier
                  </Button>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Storage</h2>
        <p className="muted">TODO: inventory and storage upgrades are reserved for a later pass.</p>
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
