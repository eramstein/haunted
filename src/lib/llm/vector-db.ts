import { ChromaClient } from 'chromadb';
import { MEMORY_COLLECTION, TOOLS_COLLECTION } from './config';
import { NPCS } from '@/data/npcs';
import { TOOLS_VECTORS } from './tools-vectors';

export const vectorDatabaseClient = new ChromaClient();

export async function initChromaCollections() {
  const memoriesCollection = await vectorDatabaseClient.getOrCreateCollection({
    name: MEMORY_COLLECTION,
  });
  NPCS.forEach(async (character, index) => {
    await memoriesCollection.upsert({
      documents: character.initialMemories,
      metadatas: character.initialMemories.map(() => ({
        type: 'npc_lore',
        characters: '|' + String(index) + '|',
      })),
      ids: character.initialMemories.map((_, i) => index + ' lore ' + i),
    });
  });
  console.log('NPCs memory initialized');
  const toolsCollection = await vectorDatabaseClient.getOrCreateCollection({
    name: TOOLS_COLLECTION,
  });
  TOOLS_VECTORS.forEach(async (tool) => {
    await toolsCollection.upsert({
      documents: tool.descriptions,
      metadatas: Array(tool.descriptions.length).fill({ type: 'tool', tool: tool.tool }),
      ids: tool.descriptions.map((_, i) => tool.tool + ' ' + i),
    });
  });
  console.log('Tool vectors initialized');
}

export async function resetVectorDatabase(reinitialize = true) {
  await vectorDatabaseClient.deleteCollection({ name: MEMORY_COLLECTION });
  await vectorDatabaseClient.createCollection({ name: MEMORY_COLLECTION });
  console.log('Vector database collections emptied');

  if (reinitialize) {
    await initChromaCollections();
  }
}

export async function listCollections() {
  const collections = await vectorDatabaseClient.listCollections();
  collections.forEach(async (collectionName) => {
    await vectorDatabaseClient.getOrCreateCollection({
      name: collectionName,
    });
  });
  console.log(collections);
  return collections;
}

export async function listCollectionsWithContent() {
  const collections = await vectorDatabaseClient.listCollections();
  const collectionsWithContent = await Promise.all(
    collections.map(async (collectionName) => {
      const collection = await vectorDatabaseClient.getOrCreateCollection({
        name: collectionName,
      });
      const count = await collection.count();

      // Get the last 5 items (or fewer if collection has less)
      const limit = Math.min(5, count);
      const lastItems =
        count > 0
          ? await collection.get({
              limit,
              offset: Math.max(0, count - limit),
            })
          : null;

      return {
        name: collectionName,
        count,
        lastItems: lastItems
          ? {
              ids: lastItems.ids,
              documents: lastItems.documents,
              metadatas: lastItems.metadatas,
            }
          : null,
      };
    })
  );
  console.log('Collections with content:', collectionsWithContent);
  return collectionsWithContent;
}
