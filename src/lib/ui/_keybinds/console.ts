import { initNpcMemory, listCollectionsWithContent, resetVectorDatabase } from '@/lib/llm';
import { initWorldMemory } from '@/lib/llm/world';
import { gs } from '../../_state';

export const consoleCommands = {
  load: () => {
    initNpcMemory();
    initWorldMemory();
  },
  reset: () => {
    resetVectorDatabase();
  },
  list: () => {
    listCollectionsWithContent();
  },
  l: () => {
    console.log(JSON.stringify(gs, null, 2));
  },
  vdb: async () => {
    await resetVectorDatabase();
    await initNpcMemory();
    await initWorldMemory();
  },
};
