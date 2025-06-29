import type { Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { gs } from '../_state';
import { nameBedroom, PLACES } from '@/data/world/places';

export function getCharactersByActivityType(characters: Character[], activityType?: ActivityType) {
  if (!activityType) {
    return characters.filter((character) => character.activities.length === 0);
  }
  return characters.filter((character) => character.activities[0]?.type === activityType);
}

export function getCharacterByName(name: string) {
  return gs.characters.find((character) => character.name === name);
}

export function getCharacterBedroom(character: Character) {
  return gs.places.find((place) => place.name === nameBedroom(character.name));
}
