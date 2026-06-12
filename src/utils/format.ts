import type { Rarity } from "../types/common.types";

export function formatNumber(value: number): string {
  return Math.floor(value).toLocaleString("en-US");
}

export function formatResource(value: number, cap?: number): string {
  const amount = formatNumber(value);
  return cap === undefined ? amount : `${amount}/${formatNumber(cap)}`;
}

export function formatTimer(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatRarity(rarity: Rarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

export function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
