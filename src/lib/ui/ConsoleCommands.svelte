<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { consoleCommands } from './_keybinds/console';

  let isVisible = false;
  let inputValue = '';

  function focusInput(node: HTMLInputElement) {
    node.focus();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === '^') {
      event.preventDefault();
      isVisible = !isVisible;
    }
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const command = inputValue.trim();
      if (command in consoleCommands) {
        (consoleCommands as Record<string, () => void>)[command]();
        inputValue = '';
      }
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
</script>

<div class="toggle-input">
  {#if isVisible}
    <input
      type="text"
      bind:value={inputValue}
      placeholder="Console commands..."
      on:keydown={handleInputKeyDown}
      use:focusInput
    />
  {/if}
</div>

<style>
  input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:focus {
    outline: none;
    border-color: #666;
  }
</style>
