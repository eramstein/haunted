import type { Character, Place } from './model-sim';

export type UiState = {
  currentView: UiView;
  simulationSpeed: number;
  isPaused: boolean;
  selectedPlace: Place | null;
  selectedCharacter: Character | null;
};

export enum UiView {
  MansionMap = 'MansionMap',
  Place = 'Place',
}
