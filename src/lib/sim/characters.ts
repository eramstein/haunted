import type { Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';

export function getCharactersByActivityType(characters: Character[], activityType?: ActivityType) {
  if (!activityType) {
    return characters.filter((character) => character.activities.length === 0);
  }
  return characters.filter((character) => character.activities[0]?.type === activityType);
}
