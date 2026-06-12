import { clamp } from "../../utils/math";

type TimerBarProps = {
  startedAt: number;
  completesAt: number;
  now: number;
};

export function TimerBar({ startedAt, completesAt, now }: TimerBarProps) {
  const durationMs = Math.max(1, completesAt - startedAt);
  const elapsedMs = clamp(now - startedAt, 0, durationMs);
  const progress = (elapsedMs / durationMs) * 100;

  return (
    <div
      aria-label="Craft progress"
      className="timer-track"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="timer-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}
