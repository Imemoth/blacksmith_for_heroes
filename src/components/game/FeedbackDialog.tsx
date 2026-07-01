import { Button } from "../common/Button";
import type { HeroFeedbackEventState } from "../../types/gameState.types";

type FeedbackDialogProps = {
  event: HeroFeedbackEventState;
  onClose: (feedbackId: string) => void;
};

export function FeedbackDialog({ event, onClose }: FeedbackDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-labelledby="feedback-dialog-title" className="feedback-dialog" role="dialog" aria-modal="true">
        <div>
          <p className="rarity">Hero Feedback</p>
          <h2 className="panel-title" id="feedback-dialog-title">
            {event.heroName}
          </h2>
        </div>
        <p className="feedback-item-name">{event.itemName}</p>
        <p className="feedback-text">{event.text}</p>
        {event.reward.type !== "none" && event.reward.amount > 0 ? (
          <p className="notice">Reward gained: +{event.reward.amount} {formatRewardLabel(event.reward.type)}</p>
        ) : (
          <p className="muted">No extra reward this time.</p>
        )}
        <div className="button-row">
          <Button onClick={() => onClose(event.feedbackId)}>Close</Button>
        </div>
      </section>
    </div>
  );
}

function formatRewardLabel(rewardType: HeroFeedbackEventState["reward"]["type"]): string {
  if (rewardType === "reputation") return "Rep";
  if (rewardType === "ironOre") return "Iron Ore";
  if (rewardType === "wood") return "Wood";
  return "";
}
