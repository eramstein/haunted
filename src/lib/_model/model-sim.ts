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
  activity: Activity | null;
  objective: Objective | null;
  needs: {
    food: {
      lastMeal: number;
    };
    sleep: {
      lastSleep: number;
    };
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
type ActivityTargets = {
  [ActivityType.GoTo]: number; // Place ID
  [ActivityType.Eat]: string; // Item ID
  [ActivityType.Cook]: string[]; // Multiple Item IDs
  [ActivityType.Sleep]: never; // No targets needed
};

export interface Activity<T extends ActivityType = ActivityType> {
  type: T;
  progress: number; // 0-100
  target: ActivityTargets[T];
}

export interface Objective {
  type: ObjectiveType;
}
