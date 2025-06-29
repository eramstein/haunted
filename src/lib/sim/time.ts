import { gs } from '../_state';
import { uiState } from '../_state/state-ui.svelte';
import { workOnActivities } from './activities';
import { resetFailedObjectives, setCharactersObjectives } from './objectives';
import { updateCharactersNeeds } from './needs';
import { decayEmotionsForAllCharacters } from './emotions';

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
  setComputedTimes();
  updateCharactersNeeds();

  // every 10 minutes, check if any characters have an objective
  if (gs.time.ellapsedTime % 10 === 0) {
    setCharactersObjectives(gs.characters);
  }

  // progress current activity
  workOnActivities(gs.characters, gs.time.ellapsedTime);

  // every 60 minutes, decay emotions
  if (gs.time.ellapsedTime % 60 === 0) {
    decayEmotionsForAllCharacters();
  }
  // every 12 hours, reset failed objectives
  if (gs.time.ellapsedTime % 720 === 0) {
    resetFailedObjectives();
  }
}

function updateLightLevel(hour: number, minute: number) {
  // Convert time to decimal hours for easier calculations
  const timeInHours = hour + minute / 60;

  // Full daylight (8am to 8pm)
  if (timeInHours >= 8 && timeInHours < 20) {
    gs.time.lightLevel = 1;
  }
  // Full darkness (10pm to 6am)
  else if (timeInHours >= 22 || timeInHours < 6) {
    gs.time.lightLevel = 0;
  }
  // Sunset transition (8pm to 10pm)
  else if (timeInHours >= 20 && timeInHours < 22) {
    // Linear interpolation from 1 to 0 over 2 hours
    const progress = (timeInHours - 20) / 2;
    gs.time.lightLevel = 1 - progress;
  }
  // Sunrise transition (6am to 8am)
  else if (timeInHours >= 6 && timeInHours < 8) {
    // Linear interpolation from 0 to 1 over 2 hours
    const progress = (timeInHours - 6) / 2;
    gs.time.lightLevel = progress;
  }
}

function setComputedTimes() {
  const date = getTime();
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const dayOfWeek = date.toLocaleString('en-GB', { weekday: 'short' });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // Set stringified date format
  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  gs.time.dateString = `${dayOfWeek}, ${ordinal(day)} ${month} ${hours}:${minutes}`;

  // update light level
  updateLightLevel(+hours, +minutes);
}

export function getTimeOfDay(timestamp: number) {
  return getTime(timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function isDuringSleepHours(timestamp: number): boolean {
  const date = getTime(timestamp);
  const hour = date.getHours();
  return hour >= 0 && hour < 7;
}

export function skipToNextMorningTime(timestamp: number): number {
  const date = getTime(timestamp);
  const hour = date.getHours();
  if (hour < 7) {
    return timestamp + (7 - hour) * 60;
  }
  return timestamp + (24 - hour) * 60;
}
