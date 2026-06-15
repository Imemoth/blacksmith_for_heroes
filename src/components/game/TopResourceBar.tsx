import type { GameState } from "../../types/gameState.types";
import { formatResource } from "../../utils/format";
import {
  getCurrentReputationTitle,
  getNextReputationThreshold,
  getTierName
} from "../../game/state/selectors";

type TopResourceBarProps = {
  state: GameState;
};

export function TopResourceBar({ state }: TopResourceBarProps) {
  const nextRepThreshold = getNextReputationThreshold(state);

  return (
    <section aria-label="Resources" className="top-resource-bar">
      <ResourceChip label="Gold" value={formatResource(state.resources.gold)} />
      <ResourceChip
        label="Iron Ore"
        value={formatResource(state.resources.ironOre, state.resources.ironOreCap)}
      />
      <ResourceChip label="Wood" value={formatResource(state.resources.wood, state.resources.woodCap)} />
      <ResourceChip
        label="Rep"
        value={`${formatResource(state.player.reputationXp)}/${formatResource(nextRepThreshold)} - ${getCurrentReputationTitle(state)}`}
      />
      <ResourceChip label="Tier" value={`${state.workshop.forgeTier} - ${getTierName(state)}`} />
    </section>
  );
}

function ResourceChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="resource-chip">
      <span className="resource-label">{label}</span>
      <span className="resource-value">{value}</span>
    </div>
  );
}
