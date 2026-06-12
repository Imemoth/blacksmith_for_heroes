export function createId(prefix = "id"): string {
  const randomPart =
    globalThis.crypto?.randomUUID?.().slice(0, 8) ??
    Math.random().toString(36).slice(2, 10);

  return `${prefix}_${randomPart}`;
}
