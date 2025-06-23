import { vectorDatabaseClient } from './vector-db';
import { gs } from '../_state';
import type { GroupActivityLog } from '../_model/model-sim';
import { MEMORY_COLLECTION } from './config';

export async function queryNpcMemory(characterIds: number[], message: string) {
  const documents: (string | null)[] = [];
  const scores: number[] = [];
  const ids: string[] = [];
  const participants: number[] = [];

  for (const characterId of characterIds) {
    const collection = await vectorDatabaseClient.getOrCreateCollection({
      name: MEMORY_COLLECTION + '_' + characterId,
    });
    const results = await collection.query({
      queryTexts: message,
      nResults: 3,
    });
    const resultDocs = results.documents?.[0] || [];
    const resultScores = results.distances?.[0] || resultDocs.map(() => 2);
    const resultIds = results.ids?.[0] || resultDocs.map((_, i) => i);

    documents.push(...resultDocs);
    scores.push(...resultScores);
    ids.push(...resultIds);
    participants.push(...resultDocs.map(() => characterId));
  }

  // Merge duplicate IDs
  const mergedMap = new Map<
    string,
    {
      document: string | null;
      score: number;
      participants: number[];
    }
  >();

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const existing = mergedMap.get(id);

    if (existing) {
      // Merge: keep first document, highest score, combine participants
      mergedMap.set(id, {
        document: existing.document, // Keep first document
        score: Math.min(existing.score, scores[i]), // Keep highest score (lower distance = better)
        participants: [...new Set([...existing.participants, participants[i]])], // Combine and deduplicate
      });
    } else {
      // First occurrence
      mergedMap.set(id, {
        document: documents[i],
        score: scores[i],
        participants: [participants[i]],
      });
    }
  }

  return Array.from(mergedMap.entries()).map(([id, data]) => ({
    document: data.document,
    score: data.score,
    id,
    participants: data.participants,
  }));
}

export async function addGroupActivityMemory(activityLog: GroupActivityLog) {
  // one collective memory about the event
  activityLog.participants.forEach(async (id) => {
    const collection = await vectorDatabaseClient.getOrCreateCollection({
      name: MEMORY_COLLECTION + '_' + id,
    });
    collection.add({
      ids: [activityLog.id],
      metadatas: [
        {
          timestamp: activityLog.timestamp,
          type: 'group_activity',
        },
      ],
      documents: [activityLog.content.summary],
    });
  });

  const nameToId = activityLog.participants.reduce(
    (acc, id) => {
      const name = gs.characters.find((c) => c.id === id)?.name || 'unknown';
      acc[name] = id;
      return acc;
    },
    {} as Record<string, number>
  );

  // individual memories in case of high relational or emotional impact
  activityLog.content.relationUpdates
    .filter((update) => Math.abs(update.delta) > 0.6)
    .forEach(async (update) => {
      const uid = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const fromId = nameToId[update.from];
      const towardId = nameToId[update.toward];
      if (fromId !== undefined && towardId !== undefined) {
        const collection = await vectorDatabaseClient.getOrCreateCollection({
          name: MEMORY_COLLECTION + '_' + fromId,
        });
        collection.add({
          ids: [uid],
          metadatas: [
            {
              timestamp: activityLog.timestamp,
              type: 'relationship_update',
            },
          ],
          documents: [update.cause],
        });
      }
    });
  activityLog.content.emotionUpdates
    .filter((update) => Math.abs(update.delta) > 0.6)
    .forEach(async (update) => {
      const uid = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const collection = await vectorDatabaseClient.getOrCreateCollection({
        name: MEMORY_COLLECTION + '_' + nameToId[update.characterName],
      });
      collection.add({
        ids: [uid],
        metadatas: [
          {
            timestamp: activityLog.timestamp,
            type: 'emotion_update',
          },
        ],
        documents: [update.cause],
      });
    });
}
