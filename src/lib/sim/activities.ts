import type { Character } from '../_model/model-sim';
import { ObjectiveType } from '../_model/model-sim.enums';
import { setHaveMealTask } from './actions';

export function workOnActivities(characters: Character[]) {
  characters.forEach(workOnActivity);
}

function workOnActivity(character: Character) {
  if (character.activity === null) {
    setActivityFromObjective(character);
  } else {
    character.activity.progress += 1;
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
