import {
  type CharacterBase,
  type Character,
  type State,
  type PlaceBase,
  type Place,
} from '../_model/model-sim';
import { PLACES } from '@/data/world/places';
import { NPCS } from '@/data/npcs';

// Initialize places array
const places = PLACES.map(initPlace);

// Create a Map for O(1) place lookups - initialized once since places are static
export const placesMap = new Map<string, Place>(places.map((place) => [place.id, place]));

export const initialState: State = {
  time: {
    startDate: new Date(),
    ellapsedTime: 0,
  },
  places,
  characters: NPCS.map(initCharacter),
  player: {
    place: 'place-0',
  },
  items: {},
  itemIndices: {
    byType: {},
    byOwner: {},
    byLocation: {},
    byTypeAndOwner: {},
  },
};

function initCharacter(character: CharacterBase, index: number): Character {
  return {
    ...character,
    activity: null,
    objective: null,
    needs: {
      food: {
        lastMeal: -360,
      },
      sleep: {
        lastSleep: -360,
      },
    },
  };
}

function initPlace(place: PlaceBase, index: number): Place {
  return {
    ...place,
    id: 'place-' + index,
  };
}
