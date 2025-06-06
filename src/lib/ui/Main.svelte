<script lang="ts">
  import { UiView } from '../_model';
  import { uiState } from '../_state';
  import Place from './Place.svelte';
</script>

<div class="main">
  <div class="scene-container">
    {#if uiState.currentView === UiView.Place}
      <Place />
    {/if}
  </div>
</div>

<style>
</style>
