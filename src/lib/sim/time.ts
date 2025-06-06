import { gs } from '../_state';
import { uiState } from '../_state/state-ui.svelte';

export function passTime(duration: number) {
  if (!uiState.isPaused) {
    gs.time.ellapsedTime += duration * uiState.simulationSpeed;
  }
}

export function getTime() {
  return new Date(gs.time.startDate.getTime() + gs.time.ellapsedTime * 60 * 1000);
}

export function togglePause() {
  uiState.isPaused = !uiState.isPaused;
}

export function setSpeed(speed: number) {
  uiState.simulationSpeed = speed;
}
