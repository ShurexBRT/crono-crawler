export function vaultScrollDelta(axis: number, elapsedMs: number): number {
  if (!Number.isFinite(axis) || !Number.isFinite(elapsedMs)) return 0;
  const magnitude = Math.min(1, Math.abs(axis));
  if (magnitude <= .22 || elapsedMs <= 0) return 0;
  return Math.sign(axis) * ((magnitude - .22) / .78) * 640 * Math.min(elapsedMs, 50) / 1000;
}
