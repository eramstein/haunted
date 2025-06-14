<script lang="ts">
  import { LABELS_OBJECTIVE_TYPES } from '../_config/labels';
  import type { Character } from '../_model';
  import { ObjectiveType } from '../_model/model-sim.enums';
  import { gs } from '../_state';
  import { getActivityLabel } from '../sim/activities-labels';
  import { getMoodLabel } from '../sim/emotions';
  import { formatMinutes } from './_helpers/date.svelte';
  import { getCharacterImage } from './_helpers/images.svelte';
  import ActivityIcon from './ActivityIcon.svelte';
  import GroupActivityHistory from './GroupActivityHistory.svelte';
  import CharacterRelationships from './CharacterRelationships.svelte';
  import CharacterEmotionalProfile from './CharacterEmotionalProfile.svelte';

  let props = $props<{
    character: Character;
  }>();

  type Tab = 'none' | 'activity' | 'relationships' | 'emotions';
  let activeTab = $state<Tab>('none');
</script>

<div class="character-panel-container">
  {#if activeTab === 'activity'}
    <div class="details-section">
      <GroupActivityHistory characterId={props.character.id} />
    </div>
  {/if}
  {#if activeTab === 'relationships'}
    <div class="details-section">
      <CharacterRelationships characterId={props.character.id} />
    </div>
  {/if}
  {#if activeTab === 'emotions'}
    <div class="details-section">
      <CharacterEmotionalProfile characterId={props.character.id} />
    </div>
  {/if}
  <div class="character-panel">
    <h2>{props.character.name}</h2>
    <div class="character-details">
      <div
        class="character-portrait"
        style="background-image: url({getCharacterImage(props.character.name)})"
      ></div>
      <div class="tabs">
        <button
          class="tab-button"
          class:active={activeTab === 'activity'}
          onclick={() => (activeTab = activeTab === 'activity' ? 'none' : 'activity')}
        >
          Activities
        </button>
        <button
          class="tab-button"
          class:active={activeTab === 'relationships'}
          onclick={() => (activeTab = activeTab === 'relationships' ? 'none' : 'relationships')}
        >
          Relationships
        </button>
        <button
          class="tab-button"
          class:active={activeTab === 'emotions'}
          onclick={() => (activeTab = activeTab === 'emotions' ? 'none' : 'emotions')}
        >
          Emotions
        </button>
      </div>
      <div class="detail-item">
        <span class="label">Mood:</span>
        <span class="value">{getMoodLabel(props.character.emotions.mood)}</span>
      </div>
      <div class="detail-item">
        <span class="label">Emotion:</span>
        <span class="value">{props.character.emotions.dominantEmotion || '-'}</span>
      </div>
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
  </div>
</div>

<style>
  .character-panel-container {
    display: flex;
    gap: 2rem;
  }

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
    text-transform: capitalize;
  }

  .participants {
    font-size: 0.9em;
    color: #aaa;
    margin-top: 4px;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin: 0.5rem 0;
    flex-wrap: wrap;
  }

  .tab-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    width: fit-content;
  }

  .tab-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .tab-button.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .tab-button:active {
    background: rgba(255, 255, 255, 0.15);
  }

  .details-section {
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    padding-right: 1rem;
    width: calc(100vw - 500px);
  }
</style>
