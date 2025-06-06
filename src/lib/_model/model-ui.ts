export type UiState = {
  currentView: UiView;
  currentPlace: number;
  simulationSpeed: number;
  isPaused: boolean;
};

export enum UiView {
  MansionMap = 'MansionMap',
  Place = 'Place',
}
