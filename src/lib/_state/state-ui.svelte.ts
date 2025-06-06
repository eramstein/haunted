import { UiView, type UiState } from '../_model/model-ui';

export const uiState: UiState = $state({
  currentView: UiView.MansionMap,
  simulationSpeed: 1, // 1 second IRL = 1 minute in sim
  isPaused: true,
  selectedPlace: null,
  selectedCharacter: null,
});
