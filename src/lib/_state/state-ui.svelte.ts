import { UiView, type UiState } from '../_model/model-ui';

export const uiState: UiState = $state({
  currentView: UiView.MansionMap,
  currentPlace: 0,
  simulationSpeed: 1, // 1 second IRL = 1 minute in sim
  isPaused: true,
});
