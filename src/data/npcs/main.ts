import type { Character } from '@/lib/_model/model-sim';
import { NPC_EMMA } from './emma';
import { NPC_HENRY } from './henry';
import { NPC_MOLLY } from './molly';
import { NPC_ANTONIE } from './antoine';
import { NPC_OUSMANE } from './ousmane';
import { NPC_LISE } from './lise';

export const NPCS: Array<Character> = [
  NPC_EMMA,
  NPC_HENRY,
  NPC_MOLLY,
  NPC_ANTONIE,
  NPC_OUSMANE,
  NPC_LISE,
].map((npc, index) => ({
  ...npc,
  index,
}));
