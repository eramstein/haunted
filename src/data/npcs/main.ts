import type { Character } from '@/lib/_model/model-sim';
import { NPC_EMMA } from './emma';

export const NPCS: Array<Character> = [NPC_EMMA].map((npc, index) => ({
  ...npc,
  index,
}));
