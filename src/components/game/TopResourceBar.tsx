import type { GameState } from "../../types/gameState.types";
import { formatResource } from "../../utils/format";
import { ProgressBar } from "../common/ProgressBar";
import {
  getCurrentReputationTitle,
  getNextReputationThreshold,
  getTierName
} from "../../game/state/selectors";
import {
  getResourceProductionProgress,
  type ResourceProductionProgress
} from "../../game/systems/resourceSystem";

type TopResourceBarProps = {
  state: GameState;
};

export function TopResourceBar({ state }: TopResourceBarProps) {
  const now = Date.now();
  const nextRepThreshold = getNextReputationThreshold(state);
  const ironTicker = getResourceProductionProgress(state, "ironOre", now);
  const woodTicker = getResourceProductionProgress(state, "wood", now);

  return (
    <section aria-label="Resources" className="top-resource-bar">
      <ResourceChip label="Gold" value={formatResource(state.resources.gold)} />
      <ResourceChip
        label="Iron Ore"
        value={formatResource(state.resources.ironOre, state.resources.ironOreCap)}
        ticker={ironTicker}
      />
      <ResourceChip
        label="Wood"
        value={formatResource(state.resources.wood, state.resources.woodCap)}
        ticker={woodTicker}
      />
      <ResourceChip
        label="Rep"
        value={`${formatResource(state.player.reputationXp)}/${formatResource(nextRepThreshold)} - ${getCurrentReputationTitle(state)}`}
      />
      <ResourceChip label="Tier" value={`${state.workshop.forgeTier} - ${getTierName(state)}`} />
    </section>
  );
}

function ResourceChip({
  label,
  value,
  ticker
}: {
  label: string;
  value: string;
  ticker?: ResourceProductionProgress;
}) {
  return (
    <div className={ticker?.isCapped ? "resource-chip resource-capped" : "resource-chip"}>
      <span className="resource-label">{label}</span>
      <span className="resource-value">{value}</span>
      {ticker ? (
        <div className="resource-ticker">
          <ProgressBar
            value={ticker.progressPercent}
            max={100}
            label={`${label} production progress`}
          />
          <span className={ticker.isCapped ? "resource-subtext capped" : "resource-subtext"}>
            {ticker.isCapped
              ? "Capped"
              : `Next in ${formatTickerSeconds(ticker.secondsUntilNextTick)}`}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function formatTickerSeconds(seconds: number): string {
  if (!Number.isFinite(seconds)) return "--";
  return `${Math.max(0, Math.ceil(seconds))}s`;
}
