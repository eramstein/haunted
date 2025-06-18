import type { Character, Place, Item } from './model-sim';

export type UiState = {
  currentView: UiView;
  simulationSpeed: number;
  isPaused: boolean;
  selectedPlace: Place | null;
  selectedCharacter: Character | null;
  selectedItem: Item | null;
  userPrompt: UserPrompt | null;
  userPromptFeedback: string;
};

export interface UserPrompt {
  title: string;
  options: {
    label: string;
    action: () => void;
  }[];
}

export enum UiView {
  MansionMap = 'MansionMap',
  Place = 'Place',
}
