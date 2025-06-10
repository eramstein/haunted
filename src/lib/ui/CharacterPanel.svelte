<script lang="ts">
  import { LABELS_OBJECTIVE_TYPES } from '../_config/labels';
  import type { Character } from '../_model';
  import { ObjectiveType } from '../_model/model-sim.enums';
  import { gs } from '../_state';
  import { getActivityLabel } from '../sim/activities-labels';
  import { formatMinutes } from './_helpers/date.svelte';
  import { getCharacterImage } from './_helpers/images.svelte';
  import ActivityIcon from './ActivityIcon.svelte';
  import GroupActivityHistory from './GroupActivityHistory.svelte';

  let props = $props<{
    character: Character;
  }>();

  let showHistory = $state(false);
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
        {formatMinutes(props.character.needs.food)}
      </span>
    </div>
    <div class="detail-item">
      <span class="label">Sleep:</span>
      <span class="value">
        {formatMinutes(props.character.needs.sleep)}
      </span>
    </div>
    <div class="detail-item">
      <span class="label">Fun:</span>
      <span class="value">
        {formatMinutes(props.character.needs.fun)}
      </span>
    </div>
    <div class="detail-item">
      <span class="label">Social:</span>
      <span class="value">
        {formatMinutes(props.character.needs.social)}
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
        {#if props.character.activities[0]}
          <ActivityIcon activity={props.character.activities[0]} size={20} />
        {/if}
        {getActivityLabel(props.character.activities[0])} - {Math.round(
          props.character.activities[0]?.progress || 0
        )}%
        {#if props.character.activities[0]?.participants?.length}
          <div class="participants">
            with {props.character.activities[0].participants
              .filter((id: number) => id !== props.character.id)
              .map((id: number) => gs.characters.find((c) => c.id === id)?.name)
              .join(', ')}
          </div>
        {/if}
      </span>
    </div>
  </div>
  <div class="history-section">
    <button class="toggle-button" onclick={() => (showHistory = !showHistory)}>
      {showHistory ? 'Hide' : 'Show'} Group Activity History
    </button>
    {#if showHistory}
      <GroupActivityHistory characterId={props.character.id} />
    {/if}
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

  .participants {
    font-size: 0.9em;
    color: #aaa;
    margin-top: 4px;
  }

  .history-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toggle-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .toggle-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .toggle-button:active {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
