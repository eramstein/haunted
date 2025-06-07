import { getTime } from '../../sim/time';

export function formatGameDate(): string {
  const date = getTime();
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const dayOfWeek = date.toLocaleString('en-GB', { weekday: 'short' });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // Add ordinal suffix to day
  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${dayOfWeek}, ${ordinal(day)} ${month} ${hours}:${minutes}`;
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  return `${hours}h ${remainingMinutes}m`;
}
