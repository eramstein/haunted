export type UiState = {
  currentView: UiView;
  currentPlace: number;
};

export enum UiView {
  MansionMap = 'MansionMap',
  Place = 'Place',
}
