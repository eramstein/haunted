import type { Activity, Character } from '../_model/model-sim';
import { ActivityType, ObjectiveType } from '../_model/model-sim.enums';
import {
  move,
  cook,
  eat,
  setHaveMealTask,
  sleep,
  setRestTask,
  setSocializeTask,
  chat,
} from './actions';
import { checkIfObjectiveIsSatisfied } from './objectives';

export function workOnActivities(characters: Character[]) {
  characters.forEach(workOnActivity);
}

function workOnActivity(character: Character) {
  if (character.activities.length === 0) {
    setActivityFromObjective(character);
  } else {
    progressActivity(character);
    if (character.activities[0].progress >= 100) {
      finishActivity(character);
    }
  }
}

function setActivityFromObjective(character: Character) {
  switch (character.objective?.type) {
    case ObjectiveType.HaveMeal:
      setHaveMealTask(character);
      break;
    case ObjectiveType.Rest:
      setRestTask(character);
      break;
    case ObjectiveType.Socialize:
      setSocializeTask(character);
      break;
    default:
      break;
  }
}

function progressActivity(character: Character) {
  if (character.activities.length === 0) return;
  const activity = character.activities[0];
  switch (activity.type) {
    case ActivityType.GoTo:
      move(character, activity as Activity<ActivityType.GoTo>);
      break;
    case ActivityType.Eat:
      eat(character, activity as Activity<ActivityType.Eat>);
      break;
    case ActivityType.Sleep:
      sleep(character, activity as Activity<ActivityType.Sleep>);
      break;
    case ActivityType.Cook:
      cook(character, activity as Activity<ActivityType.Cook>);
      break;
    case ActivityType.Chat:
      chat(character, activity as Activity<ActivityType.Chat>);
      break;
    default:
      break;
  }
}

function finishActivity(character: Character) {
  character.activities.shift();
  if (character.objective) {
    const objectiveCompleted = checkIfObjectiveIsSatisfied(character, character.objective.type);
    if (objectiveCompleted) {
      character.objective = null;
    }
  }
}
