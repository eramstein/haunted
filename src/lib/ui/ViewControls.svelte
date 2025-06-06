<script lang="ts">
  import { UiView } from '../_model';
  import { uiState } from '../_state';

  const views = [
    { id: UiView.MansionMap, label: 'Mansion Map' },
    { id: UiView.Place, label: 'Place' },
  ];
</script>

<div class="view-controls">
  {#each views as view}
    <button
      class="view-tab"
      class:active={uiState.currentView === view.id}
      on:click={() => (uiState.currentView = view.id)}
    >
      {view.label}
    </button>
  {/each}
</div>

<style>
  .view-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 0.5rem;
  }

  .view-tab {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    background: transparent;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-tab:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .view-tab.active {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
