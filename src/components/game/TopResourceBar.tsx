import type { GameState } from "../../types/gameState.types";
import { formatResource } from "../../utils/format";
import { ProgressBar } from "../common/ProgressBar";
import {
  getCurrentReputationTitle,
  getNextReputationThreshold,
  getTierName
} from "../../game/state/selectors";
import { getResourceTickerProgress } from "../../game/systems/resourceSystem";

type TopResourceBarProps = {
  state: GameState;
};

export function TopResourceBar({ state }: TopResourceBarProps) {
  const nextRepThreshold = getNextReputationThreshold(state);
  const ironTicker = getResourceTickerProgress(state, "ironOre");
  const woodTicker = getResourceTickerProgress(state, "wood");

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
  ticker?: ReturnType<typeof getResourceTickerProgress>;
}) {
  return (
    <div className="resource-chip">
      <span className="resource-label">{label}</span>
      <span className="resource-value">{value}</span>
      {ticker ? (
        <div className="resource-ticker">
          <ProgressBar
            value={ticker.progress * 100}
            max={100}
            label={`${label} production progress`}
          />
          <span className={ticker.isCapped ? "resource-subtext capped" : "resource-subtext"}>
            {ticker.isCapped
              ? "Capped"
              : `Next in ${formatTickerSeconds(ticker.secondsUntilNext)}`}
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
