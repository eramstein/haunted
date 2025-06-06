<script lang="ts">
  import { uiState } from '../_state';
  import CharacterPanel from './CharacterPanel.svelte';
  import PlacePanel from './PlacePanel.svelte';

  let isVisible = $derived(!!uiState.selectedPlace || !!uiState.selectedCharacter);

  function closePanel() {
    uiState.selectedPlace = null;
    uiState.selectedCharacter = null;
  }
</script>

{#if isVisible}
  <div class="side-panel" class:visible={isVisible}>
    <button class="close-button" onclick={closePanel}>×</button>
    {#if uiState.selectedPlace}
      <PlacePanel place={uiState.selectedPlace} />
    {:else if uiState.selectedCharacter}
      <CharacterPanel character={uiState.selectedCharacter} />
    {/if}
  </div>
{/if}

<style>
  .side-panel {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 1rem 2rem;
    transition: right 0.3s ease-in-out;
    z-index: 1000;
    overflow-y: auto;
  }

  .side-panel.visible {
    right: 0;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2rem;
    height: 2rem;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.5rem;
    line-height: 1;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
