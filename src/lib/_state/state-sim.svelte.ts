import { type CharacterBase, type Character, type State, type Place } from '../_model/model-sim';
import { PLACES } from '@/data/world/places';
import { NPCS } from '@/data/npcs';

export const initialState: State = {
  time: {
    startDate: new Date(),
    ellapsedTime: 0,
    lightLevel: 1,
    dateString: '12:00',
  },
  places: PLACES.map(initPlace),
  characters: NPCS.map(initCharacter),
  player: {
    place: 0, // Default to first place
  },
  items: {},
  itemIndices: {
    byType: {},
    byOwnerId: {},
    byLocationId: {},
    byTypeAndOwner: {},
  },
};

function initCharacter(character: CharacterBase, index: number): Character {
  return {
    ...character,
    id: index,
    place: 0, // Default to first place
    activities: [],
    objective: null,
    needs: {
      food: 0,
      sleep: 0,
      fun: 1440,
      social: 0,
    },
  };
}

function initPlace(place: Omit<Place, 'id'>, index: number): Place {
  return {
    ...place,
    id: index,
  };
}
