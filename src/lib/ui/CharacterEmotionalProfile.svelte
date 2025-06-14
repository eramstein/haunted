<script lang="ts">
  import { gs } from '../_state';
  import type { Character, Emotion } from '../_model/model-sim';
  import { EmotionType } from '../_model/model-sim.enums';
  import { getCharacterImage } from './_helpers/images.svelte';
  import { getEmotionColor, getMoodLabel, updateEmotionValue } from '../sim/emotions';

  let props = $props<{
    characterId: number;
    showHeader?: boolean;
  }>();

  let character = $state<Character | null>(null);
  let editingEmotion = $state<{ type: EmotionType } | null>(null);

  $effect(() => {
    updateCharacter();
  });

  function updateCharacter() {
    character = gs.characters.find((c) => c.id === props.characterId) || null;
  }

  function editEmotionValue(event: Event) {
    if (!editingEmotion || !character) return;

    const input = event.target as HTMLInputElement;
    const value = Math.max(0, Math.min(100, parseInt(input.value) || 0));

    updateEmotionValue(editingEmotion.type, props.characterId, value);
    editingEmotion = null;
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
          Dominant Emotion: {character.emotions.dominantEmotion}
        </p>
      {/if}
      <div class="emotions-grid">
        {#each Object.entries(character.emotions.byType) as [type, emotion]}
          <div
            class="emotion-item"
            onclick={() => (editingEmotion = { type: type as EmotionType })}
          >
            <span class="emotion-name">{type}</span>
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
                {#if editingEmotion?.type === type}
                  <input
                    type="number"
                    class="emotion-input"
                    min="0"
                    max="100"
                    onchange={editEmotionValue}
                  />
                {:else}
                  <span class="emotion-value">
                    Current: {emotion.currentIntensity}
                  </span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
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
    margin: 0.25rem 0 0 0;
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

  .emotion-name {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
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

  .emotion-input {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    color: #fff;
    font-size: 0.8rem;
    padding: 2px 4px;
    text-align: right;
  }

  .emotion-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }

  .emotion-input::-webkit-inner-spin-button,
  .emotion-input::-webkit-outer-spin-button {
    opacity: 1;
  }
</style>
