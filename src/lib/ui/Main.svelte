<script lang="ts">
  import { UiView } from '../_model';
  import { uiState, gs } from '../_state';
  import Place from './Place.svelte';
  import TimeControls from './TimeControls.svelte';
  import ViewControls from './ViewControls.svelte';
  import MansionMap from './MansionMap.svelte';
  import SidePanel from './SidePanel.svelte';
  import UserPromptModal from './UserPromptModal.svelte';
  import Chat from './Chat.svelte';
</script>

<UserPromptModal />

<div class="main">
  <div class="controls">
    <TimeControls />
    <ViewControls />
  </div>
  <div class="scene-container">
    {#if uiState.currentView === UiView.Place}
      <Place />
    {/if}
    {#if uiState.currentView === UiView.MansionMap}
      <MansionMap />
    {/if}
  </div>
  <SidePanel />
  {#if gs.chat}
    <Chat />
  {/if}
</div>

<style>
  .main {
    position: relative;
  }

  .controls {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 100;
  }

  /* Chat positioning */
  :global(.chat-container) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 95vw;
    max-width: 1200px;
    height: 95vh;
    max-height: 900px;
    z-index: 2000;
  }
</style>
