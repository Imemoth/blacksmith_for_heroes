import { Timer, Zap } from "lucide-react";
import { Button } from "../../components/common/Button";
import { TimerBar } from "../../components/common/TimerBar";
import { ITEM_TYPES } from "../../config/itemTypes.config";
import type { ActiveCraft, ForgeSlot as ForgeSlotState } from "../../types/gameState.types";
import { formatTimer } from "../../utils/format";

type ForgeSlotProps = {
  slot: ForgeSlotState;
  activeCraft?: ActiveCraft;
  now: number;
  onForceComplete: () => void;
};

export function ForgeSlot({ slot, activeCraft, now, onForceComplete }: ForgeSlotProps) {
  if (!slot.isUnlocked) {
    return (
      <article className="forge-slot">
        <div className="slot-name">Locked Slot</div>
      </article>
    );
  }

  if (!activeCraft) {
    return (
      <article className="forge-slot">
        <div className="slot-row">
          <div>
            <div className="slot-name">Empty Slot</div>
            <div className="muted">Select a blueprint to start crafting.</div>
          </div>
          <Zap size={22} aria-hidden="true" />
        </div>
      </article>
    );
  }

  const itemName = ITEM_TYPES[activeCraft.itemType].displayName;
  const timeLeft = formatTimer(activeCraft.completesAt - now);

  return (
    <article className="forge-slot crafting">
      <div className="slot-row">
        <div>
          <div className="slot-name">Crafting {itemName}</div>
          <div className="muted">
            <Timer size={14} aria-hidden="true" /> Time left: {timeLeft}
          </div>
        </div>
        <Button variant="secondary" onClick={onForceComplete}>
          Force Complete
        </Button>
      </div>
      <div style={{ marginTop: 14 }}>
        <TimerBar startedAt={activeCraft.startedAt} completesAt={activeCraft.completesAt} now={now} />
      </div>
    </article>
  );
}
