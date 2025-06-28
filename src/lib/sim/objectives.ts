import type { Character, Objective } from '@/lib/_model/model-sim';
import { ActivityType, ObjectiveType } from '../_model/model-sim.enums';
import { gs } from '../_state';
import { config } from '../_config';
import { recordProblem } from './problems';

export function setCharactersObjectives(characters: Character[]) {
  characters.forEach((character) => {
    if (character.objective === null) {
      const objective = getPriorityObjective(character);
      if (objective) {
        character.objective = objective;
      }
    }
  });
  // TODO: check if higher priority objectives should replace current one (e.g. hunger > sleep)
}

// follow pyramid of needs
function getPriorityObjective(character: Character): Objective | null {
  if (
    character.needs.food > config.needs.food &&
    !character.onHoldObjectives[ObjectiveType.HaveMeal]
  ) {
    return { type: ObjectiveType.HaveMeal };
  }
  if (character.problems.length > 0) {
    return { type: ObjectiveType.SolveProblem, target: character.problems[0] };
  }
  if (
    character.needs.sleep > config.needs.sleep &&
    !character.onHoldObjectives[ObjectiveType.Rest]
  ) {
    return { type: ObjectiveType.Rest };
  }
  if (
    character.needs.social > config.needs.social &&
    !character.onHoldObjectives[ObjectiveType.Socialize]
  ) {
    return { type: ObjectiveType.Socialize };
  }
  if (
    character.needs.fun > config.needs.fun &&
    !character.onHoldObjectives[ObjectiveType.HaveFun]
  ) {
    return { type: ObjectiveType.HaveFun };
  }
  if (character.money < 1000 && !character.onHoldObjectives[ObjectiveType.GetMoney]) {
    return { type: ObjectiveType.GetMoney, target: character.money + 100 };
  }
  console.log('no objective found', character.name);
  return null;
}

export function checkIfObjectiveIsSatisfied(character: Character, objective: Objective) {
  switch (objective.type) {
    case ObjectiveType.HaveMeal:
      return character.needs.food < config.needs.food / 2;
    case ObjectiveType.Rest:
      return character.needs.sleep < config.needs.sleep / 2;
    case ObjectiveType.HaveFun:
      return character.needs.fun < config.needs.fun / 2;
    case ObjectiveType.Socialize:
      return character.needs.social < config.needs.social / 2;
    case ObjectiveType.GetMoney:
      return character.money >= (objective.target || 0);
    case ObjectiveType.SolveProblem:
      return character.problems.findIndex((p) => p.type === objective.target.type) === -1;
  }
}

export function changeObjective(character: Character, objective: Objective, cause: string = '') {
  // if the new objective is stuck, don't swap and fail the current one
  if (character.onHoldObjectives[objective.type]) {
    putObjectiveOnHold(character);
    return;
  }
  // else, swap objective
  character.objective = objective;
  if (cause) {
    // TODO: log memory?
    console.log(`${character.name} changed objective to ${objective.type} because ${cause}`);
  }
}

export function putObjectiveOnHold(
  character: Character,
  isProblem: boolean = false,
  activityType: ActivityType | null = null
) {
  const objective = character.objective;
  if (!objective) {
    return;
  }
  if (activityType) {
    objective.pastAttempts = objective.pastAttempts || {};
    objective.pastAttempts[activityType] = (objective.pastAttempts[activityType] || 0) + 1;
    console.log('past attempts', objective.pastAttempts[activityType]);
    if (objective.pastAttempts[activityType] === 1) {
      // first time we failed, don't put on hold yet, let the character try other paths
      return;
    }
  }
  console.log('putting objective on hold', character.name, objective.type);
  character.onHoldObjectives[objective.type] = true;
  character.objective = null;
  if (isProblem) {
    recordProblem(character, objective);
  }
}

export function objectiveTypeIsScheduled(character: Character, objectiveType: ObjectiveType) {
  if (character.objective?.type === objectiveType) {
    character.objective = null;
  }
  character.onHoldObjectives[objectiveType] = true;
}

export function resetFailedObjectives() {
  gs.characters.forEach((character) => {
    character.onHoldObjectives = {};
  });
}
