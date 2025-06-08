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
  if (gs.time.ellapsedTime - character.needs.food.lastMeal > config.needs.food) {
    return ObjectiveType.HaveMeal;
  }
  return null;
}
