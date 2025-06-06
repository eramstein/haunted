import { PLACES } from '@/data/world/places';
import { vectorDatabaseClient } from './vector-db';

export async function initWorldMemory() {
  const collection = await vectorDatabaseClient.getOrCreateCollection({
    name: 'world',
  });
  const worldDescriptions: string[] = [];
  PLACES.forEach((place) => {
    const desc = `${place.name} is a place in the world. It is ${place.description}. `;
    worldDescriptions.push(desc);
  });

  await collection.upsert({
    documents: worldDescriptions,
    ids: worldDescriptions.map((_, i) => 'entry ' + i),
  });

  console.log("World's memory initalized");
}

export async function queryWorldsMemory(message: string) {
  const collection = await vectorDatabaseClient.getOrCreateCollection({
    name: 'world',
  });
  const results = await collection.query({
    queryTexts: message,
    nResults: 1,
  });
  // Check if we have results and their distances
  if (!results.documents.length || !results.distances?.[0]) {
    console.log('No memory found');
    return '';
  }
  // ChromaDB returns cosine distances, where:
  // - 0 means perfect similarity
  // - 1 means orthogonal (no similarity)
  // - 2 means opposite
  const distance = results.distances[0]?.[0];
  if (distance > 1.5) {
    console.log('Memory query distance too high:', results, distance);
    return '';
  }
  return 'The following world information is relevant: ' + results.documents[0] + '. ';
}
