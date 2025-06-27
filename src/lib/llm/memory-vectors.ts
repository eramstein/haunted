import { vectorDatabaseClient } from './vector-db';
import { gs } from '../_state';
import type { GroupActivityLog } from '../_model/model-sim';
import { MEMORY_COLLECTION, VECTOR_OPINION, VECTOR_PUBLIC_NPC_INFO } from './config';

export async function queryNpcMemory(characterIds: number[], message: string) {
  const documents: (string | null)[] = [];
  const scores: number[] = [];
  const ids: string[] = [];
  const participants: number[] = [];

  const charactersInScene = [...characterIds];
  if (gs.chat?.playingAsCharacter.id) {
    charactersInScene.push(gs.chat.playingAsCharacter.id);
  }
  // bios and opinions about present characters are already in the system prompt
  const redundantMemoriesIds = [
    ...charactersInScene.map((id) => VECTOR_PUBLIC_NPC_INFO + id),
    ...charactersInScene.map((id) => VECTOR_OPINION + id),
  ];

  for (const characterId of characterIds) {
    try {
      const collection = await vectorDatabaseClient.getOrCreateCollection({
        name: MEMORY_COLLECTION + '_' + characterId,
      });
      const results = await collection.query({
        queryTexts: message,
        nResults: 3,
        where: {
          id: {
            $nin: redundantMemoriesIds,
          },
        },
      });
      const resultDocs = results.documents?.[0] || [];
      const resultScores = results.distances?.[0] || resultDocs.map(() => 2);
      const resultIds = results.ids?.[0] || resultDocs.map((_, i) => i);

      documents.push(...resultDocs);
      scores.push(...resultScores);
      ids.push(...resultIds);
      participants.push(...resultDocs.map(() => characterId));
    } catch (error) {
      console.error(`Error querying memory for character ${characterId}:`, error);
      // Continue with other characters even if one fails
    }
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
  for (const id of activityLog.participants) {
    try {
      const collection = await vectorDatabaseClient.getOrCreateCollection({
        name: MEMORY_COLLECTION + '_' + id,
      });
      await collection.add({
        ids: [activityLog.id],
        metadatas: [
          {
            timestamp: activityLog.timestamp,
            type: 'group_activity',
          },
        ],
        documents: [activityLog.content.summary],
      });
    } catch (error) {
      console.error(`Error adding group activity memory for character ${id}:`, activityLog, error);
      // Continue with other participants even if one fails
    }
  }

  const nameToId = activityLog.participants.reduce(
    (acc, id) => {
      const name = gs.characters.find((c) => c.id === id)?.name || 'unknown';
      acc[name] = id;
      return acc;
    },
    {} as Record<string, number>
  );

  // individual memories in case of high relational or emotional impact
  for (const update of activityLog.content.relationUpdates.filter(
    (update) => Math.abs(update.delta) > 0.6
  )) {
    try {
      const uid = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const fromId = nameToId[update.from];
      const towardId = nameToId[update.toward];
      if (fromId !== undefined && towardId !== undefined) {
        const collection = await vectorDatabaseClient.getOrCreateCollection({
          name: MEMORY_COLLECTION + '_' + fromId,
        });
        await collection.add({
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
    } catch (error) {
      console.error(`Error adding relationship update memory for ${update.from}:`, error);
      // Continue with other updates even if one fails
    }
  }

  for (const update of activityLog.content.emotionUpdates.filter(
    (update) => Math.abs(update.delta) > 0.6
  )) {
    try {
      const uid = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const characterId = nameToId[update.characterName];
      if (characterId !== undefined) {
        const collection = await vectorDatabaseClient.getOrCreateCollection({
          name: MEMORY_COLLECTION + '_' + characterId,
        });
        await collection.add({
          ids: [uid],
          metadatas: [
            {
              timestamp: activityLog.timestamp,
              type: 'emotion_update',
            },
          ],
          documents: [update.cause],
        });
      }
    } catch (error) {
      console.error(`Error adding emotion update memory for ${update.characterName}:`, error);
      // Continue with other updates even if one fails
    }
  }
}

export async function updateMemoryEntry(
  characterId: number,
  memoryId: string,
  newDocument: string
) {
  try {
    const collection = await vectorDatabaseClient.getOrCreateCollection({
      name: MEMORY_COLLECTION + '_' + characterId,
    });
    await collection.upsert({
      ids: [memoryId],
      documents: [newDocument],
      metadatas: [
        {
          timestamp: Date.now(),
          type: 'updated_memory',
        },
      ],
    });
  } catch (error) {
    console.error(`Error updating memory entry ${memoryId} for character ${characterId}:`, error);
    throw error; // Re-throw to let caller handle the error
  }
}
