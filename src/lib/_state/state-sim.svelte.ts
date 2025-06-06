import type { State } from '../_model/model-sim';
import { PLACES } from '@/data/world/places';
import { NPCS } from '@/data/npcs';

export const initialState: State = {
  time: {
    startDate: new Date(),
    ellapsedTime: 0,
  },
  places: PLACES,
  characters: NPCS,
  player: {
    place: 0,
  },
};
