<script lang="ts">
  import type { Character } from '../_model';
  import { gs } from '../_state';
  import { formatMinutes } from './_helpers/date.svelte';
  import { getCharacterImage } from './_helpers/images.svelte';

  let props = $props<{
    character: Character;
  }>();
</script>

<div class="character-panel">
  <h2>{props.character.name}</h2>
  <div class="character-details">
    <div
      class="character-portrait"
      style="background-image: url({getCharacterImage(props.character.id)})"
    ></div>
    <div class="detail-item">
      <span class="label">Location:</span>
      <span class="value">{gs.places[props.character.place].name}</span>
    </div>
    <div class="detail-item">
      <span class="label">Food:</span>
      <span class="value">
        {formatMinutes(gs.time.ellapsedTime - props.character.needs.food.lastMeal)}
      </span>
    </div>
    <div class="detail-item">
      <span class="label">Sleep:</span>
      <span class="value">
        {formatMinutes(gs.time.ellapsedTime - props.character.needs.sleep.lastSleep)}
      </span>
    </div>
  </div>
</div>

<style>
  .character-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .date {
    color: #888;
    font-size: 0.9rem;
  }

  .character-portrait {
    width: 400px;
    height: 400px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center center;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #fff;
  }

  .character-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-item {
    display: flex;
    gap: 0.5rem;
  }

  .label {
    color: #888;
    min-width: 80px;
  }

  .value {
    color: #fff;
  }
</style>
