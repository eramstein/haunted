import type {
  ActivityType,
  EmotionType,
  ItemType,
  ObjectiveType,
  RelationshipFeeling,
  RelationshipStatus,
} from './model-sim.enums';

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
  outside?: boolean;
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
    bio: string;
    traits: string[];
  };
}

export interface CharacterDefinition extends CharacterBase {
  initialMemories: string[];
  emotionalProfile: Record<EmotionType, Emotion>;
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
  relationships: Record<number, Relationship>; // key is character id
  emotions: {
    mood: number; // 0-100 - aggregated mood, computed from all emotion types
    dominantEmotion: DominantEmotion | null; // computed from all emotion types
    byType: Record<EmotionType, Emotion>;
  };
  money: number; // dollars / euros
}

export interface Relationship {
  status: RelationshipStatus;
  feelings: Partial<Record<RelationshipFeeling, number>>; // -100 to 100
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
  [ActivityType.Buy]: ItemType;
  [ActivityType.Work]: number; // Place ID
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
  content: GroupActivitySummary; // initially empty, then filled with LLM chat content when user looks at it (it's a Schrödinger's chat, hohoho)
}

export interface GroupActivitySummary {
  transcript: string;
  summary: string;
  relationUpdates: RelationshipUpdate[];
  emotionUpdates: EmotionUpdate[];
}

export interface RelationshipUpdate {
  from: string;
  toward: string;
  feeling: RelationshipFeeling;
  delta: number;
  reason: string;
}

export interface Emotion {
  type: EmotionType;
  currentIntensity: number; // 0-100 - current intensity of the emotion, changes fast depending on events
  baselineIntensity: number; // 0-100 - character's trait, e.g. some people are more joyful than others. changes slowly over time
  decayRate: number; // how fast current intensity goes back to baseline
  volatility: number; // how fast current intensity goes up when triggered by an event
}

export interface EmotionUpdate {
  characterName: string;
  type: EmotionType;
  delta: number;
  reason: string;
  subtype?: string; // for example, joy could have 'amusement', 'contentment', 'pride', 'relief'
}

export interface CompositeEmotionType {
  name: string;
  components: [EmotionType, EmotionType];
}

export interface DominantEmotion {
  name: string; // this can be a base emotion, or a composite one
  intensity: number;
}
