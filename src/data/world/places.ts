import type { Place, Position } from '@/lib/_model/model-sim';
import { NPCS } from '../npcs';

const roomPositions: Record<string, Position> = {
  emma: { x: 19.8, y: 65, width: 35.1 - 19.8, height: 85 - 65 },
  henry: { x: 10, y: 50, width: 10, height: 10 },
  molly: { x: 20, y: 10, width: 10, height: 10 },
  ousmane: { x: 30, y: 40, width: 10, height: 10 },
  antoine: { x: 40, y: 20, width: 10, height: 10 },
  lisa: { x: 50, y: 60, width: 10, height: 10 },
};

const PLACES_BASE: Omit<Place, 'index'>[] = [
  {
    name: 'Kitchen',
    description: 'A large kitchen with a big table and 6 chairs, an oven, and a fridge.',
    image: 'kitchen',
    position: { x: 18.37, y: 6.7, width: 35.4 - 18.5, height: 21.5 - 6.7 },
  },
];

Object.values(NPCS).forEach((npc) => {
  PLACES_BASE.push({
    name: `${npc.name}'s room`,
    description: `${npc.name}'s room, basic bedroom with a bed, a desk, a chair and a closet.`,
    image: `${npc.key}_room`,
    position: roomPositions[npc.key],
  });
});

export const PLACES = PLACES_BASE.map((p, i) => ({
  index: i,
  ...p,
}));
