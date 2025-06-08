import { gs } from '../_state';
import { uiState } from '../_state/state-ui.svelte';
import { workOnActivities } from './activities';
import { setCharactersObjectives } from './objectives';

// Track accumulated real time for tick calculation
let accumulatedTime = 0;

export function passTime(duration: number) {
  if (!uiState.isPaused) {
    // Accumulate real time
    accumulatedTime += duration;

    // Calculate if we should trigger a tick (1 tick = 1 game minute)
    // Each tick takes (1 / simulationSpeed) seconds of real time
    const tickThreshold = 1 / uiState.simulationSpeed;

    // Only process one tick at a time
    if (accumulatedTime >= tickThreshold) {
      simulationTick();
      // Keep the remainder for next tick
      accumulatedTime -= tickThreshold;
    }
  }
}

export function getTime(ellapsedTime: number | null = null) {
  if (ellapsedTime === null) {
    ellapsedTime = gs.time.ellapsedTime;
  }
  return new Date(gs.time.startDate.getTime() + ellapsedTime * 60 * 1000);
}

export function togglePause() {
  uiState.isPaused = !uiState.isPaused;
}

export function setSpeed(speed: number) {
  uiState.simulationSpeed = speed;
}

function simulationTick() {
  gs.time.ellapsedTime += 1;
  workOnActivities(gs.characters);
  // every 10 minutes, check if any characters have an objective
  if (gs.time.ellapsedTime % 10 === 0) {
    setCharactersObjectives(gs.characters);
  }
}
