import { Lock, ShoppingBag } from "lucide-react";
import { Button } from "../../components/common/Button";
import { TopResourceBar } from "../../components/game/TopResourceBar";
import type { GameStore } from "../../game/state/gameStore";
import { getBlueprintShopEntries } from "../../game/state/selectors";
import { formatLabel, formatNumber } from "../../utils/format";

type ShopTabProps = {
  store: GameStore;
};

export function ShopTab({ store }: ShopTabProps) {
  const { state, actions, lastError } = store;
  const entries = getBlueprintShopEntries(state);

  return (
    <div className="forge-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Shop</h1>
          <p className="page-subtitle">Blueprint stock in Oakvale.</p>
        </div>
      </header>

      <TopResourceBar state={state} />
      {lastError ? <div className="notice global-notice">{lastError}</div> : null}

      <section className="panel">
        <h2 className="panel-title">
          <ShoppingBag size={19} aria-hidden="true" /> Blueprint Shop
        </h2>
        <div className="shop-grid">
          {entries.map((entry) => {
            const isOwned = entry.status === "owned";
            const isBuyable = entry.status === "available" && entry.canAfford;
            const lockText = entry.reasons.length ? entry.reasons.join(", ") : "Ready";

            return (
              <article className="progression-card" key={entry.blueprint.id}>
                <div className="order-card-header">
                  <div>
                    <h3>{entry.blueprint.name}</h3>
                    <p className="muted">
                      {formatLabel(entry.blueprint.kind)} - {formatLabel(entry.blueprint.itemType)}
                    </p>
                  </div>
                  <span className={`status-pill ${entry.status}`}>{entry.status}</span>
                </div>

                <dl className="stat-list">
                  <div>
                    <dt>Cost</dt>
                    <dd>{formatNumber(entry.blueprint.goldCost)} Gold</dd>
                  </div>
                  <div>
                    <dt>Rep</dt>
                    <dd>{entry.blueprint.requiredRepLevel}</dd>
                  </div>
                  <div>
                    <dt>Tier</dt>
                    <dd>{entry.blueprint.requiredForgeTier}</dd>
                  </div>
                  <div>
                    <dt>State</dt>
                    <dd>{isOwned ? "Owned" : entry.status === "locked" ? "Locked" : "Available"}</dd>
                  </div>
                </dl>

                {!isOwned && lockText !== "Ready" ? (
                  <div className="notice">
                    <Lock size={15} aria-hidden="true" /> {lockText}
                  </div>
                ) : null}

                {!isOwned ? (
                  <Button onClick={() => actions.purchaseBlueprint(entry.blueprint.id)} disabled={!isBuyable}>
                    Buy Blueprint
                  </Button>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
