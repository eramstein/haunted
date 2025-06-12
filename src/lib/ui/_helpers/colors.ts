export function getFeelingColor(value: number): string {
  // Normalize value to 0-1 range
  const normalized = (value + 100) / 200;

  // Calculate RGB values
  const r = Math.round(255 * (1 - normalized));
  const g = Math.round(255 * normalized);

  return `rgb(${r}, ${g}, 0)`;
}
