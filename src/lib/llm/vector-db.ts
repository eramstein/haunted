import { ChromaClient } from 'chromadb';

export const vectorDatabaseClient = new ChromaClient();

export async function resetVectorDatabase() {
  const collections = await vectorDatabaseClient.listCollections();
  collections.forEach(async (c) => {
    await vectorDatabaseClient.deleteCollection({ name: c });
  });
  console.log('Vector database reset');
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
