import { vectorDatabaseClient } from './vector-db';
import { gs } from '../_state';
import type { GroupActivityLog } from '../_model/model-sim';
import { MEMORY_COLLECTION } from './config';

export async function initChromaCollection() {
  const collection = await vectorDatabaseClient.getOrCreateCollection({
    name: MEMORY_COLLECTION,
  });
  gs.characters.forEach(async (character) => {
    await collection.upsert({
      documents: character.llm.initialMemories,
      metadatas: character.llm.initialMemories.map(() => ({
        type: 'npc_lore',
        characters: '|' + String(character.id) + '|',
      })),
      ids: character.llm.initialMemories.map((_, i) => character.id + ' lore ' + i),
    });
  });
  console.log('NPCs memory initalized');
}

export async function queryNpcMemory(characterKey: string, message: string) {
  // Query character's personal memories
  const characterCollection = await vectorDatabaseClient.getOrCreateCollection({
    name: characterKey,
  });
  const characterResults = await characterCollection.query({
    queryTexts: message,
    nResults: 3,
  });

  const documents = characterResults.documents?.[0] || [];
  const scores = characterResults.distances?.[0] || documents.map(() => 2);
  const metadatas = characterResults.metadatas?.[0] || documents.map(() => ({}));

  let response = '';
  let additionalHints = '';

  documents.forEach((_, index) => {
    const metadata = metadatas[index];
    if (metadata?.memory_importance === 'high') {
      scores[index] -= 0.5;
    }
    if (metadata?.memory_importance === 'low') {
      scores[index] += 0.2;
    }
  });

  let lowestScoreIndex = 0;
  let lowestScore = 0;

  scores.forEach((score, index) => {
    if (score < lowestScore) {
      lowestScore = score;
      lowestScoreIndex = index;
    }
  });

  if (scores[lowestScoreIndex] < 1.5) {
    const sentiment = metadatas[lowestScoreIndex]?.sentiment;
    if (sentiment) {
      additionalHints = 'sentiment expressed: ' + sentiment + ' ';
    }
    response += documents[lowestScoreIndex] + ' ' + additionalHints;
  }

  return response;
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
