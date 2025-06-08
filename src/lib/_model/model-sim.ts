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
}

export interface PlaceBase {
  name: string;
  description: string;
  image?: string;
  position: Position;
}

export interface Place extends PlaceBase {
  id: string;
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CharacterBase {
  id: string;
  name: string;
  place: string;
  llm: {
    systemPrompt: string;
    personalityTraits: string[];
    initialMemories: string[];
  };
}

export interface Character extends CharacterBase {
  needs: {
    food: {
      lastMeal: number; // State.time ellapsedTime
    };
    sleep: {
      lastSleep: number; // State.time in minutes
    };
  };
  activity: Activity | null; // what the character is doing (e.g. cooking)
  objective: Objective | null; // what the character is currently trying to achieve (e.g. have a meal) -> sets activity
}

export interface Memory {
  summary: string;
  metadata: Record<string, string>;
}

export interface Player {
  place: string;
}

export interface Item {
  id: string;
  type: ItemType;
  description: string;
  ownerId: string;
  locationId: string;
}

// de-normalized indices for fast lookup
export interface ItemIndices {
  byType: Partial<Record<ItemType, string[]>>;
  byOwner: Record<string, string[]>;
  byLocation: Record<string, string[]>;
  byTypeAndOwner: Record<string, string[]>;
}

export interface Activity {
  type: ActivityType;
  progress: number;
  targetId: string | null; // id of the target place or item
}

export interface Objective {
  type: ObjectiveType;
}
