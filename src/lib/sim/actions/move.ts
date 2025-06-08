import type { Place, Character } from '@/lib/_model/model-sim';
import { gs } from '@/lib/_state';

export function move(character: Character, place: Place) {
  character.place = place.id;
  console.log('move', character.id, place.name);
}
