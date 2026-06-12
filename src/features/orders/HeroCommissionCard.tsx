import { PackageCheck, X } from "lucide-react";
import { Button } from "../../components/common/Button";
import { ItemCard } from "../../components/game/ItemCard";
import { BLUEPRINTS } from "../../config/blueprints.config";
import type { EntityId } from "../../types/common.types";
import type { GameState, HeroCommissionState } from "../../types/gameState.types";
import { formatLabel, formatTimer } from "../../utils/format";
import { getMatchingHeroInventoryItems } from "../../game/state/selectors";

type HeroCommissionCardProps = {
  commission: HeroCommissionState;
  state: GameState;
  now: number;
  onDeliver: (itemId: EntityId, commissionId: EntityId) => void;
  onDismiss: (commissionId: EntityId) => void;
};

export function HeroCommissionCard({
  commission,
  state,
  now,
  onDeliver,
  onDismiss
}: HeroCommissionCardProps) {
  const matchingItems = getMatchingHeroInventoryItems(state, commission);
  const blueprint = BLUEPRINTS.find((candidate) => candidate.id === commission.requiredBlueprintId);
  const dismissBlocked =
    state.orders.heroDismissCooldownUntil !== undefined &&
    state.orders.heroDismissCooldownUntil > now;

  return (
    <article className="order-card hero">
      <div className="order-card-header">
        <div>
          <div className="rarity">{formatLabel(commission.heroClass)}</div>
          <h3>{commission.heroName}</h3>
        </div>
        <div className="muted">Leaves in {formatTimer(commission.expiresAt - now)}</div>
      </div>

      <div className="order-requirements">
        <div className="order-requirement">
          <span>
            Wants {formatLabel(commission.requiredItemType)} Lv {commission.minLevel}+
          </span>
          <strong>{formatLabel(commission.status.replaceAll("_", " "))}</strong>
        </div>
      </div>

      {commission.preferredAffix ? (
        <p className="muted">Preference: {formatLabel(commission.preferredAffix)}</p>
      ) : null}
      {commission.bonusRarity ? (
        <p className="muted">Bonus rarity: {formatLabel(commission.bonusRarity)}</p>
      ) : null}
      <p className="muted">Feedback chance: {Math.round(commission.baseFeedbackChance * 100)}%</p>

      {commission.isMissingBlueprintCommission ? (
        <p className="notice">
          Requires {blueprint?.name ?? commission.requiredBlueprintId}. Blueprint purchase arrives
          in Milestone C.
        </p>
      ) : null}

      <dl className="stat-list">
        <div>
          <dt>Gold</dt>
          <dd>{Math.round(commission.goldRewardMultiplier * 100)}% item value</dd>
        </div>
        <div>
          <dt>Reputation</dt>
          <dd>{commission.reputationReward} Rep</dd>
        </div>
      </dl>

      {commission.status === "active" ? (
        <div className="delivery-list">
          <h4>Matching Inventory</h4>
          {matchingItems.length ? (
            matchingItems.map((item) => (
              <div className="delivery-row" key={item.itemId}>
                <ItemCard compact item={item} />
                <Button onClick={() => onDeliver(item.itemId, commission.commissionId)}>
                  <PackageCheck size={16} aria-hidden="true" /> Deliver
                </Button>
              </div>
            ))
          ) : (
            <p className="muted">No matching inventory item yet.</p>
          )}
        </div>
      ) : null}

      <div className="button-row">
        <Button
          variant="secondary"
          disabled={dismissBlocked}
          onClick={() => onDismiss(commission.commissionId)}
        >
          <X size={16} aria-hidden="true" /> Dismiss
        </Button>
      </div>
    </article>
  );
}
