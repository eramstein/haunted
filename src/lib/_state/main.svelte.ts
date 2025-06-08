import { type State } from '../_model/model-sim';
import { createNewSimState } from './initialize';
import { initialState, placesMap } from './state-sim.svelte';

const LOCAL_STORAGE_KEY = 'hauntedMansionState';

export const gs: State = $state(initialState);

export const saveStateToLocalStorage = (): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gs));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

export const loadStateFromLocalStorage = (): State | null => {
  try {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedState) return createNewSimState();

    const parsedState: State = JSON.parse(savedState);

    // Restore startDate
    parsedState.time.startDate = new Date(parsedState.time.startDate);

    // Update the current state with the loaded data in a way that triggers reactivity
    Object.assign(gs, parsedState);

    // Ensure placesMap stays in sync with loaded places
    placesMap.clear();
    gs.places.forEach((place) => {
      placesMap.set(place.id, place);
    });

    return gs;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
};
