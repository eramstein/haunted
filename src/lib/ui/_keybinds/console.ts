import { listCollectionsWithContent, resetVectorDatabase } from '@/lib/llm';
import { gs } from '../../_state';
import { resetIndexDB } from '../../llm/index-db';
import { getSystemPromptMemories } from '@/lib/llm/memory';
import { ActivityType } from '@/lib/_model/model-sim.enums';

export const consoleCommands = {
  reset: async () => {
    await resetVectorDatabase();
    await resetIndexDB();
    localStorage.clear();
  },
  list: () => {
    listCollectionsWithContent();
  },
  l: () => {
    console.log(JSON.stringify(gs, null, 2));
  },
  t: () => {},
};
