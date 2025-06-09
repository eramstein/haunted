import type { Character } from '../_model/model-sim';
import { ActivityType, ObjectiveType } from '../_model/model-sim.enums';
import { cook, eat, setHaveMealTask } from './actions/eat';
import { sleep, setRestTask } from './actions/sleep';
import { move } from './actions/move';
import { checkIfObjectiveIsSatisfied } from './objectives';

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
    case ObjectiveType.Rest:
      setRestTask(character);
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
    case ActivityType.Eat:
      eat(character);
      break;
    case ActivityType.Sleep:
      sleep(character);
      break;
    case ActivityType.Cook:
      cook(character);
      break;
    default:
      break;
  }
}

function finishActivity(character: Character) {
  character.activity = null;
  if (character.objective) {
    const objectiveCompleted = checkIfObjectiveIsSatisfied(character, character.objective.type);
    if (objectiveCompleted) {
      character.objective = null;
    }
  }
}
