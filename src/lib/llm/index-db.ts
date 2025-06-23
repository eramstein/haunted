import Dexie, { type Table } from 'dexie';
import { ActivityType, RelationshipFeeling, EmotionType } from '../_model/model-sim.enums';
import type { GroupActivityLog, GroupActivitySummary, RelationshipSummaryUpdate } from '../_model';

// Initialize Dexie database
const db = new Dexie('MansionSimDB');

// Database-specific interface that includes the id field
interface RelationshipSummaryUpdateDB extends RelationshipSummaryUpdate {
  id: string;
}

// Define schema with numeric timestamp
db.version(1).stores({
  chats: 'id,timestamp,activityType,[participants+timestamp]', // Indexes for querying
  relationshipArcs: 'id,from,toward', // Indexes for querying
});

// Export the chats table
const chats: Table<GroupActivityLog> = db.table('chats');

// Export the relationshipArcs table
const relationshipArcs: Table<RelationshipSummaryUpdateDB> = db.table('relationshipArcs');

// Save a chat to the database
export async function saveChat(
  id: string,
  timestamp: number,
  participants: number[],
  location: number,
  activityType: ActivityType,
  content: GroupActivitySummary = {
    transcript: '',
    summary: '',
    relationUpdates: [],
    emotionUpdates: [],
  }
): Promise<number> {
  try {
    return await chats.put({
      id,
      timestamp,
      participants,
      location,
      activityType,
      content,
    });
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
}

// Update only the content of an existing chat
export async function updateChatContent(
  id: string,
  content: GroupActivitySummary,
  metadata: {
    timestamp: number;
    participants: number[];
    location: number;
    activityType: ActivityType;
  } = {
    timestamp: 0,
    participants: [],
    location: 0,
    activityType: ActivityType.Chat,
  }
): Promise<string> {
  console.log('updateChatContent', id, content, metadata);
  try {
    // Create deep copies to ensure serializability
    const serializableContent: GroupActivitySummary = {
      transcript: content.transcript || '',
      summary: content.summary || '',
      relationUpdates: Array.isArray(content.relationUpdates)
        ? content.relationUpdates.map((update) => ({
            from: String(update.from),
            toward: String(update.toward),
            feeling: update.feeling as RelationshipFeeling,
            delta: Number(update.delta),
            cause: String(update.cause),
          }))
        : [],
      emotionUpdates: Array.isArray(content.emotionUpdates)
        ? content.emotionUpdates.map((update) => ({
            characterName: String(update.characterName),
            type: update.type as EmotionType,
            delta: Number(update.delta),
            cause: String(update.cause),
            subtype: update.subtype ? String(update.subtype) : undefined,
          }))
        : [],
    };

    const serializableMetadata = {
      timestamp: Number(metadata.timestamp),
      participants: Array.isArray(metadata.participants)
        ? metadata.participants.map((p) => Number(p))
        : [],
      location: Number(metadata.location),
      activityType: metadata.activityType as ActivityType,
    };

    // First try to get the existing chat to preserve other fields
    const existingChat = await chats.where('id').equals(id).first();

    if (existingChat) {
      // Update existing chat
      await chats.where('id').equals(id).modify({ content: serializableContent });
    } else {
      // Create new chat with minimal required fields
      await chats.put({
        id,
        content: serializableContent,
        ...serializableMetadata,
      });
    }

    return id;
  } catch (error) {
    console.error('Error updating chat content:', error);
    throw error;
  }
}

// Fetch chats for a character within a time range
export async function getChatsForCharacters(
  characters: number[],
  startTime: number,
  endTime: number
): Promise<GroupActivityLog[]> {
  try {
    return await chats
      .where('timestamp')
      .between(startTime, endTime, true, true)
      .filter((chat) => chat.participants.some((participant) => characters.includes(participant)))
      .toArray();
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
}

// Fetch a single chat by ID
export async function getChatById(id: number): Promise<GroupActivityLog | undefined> {
  try {
    return await chats.get(id);
  } catch (error) {
    console.error('Error fetching chat by ID:', error);
    throw error;
  }
}

// Delete chats older than a given timestamp
export async function deleteOldChats(olderThan: number): Promise<void> {
  try {
    await chats.where('timestamp').below(olderThan).delete();
  } catch (error) {
    console.error('Error deleting old chats:', error);
    throw error;
  }
}

export async function resetIndexDB(): Promise<void> {
  await chats.clear();
  await relationshipArcs.clear();
}

// Fetch chats for specific activity type and participants
export async function getChatsByActivityType(
  activityType: ActivityType,
  participants: number[],
  startTime: number,
  endTime: number
): Promise<GroupActivityLog[]> {
  try {
    return await chats
      .where('activityType')
      .equals(activityType)
      .filter((chat) => {
        // Check if all required participants are in the chat
        return participants.every((participant) => chat.participants.includes(participant));
      })
      .filter((chat) => {
        // Filter by time range
        return chat.timestamp >= startTime && chat.timestamp <= endTime;
      })
      .toArray();
  } catch (error) {
    console.error('Error fetching chats by activity type:', error);
    throw error;
  }
}

// Save a relationship summary update to the database
export async function saveRelationshipSummaryUpdate(
  id: string,
  from: number,
  toward: number,
  description: string,
  timestamp: number
): Promise<number> {
  try {
    return await relationshipArcs.put({
      id,
      from,
      toward,
      description,
      timestamp,
    });
  } catch (error) {
    console.error('Error saving relationship summary update:', error);
    throw error;
  }
}

// Fetch relationship summary updates for a character pair within a time range
export async function getRelationshipSummaryUpdates(
  from: number,
  toward: number,
  startTime: number,
  endTime: number
): Promise<RelationshipSummaryUpdate[]> {
  try {
    return await relationshipArcs
      .where('from')
      .equals(from)
      .and((arc) => arc.toward === toward)
      .filter((arc) => arc.timestamp >= startTime && arc.timestamp <= endTime)
      .toArray();
  } catch (error) {
    console.error('Error fetching relationship summary updates:', error);
    throw error;
  }
}

// Delete relationship summary updates older than a given timestamp
export async function deleteOldRelationshipSummaryUpdates(olderThan: number): Promise<void> {
  try {
    await relationshipArcs.where('timestamp').below(olderThan).delete();
  } catch (error) {
    console.error('Error deleting old relationship summary updates:', error);
    throw error;
  }
}
