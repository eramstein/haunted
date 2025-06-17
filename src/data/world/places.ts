import type { Place, Position } from '@/lib/_model/model-sim';
import { NPCS } from '../npcs';

const roomPositions: Record<string, Position> = {
  emma: { x: 19.8, y: 65, width: 35.1 - 19.8, height: 85 - 65 },
  henry: { x: 5.65, y: 41.4, width: 18.36 - 5.65, height: 63.07 - 41.4 },
  molly: { x: 19.8, y: 41.3, width: 35.3 - 19.8, height: 57.8 - 41.3 },
  ousmane: { x: 71, y: 46, width: 86 - 71, height: 63 - 46 },
  antoine: { x: 37, y: 7, width: 50 - 37, height: 27 - 7 },
  lise: { x: 51, y: 7, width: 70 - 51, height: 27 - 7 },
};

export const PLACES: Omit<Place, 'id'>[] = [
  {
    name: 'Living room',
    description: 'A very large living room with a big TV, a sofa and a coffee table.',
    image: 'living_room',
    position: { x: 52, y: 28.6, width: 70 - 52, height: 56.6 - 28.6 },
  },
  {
    name: 'Kitchen',
    description: 'A large kitchen with an oven and a fridge.',
    image: 'kitchen',
    position: { x: 18.37, y: 6.7, width: 35.4 - 18.5, height: 21.5 - 6.7 },
  },
  {
    name: 'Dining room',
    description: 'A large dining room with a big table and 6 chairs.',
    image: 'dining_room',
    position: { x: 18.37, y: 22.7, width: 35.4 - 18.5, height: 39.7 - 22.7 },
  },
  {
    name: 'Gaming room',
    description:
      'A very large room with a big table and 6 chairs, shelves of board games role playing games.',
    image: 'gaming_room',
    position: { x: 36.5, y: 58.5, width: 61.5 - 36.5, height: 76.5 - 58.5 },
  },
  {
    name: 'Library',
    description: 'A small cosy library with walls full of books.',
    image: 'library',
    position: { x: 36.5, y: 38.5, width: 50 - 36.5, height: 52.5 - 38.5 },
  },
  {
    name: 'Bathroom',
    description: 'A small bathroom with a toilet, a sink and a shower.',
    image: 'bathroom',
    position: { x: 71, y: 34, width: 86 - 71, height: 44 - 34 },
  },
  {
    name: 'Veranda',
    description: 'A small veranda with a lots of light and cute plants.',
    image: 'veranda',
    position: { x: 74, y: 65, width: 86 - 74, height: 80 - 65 },
  },
  {
    name: 'Cellar',
    description: 'A small cellar with a lots of wine bottles.',
    image: 'cellar',
    position: { x: 5.7, y: 64.4, width: 18.36 - 5.7, height: 81.07 - 64.4 },
  },
  {
    name: 'Grocery Store',
    description: 'A small grocery store with a lots of food and drinks.',
    image: 'grocery_store',
    position: { x: 100, y: 0, width: 25, height: 10 },
    outside: true,
  },
  {
    name: 'Office',
    description: 'An office building in the city center.',
    image: 'office',
    position: { x: 100, y: 10, width: 25, height: 10 },
    outside: true,
  },
  {
    name: 'University',
    description: 'A university with a lots of students and professors.',
    image: 'university',
    position: { x: 100, y: 20, width: 25, height: 10 },
    outside: true,
  },
];

Object.values(NPCS).forEach((npc) => {
  PLACES.push({
    name: `${npc.name}'s room`,
    description: `${npc.name}'s room, basic bedroom with a bed, a desk, a chair and a closet.`,
    image: `${npc.name.toLowerCase()}_room`,
    position: roomPositions[npc.name.toLowerCase()],
  });
});

export const PLACES_IDS_BY_TYPE: Record<string, number> = {
  livingRoom: 0,
  kitchen: 1,
  diningRoom: 2,
  gamingRoom: 3,
  library: 4,
  bathroom: 5,
  veranda: 6,
  cellar: 7,
  groceryStore: 8,
  office: 9,
  university: 10,
};
