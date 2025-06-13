<script lang="ts">
  import Main from './lib/ui/Main.svelte';
  import ConsoleCommands from './lib/ui/ConsoleCommands.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { handleKeybinds } from './lib/ui/_keybinds/keybinds';
  import { loadImages } from './lib/ui/_helpers';
  import { loadStateFromLocalStorage } from './lib/_state';
  import { passTime } from './lib/sim';

  onMount(() => {
    loadImages();
    window.addEventListener('keydown', handleKeybinds);

    // Load saved game state if it exists
    loadStateFromLocalStorage();

    // Start the simulation loop with setInterval
    // Check every 100ms for time progression
    const simulationInterval = setInterval(() => {
      passTime(0.1); // Pass 100ms worth of time
    }, 100);

    onDestroy(() => {
      clearInterval(simulationInterval);
    });
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeybinds);
  });
</script>

<Main />
<ConsoleCommands />
