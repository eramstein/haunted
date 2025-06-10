import type { ActivityType, ItemType, ObjectiveType } from './model-sim.enums';

export interface State {
  time: Time;
  places: Place[];
  characters: Character[];
  player: Player;
  items: Record<string, Item>;
  itemIndices: ItemIndices;
}

export interface Time {
  startDate: Date;
  ellapsedTime: number; // in minutes since startDate
  lightLevel: number; // 0-1
  dateString: string;
}

export interface Place {
  id: number;
  name: string;
  description: string;
  image?: string;
  position: Position;
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CharacterBase {
  name: string;
  llm: {
    systemPrompt: string;
    personalityTraits: string[];
    initialMemories: string[];
  };
}

export interface Character extends CharacterBase {
  id: number;
  place: number;
  activities: Activity[]; // character will do these in order
  objective: Objective | null;
  needs: {
    food: number;
    sleep: number;
    fun: number;
    social: number;
  };
}

export interface Memory {
  summary: string;
  metadata: Record<string, string>;
}

export interface Player {
  place: number;
}

export interface Item {
  id: string;
  type: ItemType;
  description: string;
  owner: number;
  location: number;
}

// de-normalized indices for fast lookup
export interface ItemIndices {
  byType: Partial<Record<ItemType, string[]>>;
  byOwnerId: Record<number, string[]>;
  byLocationId: Record<number, string[]>;
  byTypeAndOwner: Record<string, string[]>;
}

// Define specific target types for each activity
export type ActivityTargets = {
  [ActivityType.GoTo]: number; // Place ID
  [ActivityType.Eat]: string; // Item ID
  [ActivityType.Cook]: string[]; // Multiple Item IDs
  [ActivityType.Sleep]: null; // No targets needed
  [ActivityType.Play]: number; // Place ID
  [ActivityType.Chat]: number; // Place ID
};

export interface Activity<T extends ActivityType = ActivityType> {
  type: T;
  progress: number; // 0-100
  target: ActivityTargets[T];
  participants?: number[]; // for group activities, character ids
}

export interface Objective {
  type: ObjectiveType;
}

export interface GroupActivityLog {
  id: string;
  activityType: ActivityType;
  participants: number[];
  location: number;
  timestamp: number; // in minutes since startDate
  content: string;
}
