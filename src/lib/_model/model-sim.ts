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
  index: number;
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
  place: number;
  llm: {
    systemPrompt: string;
    personalityTraits: string[];
    initialMemories: string[];
  };
}

export interface Character extends CharacterBase {
  index: number;
  needs: {
    food: {
      lastMeal: number; // State.time ellapsedTime
    };
    sleep: {
      lastSleep: number; // State.time in minutes
    };
  };
}

export interface Memory {
  summary: string;
  metadata: Record<string, string>;
}

export interface ActionTypeDefinition {
  fn: ActionEffect;
  duration: number;
  description: string;
}

export type ActionEffect = (character: Character, args: any) => void;

export interface Player {
  place: number;
}

export enum ItemType {
  FoodIngredient = 'FoodIngredient',
  Meal = 'Meal',
  Drink = 'Drink',
}

export interface Item {
  id: string;
  type: ItemType;
  description: string;
  ownerId: string;
  locationId: number;
}

// de-normalized indices for fast lookup
export interface ItemIndices {
  byType: Partial<Record<ItemType, string[]>>;
  byOwner: Record<string, string[]>;
  byLocation: Record<number, string[]>;
  byTypeAndOwner: Record<string, string[]>;
}
