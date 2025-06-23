<script lang="ts">
  import { gs } from '../_state';
  import type { Character, Emotion, EmotionUpdate } from '../_model/model-sim';
  import { EmotionType } from '../_model/model-sim.enums';
  import { getCharacterImage } from './_helpers/images.svelte';
  import {
    describeEmotion,
    getEmotionColor,
    getMoodLabel,
    updateEmotionValue,
    POSITIVE_EMOTIONS,
    NEGATIVE_EMOTIONS,
  } from '../sim/emotions';
  import { getChatsForCharacters } from '../llm/index-db';
  import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
  import { formatDate } from './_helpers/date.svelte';
  import { getTime } from '../sim';

  let props = $props<{
    characterId: number;
    showHeader?: boolean;
  }>();

  let character = $state<Character | null>(null);
  let selectedEmotion = $state<EmotionType | null>(null);
  let emotionUpdates = $state<Array<EmotionUpdate & { timestamp: number; activityType: string }>>(
    []
  );

  $effect(() => {
    updateCharacter();
  });

  function updateCharacter() {
    character = gs.characters.find((c) => c.id === props.characterId) || null;
  }

  function getEmotionDeltaColor(type: EmotionType, delta: number): string {
    if (POSITIVE_EMOTIONS.includes(type)) {
      return delta > 0 ? '#4caf50' : '#f44336'; // Green for positive delta, red for negative
    } else if (NEGATIVE_EMOTIONS.includes(type)) {
      return delta < 0 ? '#4caf50' : '#f44336'; // Green for negative delta, red for positive
    }
    return '#9E9E9E'; // Gray for neutral emotions
  }

  async function showEmotionUpdates(emotionType: EmotionType) {
    selectedEmotion = selectedEmotion === emotionType ? null : emotionType;

    if (!selectedEmotion) {
      emotionUpdates = [];
      return;
    }

    // Fetch chats for the last 24 hours
    const endTime = gs.time.ellapsedTime;
    const startTime = endTime - 24 * 60 * 60; // 24 hours ago

    try {
      const chats = await getChatsForCharacters([props.characterId], startTime, endTime);
      // Filter chats that include the character and have emotionUpdates for this emotion type
      emotionUpdates = chats
        .flatMap(
          (chat) =>
            chat.content?.emotionUpdates?.map((update) => ({
              ...update,
              timestamp: chat.timestamp,
              activityType: LABELS_ACTIVITY_TYPES[chat.activityType],
            })) || []
        )
        .filter(
          (update) => update.characterName === character?.name && update.type === selectedEmotion
        );
    } catch (error) {
      console.error('Failed to fetch emotion updates:', error);
    }
  }
</script>

