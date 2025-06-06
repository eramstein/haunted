import { loadStateFromLocalStorage, saveStateToLocalStorage, gs } from '../../_state';

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
  }
}
