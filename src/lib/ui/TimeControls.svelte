<script lang="ts">
  import { getTime, togglePause, setSpeed } from '../sim/time';
  import { uiState } from '../_state/state-ui.svelte';

  let speed = $derived(uiState.simulationSpeed);

  const speedOptions = [
    { label: '1x', value: 1 },
    { label: '5x', value: 5 },
    { label: '10x', value: 10 },
  ];

  $effect(() => {
    setSpeed(speed);
  });

  function setNormalSpeed() {
    speed = 1;
  }

  function setFastSpeed() {
    speed = 5;
  }
</script>

<div class="controls">
  <div class="clock">
    {getTime().toLocaleString().slice(0, 16)}
  </div>

  <div class="buttons">
    <button onclick={togglePause} class="pause-btn">
      {uiState.isPaused ? '▶' : '⏸'}
    </button>

    <div class="speed-control">
      {#each speedOptions as option}
        <button
          class="speed-btn"
          class:active={speed === option.value}
          onclick={() => setSpeed(option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .controls {
    position: absolute;
    background-color: #eee;
    border: 1px solid #ccc;
    padding: 8px;
    top: 10px;
    left: 10px;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .clock {
    text-align: center;
    font-weight: bold;
  }

  .buttons {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .buttons button {
    width: 40px;
  }

  .pause-btn {
    padding: 4px 8px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .speed-control {
    display: flex;
    gap: 8px;
  }

  .speed-btn {
    padding: 4px 8px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .speed-btn.active {
    background: #e0e0e0;
    border-color: #999;
  }
</style>
