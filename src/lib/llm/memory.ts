// query both vector db and index db and merge results

import type { Character, Place } from '../_model';
import { ActivityType } from '../_model/model-sim.enums';
import { getChatsForCharacters } from './index-db';
import { queryNpcMemory } from './memory-vectors';

// combines structured memories from index db and fuzzy ones from vector db
interface MergedMemory {
  id: string;
  summary: string;
  participants: number[];
  semanticScore?: number;
  activityType?: ActivityType;
  timestamp?: number;
  location?: number;
  relationUpdates?: string[];
}

// returns a text describing relevant memories to be added to the chat system prompt
export async function getSystemPromptMemories(
  timestamp: number,
  characters: Character[],
  place: Place,
  activityType: ActivityType,
  message: string = ''
) {
  const characterIds = characters.map((c) => c.id);
  const characterNames = characters.map((c) => c.name);

  const vectorDbMemories = await queryNpcMemory(
    characterIds,
    message || `Upcoming ${activityType} with ${characterNames.join(', ')} at ${place.name}`
  );
  console.log('vectorDbMemories', vectorDbMemories);

  const indexDbMemories = await getChatsForCharacters(characterIds, 0, timestamp);

  // Create a Map to store unique memories by ID
  const uniqueMemories = new Map();

  // Add vector DB memories first
  vectorDbMemories.forEach((memory) => {
    if (memory.id) {
      uniqueMemories.set(memory.id, {
        id: memory.id,
        summary: memory.document,
        semanticScore: memory.score,
        participants: memory.participants,
      });
    }
  });

  // Add or merge index DB memories
  indexDbMemories.forEach((memory) => {
    const existing = uniqueMemories.get(memory.id);
    const newFields = {
      activityType: memory.activityType,
      timestamp: memory.timestamp,
      participants: memory.participants,
      location: memory.location,
      relationUpdates: memory.content.relationUpdates,
      summary: memory.content.summary,
    };
    if (existing) {
      Object.assign(existing, newFields);
    } else {
      uniqueMemories.set(memory.id, {
        id: memory.id,
        ...newFields,
      });
    }
  });

  // Convert Map to array
  const mergedMemories = Array.from(uniqueMemories.values());

  // Add a score to each memory
  const scoredMemories = mergedMemories
    .map((memory) => ({
      summary: memory.summary,
      score: scoreMemory(memory, {
        timestamp,
        characters,
        place,
        activityType,
      }),
    }))
    .filter((m) => m.score > 0.5)
    .filter((m) => m.summary.length > 0);

  if (scoredMemories.length === 0) {
    return '';
  }

  return scoredMemories.sort((a, b) => b.score - a.score)[0].summary;
}

function scoreMemory(
  memory: MergedMemory,
  context: {
    timestamp: number;
    characters: Character[];
    place: Place;
    activityType: ActivityType;
  }
) {
  const weights = {
    time: 0.25,
    characters: 0.25,
    location: 0.2,
    activity: 0.2,
    semantic: 0.1,
  };

  const time = memory.timestamp ? timeScore(memory.timestamp, context.timestamp) : 0;
  const chars = memory.participants ? characterScore(memory.participants, context.characters) : 0;
  const loc = locationScore(memory.location, context.place.id);
  const act = activityScore(memory.activityType, context.activityType);
  const sem = semanticScore(memory.semanticScore);

  return (
    weights.time * time +
    weights.characters * chars +
    weights.location * loc +
    weights.activity * act +
    weights.semantic * sem
  );
}

// score between ~1 (recent) and 0 (old)
function timeScore(memoryTime: number, now: number): number {
  const decay = 60 * 24 * 30; // 30 days
  const age = Math.abs(now - memoryTime);
  return Math.exp(-age / decay);
}

// score between ~1 (all participants overlap) and 0 (none overlap)
function characterScore(memoryParticipants: number[], currentCharacters: Character[]): number {
  const ids = currentCharacters.map((c) => c.id);
  const overlap = memoryParticipants.filter((id) => ids.includes(id)).length;
  return overlap / Math.max(ids.length, memoryParticipants.length);
}

function locationScore(memoryLoc: number | undefined, currentLoc: number): number {
  return memoryLoc === currentLoc ? 1 : 0;
}

function activityScore(memType: ActivityType | undefined, currentType: ActivityType): number {
  return memType === currentType ? 1 : 0;
}

// convert cosine distance to similarity-style score
function semanticScore(raw?: number): number {
  if (raw === undefined) return 0;
  return 1 - Math.min(Math.max(raw, 0), 1);
}
