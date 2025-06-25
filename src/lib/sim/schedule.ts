import type { Activity, Character } from '@/lib/_model/model-sim';
import { gs } from '../_state';
import { getActivityRemainingDuration } from './activities';
import { isDuringSleepHours, skipToNextMorningTime } from './time';
import { ActivityType, ObjectiveType } from '../_model/model-sim.enums';
import { objectiveTypeIsScheduled } from './objectives';

export function startScheduledActivity(character: Character, timestamp: number) {
  if (!character.activitiesScheduled[timestamp]) {
    return;
  }
  const activity = character.activitiesScheduled[timestamp];
  delete character.activitiesScheduled[timestamp];
  character.activities.unshift(activity);
}

export function scheduleActivity(character: Character, activity: Activity, timestamp: number) {
  // note activity on schedule
  character.activitiesScheduled[timestamp] = activity;
  // put objective on hold if applicable
  switch (activity.type) {
    case ActivityType.Chat:
      objectiveTypeIsScheduled(character, ObjectiveType.Socialize);
      break;
    case ActivityType.Play:
      objectiveTypeIsScheduled(character, ObjectiveType.HaveFun);
      break;
  }
}

export function getNextScheduledActivityTime(character: Character, afterTimestamp: number = 0) {
  const nextScheduledActivity = Object.keys(character.activitiesScheduled)
    .filter((timestamp) => Number(timestamp) >= afterTimestamp)
    .sort();
  if (!nextScheduledActivity || nextScheduledActivity.length === 0) {
    return null;
  }
  return Number(nextScheduledActivity[0]);
}

export function getPreviousScheduledActivityTime(
  character: Character,
  beforeTimestamp: number = 0
) {
  const previousScheduledActivity = Object.keys(character.activitiesScheduled)
    .filter((timestamp) => Number(timestamp) <= beforeTimestamp)
    .sort();
  if (!previousScheduledActivity || previousScheduledActivity.length === 0) {
    return null;
  }
  return Number(previousScheduledActivity[previousScheduledActivity.length - 1]);
}

export function getNextAvailableScheduleSlot(character: Character, activityDuration: number) {
  let currentActivtitiesDuration = 0;
  for (const activity of character.activities) {
    currentActivtitiesDuration += getActivityRemainingDuration(activity);
  }
  let tentativeSlot = gs.time.ellapsedTime + currentActivtitiesDuration;
  let nextScheduledActivityTimestamp = getNextScheduledActivityTime(character, tentativeSlot);
  let attempts = 0;
  while (
    nextScheduledActivityTimestamp &&
    nextScheduledActivityTimestamp <= tentativeSlot + activityDuration
  ) {
    attempts++;
    if (attempts > 20) {
      console.log('No available slot found for character', character.name);
      return null;
    }
    tentativeSlot =
      nextScheduledActivityTimestamp +
      getActivityRemainingDuration(character.activitiesScheduled[nextScheduledActivityTimestamp]) +
      1;
    if (isDuringSleepHours(tentativeSlot)) {
      tentativeSlot = skipToNextMorningTime(tentativeSlot);
    }
    nextScheduledActivityTimestamp = getNextScheduledActivityTime(character, tentativeSlot);
  }
  return tentativeSlot;
}

export function willBeAvailableAt(character: Character, timestamp: number, duration: number) {
  const previousScheduledActivityTimestamp = getPreviousScheduledActivityTime(character, timestamp);
  if (
    previousScheduledActivityTimestamp &&
    getActivityRemainingDuration(
      character.activitiesScheduled[previousScheduledActivityTimestamp]
    ) +
      previousScheduledActivityTimestamp >=
      timestamp
  ) {
    return false;
  }
  const nextScheduledActivityTimestamp = getNextScheduledActivityTime(character, timestamp);
  if (nextScheduledActivityTimestamp && nextScheduledActivityTimestamp <= timestamp + duration) {
    return false;
  }
  return true;
}
