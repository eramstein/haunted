import type { Character, Place, Item } from './model-sim';

export type UiState = {
  currentView: UiView;
  simulationSpeed: number;
  isPaused: boolean;
  selectedPlace: Place | null;
  selectedCharacter: Character | null;
  selectedItem: Item | null;
};

export enum UiView {
  MansionMap = 'MansionMap',
  Place = 'Place',
}
