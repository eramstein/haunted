<script lang="ts">
  import Main from './lib/ui/Main.svelte';
  import ConsoleCommands from './lib/ui/ConsoleCommands.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { handleKeybinds } from './lib/ui/_keybinds/keybinds';
  import { loadImages } from './lib/ui/_helpers';
  import { loadStateFromLocalStorage } from './lib/_state';

  onMount(() => {
    loadImages();
    window.addEventListener('keydown', handleKeybinds);

    // Load saved game state if it exists
    const loadedState = loadStateFromLocalStorage();
    if (loadedState) {
      console.log('Game state loaded from localStorage');
    }
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeybinds);
  });
</script>

<Main />
<ConsoleCommands />
