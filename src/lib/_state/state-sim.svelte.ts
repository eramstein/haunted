import {
  type CharacterBase,
  type Character,
  type State,
  type PlaceBase,
  type Place,
} from '../_model/model-sim';
import { PLACES } from '@/data/world/places';
import { NPCS } from '@/data/npcs';

export const initialState: State = {
  time: {
    startDate: new Date(),
    ellapsedTime: 0,
  },
  places: PLACES.map(initPlace),
  characters: NPCS.map(initCharacter),
  player: {
    place: 0,
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
    index,
    needs: {
      food: {
        lastMeal: 0,
      },
      sleep: {
        lastSleep: 0,
      },
    },
  };
}

function initPlace(place: PlaceBase, index: number): Place {
  return {
    ...place,
    index,
  };
}
