import Dexie, { type Table } from 'dexie';
import type { ActivityType } from '../_model/model-sim.enums';
import type { GroupActivityLog, GroupActivitySummary } from '../_model';

// Initialize Dexie database
const db = new Dexie('MansionSimDB');

// Define schema with numeric timestamp
db.version(1).stores({
  chats: 'id,timestamp,[participants+timestamp]', // Indexes for querying
});

// Export the chats table
const chats: Table<GroupActivityLog> = db.table('chats');

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
  content: GroupActivitySummary
): Promise<string | undefined> {
  try {
    const count = await chats.where('id').equals(id).modify({ content });
    return count > 0 ? id : undefined;
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
}
