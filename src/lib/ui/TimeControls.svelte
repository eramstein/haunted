<script lang="ts">
  import { togglePause, setSpeed } from '../sim/time';
  import { uiState } from '../_state/state-ui.svelte';
  import { formatGameDate } from './_helpers/date.svelte';

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
    {formatGameDate()}
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
    background: rgba(0, 0, 0, 0.7);
    border-radius: 0.5rem;
    padding: 0 1rem 0.5rem 0.5rem;
    flex-direction: column;
    display: flex;
    color: #fff;
  }

  .clock {
    text-align: center;
    font-weight: bold;
    padding: 0.5rem 0;
  }

  .buttons {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .buttons button {
    width: 2rem;
    text-align: center;
  }

  .pause-btn {
    padding: 0.5rem;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    color: #fff;
    transition: all 0.2s ease;
  }

  .pause-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .speed-control {
    display: flex;
    gap: 0.5rem;
  }

  .speed-btn {
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    color: #fff;
    transition: all 0.2s ease;
  }

  .speed-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .speed-btn.active {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
