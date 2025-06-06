<script lang="ts">
  import { UiView } from '../_model';
  import { uiState } from '../_state';
  import Place from './Place.svelte';
  import TimeControls from './TimeControls.svelte';
  import ViewControls from './ViewControls.svelte';
  import MansionMap from './MansionMap.svelte';
  import SidePanel from './SidePanel.svelte';
</script>

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
</style>
