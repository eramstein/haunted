import type { Place, Character } from '@/lib/_model/model-sim';
import { gs } from '@/lib/_state';

export function moveTool(
  character: Character,
  param: {
    destinationPlace: string;
  }
) {
  const place = gs.places.find((p) => p.name === param.destinationPlace);
  if (place) {
    move(character, place);
  }
}

export function move(character: Character, place: Place) {
  character.place = place?.index || 0;
  console.log('move', character.id, place.name);
}
