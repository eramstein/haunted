import type { Place, Character } from '@/lib/_model/model-sim';
import { placesMap } from '@/lib/_state';

export function move(character: Character, place: Place) {
  if (!place || !placesMap.has(place.id)) {
    character.place = 'place-0';
    console.log('move', character.id, 'to default place');
    return;
  }
  character.place = place.id;
  console.log('move', character.id, place.name);
}