<div class="character-emotional-profile">
  <h3>Emotional Profile</h3>
  {#if !character}
    <p class="no-profile">No character found</p>
  {:else}
    {#if props.showHeader}
      <div class="profile-header">
        <img
          src={getCharacterImage(character.name)}
          alt={character.name}
          class="character-portrait"
        />
        <div class="character-info">
          <h4>{character.name}</h4>
        </div>
      </div>
    {/if}

    <div class="emotions-section">
      <h4>{getMoodLabel(character.emotions.mood)} ({character.emotions.mood})</h4>
      {#if character.emotions.dominantEmotion}
        <p class="dominant-emotion">
          Dominant Emotion: <strong
            >{describeEmotion(
              character.emotions.dominantEmotion.name,
              character.emotions.dominantEmotion.intensity
            )}</strong
          >
        </p>
      {/if}
      <div class="emotions-grid">
        {#each Object.entries(character.emotions.byType) as [type, emotion]}
          <div
            class="emotion-item"
            class:selected={selectedEmotion === type}
            onclick={() => (selectedEmotion = type as EmotionType)}
            title={`Volatility: ${emotion.volatility.toFixed(1)}
Decay Rate: ${emotion.decayRate.toFixed(1)}`}
          >
            <span
              class="emotion-name"
              onclick={(e) => {
                e.stopPropagation();
                showEmotionUpdates(type as EmotionType);
              }}
            >
              {describeEmotion(type, emotion.currentIntensity)}
            </span>
            <div class="emotion-bars">
              <div class="emotion-bar">
                <div
                  class="emotion-bar-fill"
                  style="width: {emotion.currentIntensity}%; background-color: {getEmotionColor(
                    type as EmotionType,
                    emotion.currentIntensity
                  )}"
                ></div>
                <div class="baseline-marker" style="left: {emotion.baselineIntensity}%"></div>
                <span class="emotion-value">
                  Current: {emotion.currentIntensity}
                </span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    {#if selectedEmotion}
      <div class="emotion-updates-section">
        <h4>Updates for {selectedEmotion}</h4>
        <div class="emotion-update-controls">
          <label for="emotion-value">Update value:</label>
          <input
            type="number"
            id="emotion-value"
            min="0"
            max="100"
            value={selectedEmotion
              ? character.emotions.byType[selectedEmotion].currentIntensity
              : 0}
            onchange={(e) =>
              selectedEmotion &&
              updateEmotionValue(
                selectedEmotion,
                props.characterId,
                Number((e.target as HTMLInputElement).value)
              )}
          />
        </div>
        {#if emotionUpdates.length === 0}
          <p class="no-emotion-updates">No emotion updates found for this emotion.</p>
        {:else}
          <table class="emotion-updates-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Time</th>
                <th>Change</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {#each emotionUpdates as update}
                <tr>
                  <td class="activity-cell">{update.activityType}</td>
                  <td>{formatDate(getTime(update.timestamp))}</td>
                  <td
                    class="delta-cell"
                    class:positive={update.delta > 0}
                    class:negative={update.delta < 0}
                    style="color: {getEmotionDeltaColor(update.type, update.delta)}"
                  >
                    {update.delta > 0 ? '+' : ''}{update.delta}
                  </td>
                  <td class="cause-cell">{update.cause}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .character-emotional-profile {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 1rem;
    color: #fff;
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #fff;
  }

  h4 {
    margin: 1.5rem 0 1rem 0;
    font-size: 1.1rem;
    color: #fff;
  }

  .no-profile {
    color: #888;
    font-style: italic;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .character-portrait {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .character-info {
    flex: 1;
  }

  .dominant-emotion {
    color: #aaa;
    margin: 0 0 0.5rem 0;
  }

  .emotions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .emotion-item {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .emotion-item:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .emotion-item.selected {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .emotion-name {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    text-transform: capitalize;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .emotion-name:hover {
    color: #aaf;
  }

  .emotion-bars {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .emotion-bar {
    position: relative;
    height: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    overflow: visible;
  }

  .emotion-bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    transition: width 0.3s ease;
  }

  .baseline-marker {
    position: absolute;
    top: -2px;
    bottom: -2px;
    width: 2px;
    background: rgba(255, 255, 255, 0.5);
    transition: left 0.3s ease;
  }

  .emotion-value {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    color: #fff;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }

  .emotion-updates-section {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .no-emotion-updates {
    color: #888;
    font-style: italic;
  }

  .emotion-updates-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .emotion-updates-table th,
  .emotion-updates-table td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .emotion-updates-table th {
    color: #888;
    font-weight: 500;
    text-transform: uppercase;
    font-size: 0.8rem;
  }

  .delta-cell {
    font-weight: 500;
  }

  .delta-cell.positive {
    color: #4caf50;
  }

  .delta-cell.negative {
    color: #f44336;
  }

  .cause-cell {
    color: #888;
    font-style: italic;
  }

  .activity-cell {
    text-transform: capitalize;
  }

  .emotion-update-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 1rem 0;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .emotion-update-controls label {
    color: #fff;
    font-size: 0.9rem;
  }

  .emotion-update-controls input {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    width: 80px;
  }

  .emotion-update-controls input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
  }

  .emotion-update-controls input::-webkit-inner-spin-button,
  .emotion-update-controls input::-webkit-outer-spin-button {
    opacity: 1;
  }
</style>
