import type { Character } from '../_model/model-sim';
import { ActivityType, ObjectiveType } from '../_model/model-sim.enums';
import { move, setHaveMealTask } from './actions';

export function workOnActivities(characters: Character[]) {
  characters.forEach(workOnActivity);
}

function workOnActivity(character: Character) {
  if (character.activity === null) {
    setActivityFromObjective(character);
  } else {
    progressActivity(character);
    if (character.activity.progress >= 100) {
      finishActivity(character);
    }
  }
}

function setActivityFromObjective(character: Character) {
  switch (character.objective?.type) {
    case ObjectiveType.HaveMeal:
      setHaveMealTask(character);
      break;
    default:
      break;
  }
}

function progressActivity(character: Character) {
  switch (character.activity!.type) {
    case ActivityType.GoTo:
      move(character);
      break;
    default:
      break;
  }
}

function finishActivity(character: Character) {
  character.activity = null;
}
