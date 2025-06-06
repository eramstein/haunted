import type { Place } from '@/lib/_model/model-sim';
import { NPCS } from '../npcs';

const PLACES_BASE: Omit<Place, 'index'>[] = [
  {
    name: 'Kitchen',
    description: 'A large kitchen with a big table and 6 chairs, an oven, and a fridge.',
    image: 'kitchen',
  },
];

Object.values(NPCS).forEach((npc) => {
  PLACES_BASE.push({
    name: `${npc.name}'s room`,
    description: `${npc.name}'s room, basic bedroom with a bed, a desk, a chair and a closet.`,
    image: `${npc.key}_room`,
  });
});

export const PLACES = PLACES_BASE.map((p, i) => ({
  index: i,
  ...p,
}));
