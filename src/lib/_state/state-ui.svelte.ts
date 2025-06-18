import { UiView, type UiState, type UserPrompt } from '../_model/model-ui';

export const uiState: UiState = $state({
  currentView: UiView.MansionMap,
  simulationSpeed: 1, // 1 second IRL = 1 minute in sim
  isPaused: true,
  selectedPlace: null,
  selectedCharacter: null,
  selectedItem: null,
  userPrompt: null,
  userPromptFeedback: '',
});

export function promptUser(prompt: UserPrompt) {
  uiState.isPaused = true;
  uiState.userPrompt = prompt;
}
