<script lang="ts">
  import { UiView } from '../_model';
  import { uiState } from '../_state';
  import Place from './Place.svelte';
  import TimeControls from './TimeControls.svelte';
</script>

<div class="main">
  <TimeControls />
  <div class="scene-container">
    {#if uiState.currentView === UiView.Place}
      <Place />
    {/if}
  </div>
</div>

<style>
  .main {
    position: relative;
  }
</style>
