import { TopResourceBar } from "../../components/game/TopResourceBar";
import type { GameStore } from "../../game/state/gameStore";
import { getOpenGuildContracts, getOpenHeroCommissions } from "../../game/state/selectors";
import { formatTimer } from "../../utils/format";
import { GuildContractCard } from "./GuildContractCard";
import { HeroCommissionCard } from "./HeroCommissionCard";

type OrdersTabProps = {
  store: GameStore;
};

export function OrdersTab({ store }: OrdersTabProps) {
  const { state, actions, lastError } = store;
  const now = Date.now();
  const guildContracts = getOpenGuildContracts(state);
  const heroCommissions = getOpenHeroCommissions(state);
  const nextHeroTimer = state.orders.nextHeroArrivalAt
    ? formatTimer(state.orders.nextHeroArrivalAt - now)
    : "pending";
  const dismissCooldown = state.orders.heroDismissCooldownUntil
    ? formatTimer(state.orders.heroDismissCooldownUntil - now)
    : undefined;

  return (
    <div className="forge-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">
            Choose between guild bulk work for Gold and hero commissions for Reputation.
          </p>
        </div>
      </header>

      <TopResourceBar state={state} />

      {lastError ? <div className="notice global-notice">{lastError}</div> : null}

      <div className="orders-grid">
        <section className="panel">
          <h2 className="panel-title">Guild Contracts</h2>
          <div className="item-list">
            {guildContracts.length ? (
              guildContracts.map((contract) => (
                <GuildContractCard
                  key={contract.contractId}
                  contract={contract}
                  now={now}
                  state={state}
                  onAccept={actions.acceptGuildContract}
                  onDeliver={actions.deliverItemToGuildContract}
                />
              ))
            ) : (
              <p className="muted">No guild contracts are currently available.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Hero Commissions</h2>
          <p className="muted">
            Next hero arrival: {heroCommissions.length ? "waiting for current commission" : nextHeroTimer}
          </p>
          {dismissCooldown && state.orders.heroDismissCooldownUntil! > now ? (
            <p className="muted">Dismiss cooldown: {dismissCooldown}</p>
          ) : null}
          <div className="item-list">
            {heroCommissions.length ? (
              heroCommissions.map((commission) => (
                <HeroCommissionCard
                  key={commission.commissionId}
                  commission={commission}
                  now={now}
                  state={state}
                  onDeliver={actions.deliverItemToHeroCommission}
                  onDismiss={actions.dismissHeroCommission}
                />
              ))
            ) : (
              <p className="muted">No hero is waiting right now.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
