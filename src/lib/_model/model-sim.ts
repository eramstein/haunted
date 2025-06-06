import type { ActionType } from '../_config';

export interface State {
  time: Time;
  places: Place[];
  characters: Character[];
  player: Player;
}

export interface Time {
  startDate: Date;
  ellapsedTime: number;
}

export interface Place {
  index: number;
  name: string;
  description: string;
  image?: string;
}

export interface Character {
  index: number;
  key: string;
  name: string;
  place: number;
  llm: {
    systemPrompt: string;
    personalityTraits: string[];
    initialMemories: string[];
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
