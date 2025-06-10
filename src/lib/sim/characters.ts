import type { Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';

export function getCharactersByActivityType(characters: Character[], activityType?: ActivityType) {
  if (!activityType) {
    return characters.filter((character) => character.activity === null);
  }
  return characters.filter((character) => character.activity?.type === activityType);
}
