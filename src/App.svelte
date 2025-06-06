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
    const loadedState = loadStateFromLocalStorage();
    if (loadedState) {
      console.log('Game state loaded from localStorage');
    }

    // Start the simulation loop
    let lastTime = performance.now();
    function simulationLoop(currentTime: number) {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      passTime(deltaTime);
      requestAnimationFrame(simulationLoop);
    }
    requestAnimationFrame(simulationLoop);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeybinds);
  });
</script>

<Main />
<ConsoleCommands />
