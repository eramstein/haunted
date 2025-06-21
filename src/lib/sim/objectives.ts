import type { Character, Objective } from '@/lib/_model/model-sim';
import { ObjectiveType } from '../_model/model-sim.enums';
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
    !character.failedObjectives[ObjectiveType.HaveMeal]
  ) {
    return { type: ObjectiveType.HaveMeal };
  }
  if (character.problems.length > 0) {
    return { type: ObjectiveType.SolveProblem, target: character.problems[0] };
  }
  if (
    character.needs.sleep > config.needs.sleep &&
    !character.failedObjectives[ObjectiveType.Rest]
  ) {
    return { type: ObjectiveType.Rest };
  }
  if (
    character.needs.social > config.needs.social &&
    !character.failedObjectives[ObjectiveType.Socialize]
  ) {
    return { type: ObjectiveType.Socialize };
  }
  if (
    character.needs.fun > config.needs.fun &&
    !character.failedObjectives[ObjectiveType.HaveFun]
  ) {
    return { type: ObjectiveType.HaveFun };
  }
  if (character.money < 1000 && !character.failedObjectives[ObjectiveType.GetMoney]) {
    return { type: ObjectiveType.GetMoney, target: character.money + 100 };
  }
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

export function changeObjective(character: Character, objective: Objective, reason: string = '') {
  // if the new objective is stuck, don't swap and fail the current one
  if (character.failedObjectives[objective.type]) {
    failObjective(character, character.objective!, false);
    return;
  }
  // else, swap objective
  character.objective = objective;
  if (reason) {
    // TODO: log memory?
    console.log(`${character.name} changed objective to ${objective.type} because ${reason}`);
  }
}

export function failObjective(
  character: Character,
  objective: Objective,
  isProblem: boolean = true
) {
  character.failedObjectives[objective.type] = true;
  character.objective = null;
  if (isProblem) {
    recordProblem(character, objective);
  }
}

export function resetFailedObjectives() {
  gs.characters.forEach((character) => {
    character.failedObjectives = {};
  });
}
