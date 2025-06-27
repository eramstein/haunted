import { ChromaClient } from 'chromadb';
import {
  MEMORY_COLLECTION,
  TOOLS_COLLECTION,
  VECTOR_OPINION,
  VECTOR_PUBLIC_NPC_INFO,
} from './config';
import { NPCS } from '@/data/npcs';
import { TOOLS_VECTORS } from './tools-vectors';

export const vectorDatabaseClient = new ChromaClient();

// Helper function to trim line breaks from documents
function trimDocuments(documents: string[]): string[] {
  return documents.map((doc) => doc.trim());
}

export async function initChromaCollections() {
  // create one memories collection for each character
  NPCS.forEach(async (character, index) => {
    const memoriesCollection = await vectorDatabaseClient.getOrCreateCollection({
      name: MEMORY_COLLECTION + '_' + index,
    });
    const otherNpcs = NPCS.map((npc, i) => ({ ...npc, id: i })).filter((npc) => npc.id !== index);
    // personal memories
    await memoriesCollection.upsert({
      documents: trimDocuments(character.initialMemories),
      metadatas: character.initialMemories.map(() => ({
        type: 'npc_lore',
      })),
      ids: character.initialMemories.map((_, i) => 'lore_' + i),
    });
    // public knowledge
    await memoriesCollection.upsert({
      documents: trimDocuments(otherNpcs.map((npc) => npc.name + ' is ' + npc.llm.bio)),
      metadatas: otherNpcs.map((c) => ({
        id: VECTOR_PUBLIC_NPC_INFO + c.id,
        type: 'npc_common_knowledge',
      })),
      ids: otherNpcs.map((c) => VECTOR_PUBLIC_NPC_INFO + c.id),
    });
    // initial opinions of other NPCs
    await memoriesCollection.upsert({
      documents: trimDocuments(otherNpcs.map((npc) => npc.name + ' is living in the same house.')),
      metadatas: otherNpcs.map((c) => ({
        id: VECTOR_OPINION + c.id,
        type: 'npc_opinion',
      })),
      ids: otherNpcs.map((c) => VECTOR_OPINION + c.id),
    });
  });
  console.log('NPCs memory initialized');
  const toolsCollection = await vectorDatabaseClient.getOrCreateCollection({
    name: TOOLS_COLLECTION,
  });
  TOOLS_VECTORS.forEach(async (tool) => {
    await toolsCollection.upsert({
      documents: trimDocuments(tool.descriptions),
      metadatas: Array(tool.descriptions.length).fill({ type: 'tool', tool: tool.tool }),
      ids: tool.descriptions.map((_, i) => tool.tool + ' ' + i),
    });
  });
  console.log('Tool vectors initialized');
}

export async function resetVectorDatabase(reinitialize = true) {
  const collections = await vectorDatabaseClient.listCollections();
  for (const collectionName of collections) {
    await vectorDatabaseClient.deleteCollection({ name: collectionName });
  }
  console.log('All vector database collections emptied');
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
