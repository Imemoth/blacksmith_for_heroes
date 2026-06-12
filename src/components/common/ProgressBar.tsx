import { clamp } from "../../utils/math";

type ProgressBarProps = {
  value: number;
  max: number;
  label: string;
};

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = max <= 0 ? 0 : clamp((value / max) * 100, 0, 100);

  return (
    <div aria-label={label} className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="progress-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}
