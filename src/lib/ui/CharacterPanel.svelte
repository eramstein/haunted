<script lang="ts">
  import { LABELS_OBJECTIVE_TYPES } from '../_config/labels';
  import type { Character } from '../_model';
  import { ObjectiveType } from '../_model/model-sim.enums';
  import { gs } from '../_state';
  import { getActivityLabel } from '../sim/activities-labels';
  import { formatMinutes } from './_helpers/date.svelte';
  import { getCharacterImage, getIconSheet, getActionIconPosition } from './_helpers/images.svelte';

  let props = $props<{
    character: Character;
  }>();
</script>

<div class="character-panel">
  <h2>{props.character.name}</h2>
  <div class="character-details">
    <div
      class="character-portrait"
      style="background-image: url({getCharacterImage(props.character.name)})"
    ></div>
    <div class="detail-item">
      <span class="label">Location:</span>
      <span class="value">{gs.places[props.character.place]?.name}</span>
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
    <div class="detail-item">
      <span class="label">Objective:</span>
      <span class="value">
        {LABELS_OBJECTIVE_TYPES[props.character.objective?.type as ObjectiveType]}
      </span>
    </div>
    <div class="detail-item">
      <span class="label">Activity:</span>
      <span class="value">
        {#if props.character.activity}
          <div
            class="activity-icon"
            style="background-image: url({getIconSheet(
              'actions'
            )}); background-position: {getActionIconPosition(props.character.activity.type, 20)}"
          ></div>
        {/if}
        {getActivityLabel(props.character.activity)} - {Math.round(
          props.character.activity?.progress || 0
        )}%
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
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .activity-icon {
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-size: 200px 20px;
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 2px;
    background-color: rgba(255, 255, 255);
  }
</style>
