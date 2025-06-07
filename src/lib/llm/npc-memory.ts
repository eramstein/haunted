import { vectorDatabaseClient } from './vector-db';
import { queryWorldsMemory } from './world';
import { gs } from '../_state';
import type { Memory } from '../_model';

export async function initNpcMemory() {
  gs.characters.forEach(async (character) => {
    const collection = await vectorDatabaseClient.getOrCreateCollection({
      name: character.id,
    });
    await collection.upsert({
      documents: character.llm.initialMemories,
      metadatas: character.llm.initialMemories.map(() => ({
        memory_type: 'foundation_memory',
      })),
      ids: character.llm.initialMemories.map((_, i) => character.id + ' memory ' + i),
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

  const worldResults = await queryWorldsMemory(message);
  if (worldResults) {
    response += ' ' + worldResults + '. ';
  }
  return response;
}

export async function addNpcMemory(characterKey: string, memory: Memory) {
  const uid = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const collection = await vectorDatabaseClient.getOrCreateCollection({
    name: characterKey,
  });
  collection.add({
    ids: [uid],
    metadatas: [memory.metadata],
    documents: [memory.summary],
  });
}
