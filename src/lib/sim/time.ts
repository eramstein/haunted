import { gs } from '../_state';

export function passTime(duration: number) {
  gs.time.ellapsedTime += duration;
}

export function getTime() {
  return new Date(gs.time.startDate.getTime() + gs.time.ellapsedTime * 60 * 1000);
}
