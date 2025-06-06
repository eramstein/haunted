import type { Place, Position } from '@/lib/_model/model-sim';
import { NPCS } from '../npcs';

const roomPositions: Record<string, Position> = {
  emma: { x: 0, y: 0, width: 10, height: 10 },
  henry: { x: 10, y: 0, width: 10, height: 10 },
  molly: { x: 200, y: 0, width: 10, height: 10 },
  ousmane: { x: 300, y: 0, width: 10, height: 10 },
  antoine: { x: 400, y: 0, width: 10, height: 10 },
  lisa: { x: 500, y: 0, width: 10, height: 10 },
};

const PLACES_BASE: Omit<Place, 'index'>[] = [
  {
    name: 'Kitchen',
    description: 'A large kitchen with a big table and 6 chairs, an oven, and a fridge.',
    image: 'kitchen',
    position: { x: 0, y: 0, width: 100, height: 100 },
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
