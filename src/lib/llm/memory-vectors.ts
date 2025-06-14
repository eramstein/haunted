import { vectorDatabaseClient } from './vector-db';
import { gs } from '../_state';
import type { GroupActivityLog } from '../_model/model-sim';
import { MEMORY_COLLECTION } from './config';
import { NPCS } from '@/data/npcs';

export async function initChromaCollection() {
  const collection = await vectorDatabaseClient.getOrCreateCollection({
    name: MEMORY_COLLECTION,
  });
  NPCS.forEach(async (character, index) => {
    await collection.upsert({
      documents: character.initialMemories,
      metadatas: character.initialMemories.map(() => ({
        type: 'npc_lore',
        characters: '|' + String(index) + '|',
      })),
      ids: character.initialMemories.map((_, i) => index + ' lore ' + i),
    });
  });
  console.log('NPCs memory initalized');
}

export async function queryNpcMemory(characterIds: number[], message: string) {
  // Query character's personal memories
  const collection = await vectorDatabaseClient.getOrCreateCollection({
    name: MEMORY_COLLECTION,
  });
  const results = await collection.query({
    queryTexts: message,
    nResults: 3,
    where: {
      $or: characterIds.map((id) => ({
        characters: { $in: [`|${id}|`] },
      })),
    },
  });

  const documents = results.documents?.[0] || [];
  const scores = results.distances?.[0] || documents.map(() => 2);
  const metadatas = results.metadatas?.[0] || documents.map(() => ({}));
  const ids = results.ids?.[0] || documents.map((_, i) => i);

  return documents.map((doc, i) => ({
    document: doc,
    score: scores[i],
    metadata: metadatas[i],
    id: ids[i],
  }));
}

export async function addGroupActivityMemory(activityLog: GroupActivityLog) {
  const collection = await vectorDatabaseClient.getOrCreateCollection({
    name: MEMORY_COLLECTION,
  });
  // one collective memory about the event
  collection.add({
    ids: [activityLog.id],
    metadatas: [
      {
        timestamp: activityLog.timestamp,
        type: 'group_activity',
        characters: '|' + activityLog.participants.join('|') + '|',
      },
    ],
    documents: [activityLog.content.summary],
  });
  // individual memories in case of high emotional impact
  const nameToId = activityLog.participants.reduce(
    (acc, id) => {
      const name = gs.characters.find((c) => c.id === id)?.name || 'unknown';
      acc[name] = id;
      return acc;
    },
    {} as Record<string, number>
  );
  activityLog.content.updates
    .filter((update) => Math.abs(update.delta) > 0.6)
    .forEach((update) => {
      const uid = Date.now().toString(36) + Math.random().toString(36).substr(2);
      collection.add({
        ids: [uid],
        metadatas: [
          {
            timestamp: activityLog.timestamp,
            type: 'relationship_update',
            characters: '|' + nameToId[update.from] + '|' + nameToId[update.toward] + '|',
          },
        ],
        documents: [update.reason],
      });
    });
}
