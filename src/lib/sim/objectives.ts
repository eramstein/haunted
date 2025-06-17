import type { Character, Objective } from '@/lib/_model/model-sim';
import { ObjectiveType } from '../_model/model-sim.enums';
import { gs } from '../_state';
import { config } from '../_config';

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
  if (character.needs.food > config.needs.food) {
    return { type: ObjectiveType.HaveMeal };
  }
  if (character.needs.sleep > config.needs.sleep) {
    return { type: ObjectiveType.Rest };
  }
  if (character.needs.social > config.needs.social) {
    return { type: ObjectiveType.Socialize };
  }
  if (character.needs.fun > config.needs.fun) {
    return { type: ObjectiveType.HaveFun };
  }
  if (character.money < 1000) {
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
  }
}

export function changeObjective(character: Character, objective: Objective, reason: string = '') {
  character.objective = objective;
  if (reason) {
    // TODO: log memory
    console.log(`${character.name} changed objective to ${objective.type} because ${reason}`);
  }
}
