import { loadStateFromLocalStorage, saveStateToLocalStorage, gs } from '../../_state';
import { togglePause } from '../../sim/time';

export function handleKeybinds(event: KeyboardEvent) {
  if (event.key === 'F4') {
    event.preventDefault();
    const loadedState = loadStateFromLocalStorage();
    if (loadedState) {
      console.log('State reloaded from localStorage');
    } else {
      console.log('No saved state found');
    }
  } else if (event.key === 'F5') {
    event.preventDefault();
    saveStateToLocalStorage();
    console.log('State saved to localStorage');
  } else if (event.key === ' ') {
    event.preventDefault();
    togglePause();
  }
}
