import type { Character } from '@/lib/_model/model-sim';
import { ObjectiveType } from '../_model/model-sim.enums';
import { gs } from '../_state';
import { config } from '../_config';

export function setCharactersObjectives(characters: Character[]) {
  characters.forEach((character) => {
    if (character.objective === null) {
      const objective = getPriorityObjective(character);
      if (objective) {
        character.objective = { type: objective };
      }
    }
  });
  // TODO: check if higher priority objectives should replace current one (e.g. hunger > sleep)
}

// follow pyramid of needs
function getPriorityObjective(character: Character): ObjectiveType | null {
  if (character.needs.food > config.needs.food) {
    return ObjectiveType.HaveMeal;
  }
  if (character.needs.sleep > config.needs.sleep) {
    return ObjectiveType.Rest;
  }
  if (character.needs.social > config.needs.social) {
    return ObjectiveType.Socialize;
  }
  if (character.needs.fun > config.needs.fun) {
    return ObjectiveType.HaveFun;
  }
  return null;
}

export function checkIfObjectiveIsSatisfied(character: Character, objective: ObjectiveType) {
  switch (objective) {
    case ObjectiveType.HaveMeal:
      return character.needs.food < config.needs.food / 2;
    case ObjectiveType.Rest:
      return character.needs.sleep < config.needs.sleep / 2;
    case ObjectiveType.HaveFun:
      return character.needs.fun < config.needs.fun / 2;
    case ObjectiveType.Socialize:
      return character.needs.social < config.needs.social / 2;
  }
}
