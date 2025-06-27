<script lang="ts">
  import { gs, uiState } from '../_state';
  import { groupChat } from '../llm/chat';
  import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
  import { formatDate } from './_helpers/date.svelte';
  import { getTime } from '../sim';
  import type { GroupActivityLog, Character } from '../_model/model-sim';

  let props = $props<{
    activity: GroupActivityLog;
    onClose: () => void;
  }>();

  let isGenerating = $state(false);
  let generationComplete = $state(false);
  let generatedContent = $state('');
  let customInstructions = $state('');

  function closeModal() {
    props.onClose();
  }

  async function generateActivityChat() {
    if (isGenerating) return;

    isGenerating = true;
    generationComplete = false;
    generatedContent = '';

    const participants = props.activity.participants
      .map((id: number) => gs.characters.find((c: Character) => c.id === id))
      .filter((c: Character | undefined): c is Character => c !== undefined);

    if (!participants.length) {
      isGenerating = false;
      return;
    }

    try {
      await groupChat(
        props.activity.id,
        props.activity.timestamp,
        participants,
        gs.places[props.activity.location],
        props.activity.activityType,
        customInstructions
      );

      // Cache the final content before it gets reset
      generatedContent = uiState.streamingContent;
      generationComplete = true;
    } catch (error) {
      console.error('Failed to generate chat:', error);
    } finally {
      isGenerating = false;
    }
  }
</script>

<div class="modal-backdrop" onclick={closeModal}></div>
<div class="modal">
  <button class="close-button" onclick={closeModal}>×</button>

  <div class="modal-header">
    <h2>
      {LABELS_ACTIVITY_TYPES[props.activity.activityType as keyof typeof LABELS_ACTIVITY_TYPES]}
    </h2>
    <div class="activity-info">
      <div class="activity-location">
        {gs.places[props.activity.location]?.name} -
        {formatDate(getTime(props.activity.timestamp))}
      </div>
    </div>
  </div>

  {#if !isGenerating && !uiState.streamingContent && !generationComplete}
    <div class="modal-content">
      <div class="instructions-section">
        <label for="instructions">Custom Instructions (Optional):</label>
        <textarea
          id="instructions"
          bind:value={customInstructions}
          placeholder="Add specific instructions for how the characters should interact, what topics to discuss, or any particular mood or tone you'd like..."
          rows="3"
        ></textarea>
      </div>

      <div class="options">
        <button class="option-button primary" onclick={generateActivityChat}>
          Generate Chat Transcript
        </button>
        <button class="option-button secondary" onclick={closeModal}> Cancel </button>
      </div>
    </div>
  {:else if uiState.streamingContent && !generationComplete}
    <div class="modal-content">
      <div class="streaming-content">
        <h3>Generating transcript...</h3>
        <div class="chat-preview">
          {uiState.streamingContent}
          <span class="typing-indicator">...</span>
        </div>
      </div>
    </div>
  {:else if generationComplete}
    <div class="modal-content">
      <div class="streaming-content">
        <h3>Generation Complete!</h3>
        <div class="chat-preview">
          {generatedContent}
        </div>
      </div>

      <div class="options">
        <button class="option-button secondary" onclick={closeModal}> Close </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    z-index: 1500;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #222;
    color: #fff;
    padding: 2rem 2.5rem;
    border-radius: 1rem;
    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.4);
    z-index: 1501;
    width: 90vw;
    max-width: 1200px;
    height: 85vh;
    max-height: 800px;
    overflow-y: auto;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #fff;
    font-size: 2rem;
    cursor: pointer;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .modal-header {
    margin-bottom: 2rem;
    text-align: center;
  }

  .modal-header h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #fff;
  }

  .activity-info {
    color: #ccc;
    font-size: 0.9rem;
  }

  .activity-location {
    color: #888;
    margin-bottom: 0.25rem;
  }

  .modal-content {
    text-align: center;
  }

  .instructions-section {
    margin-bottom: 2rem;
    text-align: left;
  }

  .instructions-section label {
    display: block;
    margin-bottom: 0.5rem;
    color: #fff;
    font-weight: 500;
  }

  .instructions-section textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    padding: 0.75rem;
    color: #fff;
    font-family: inherit;
    font-size: 0.9rem;
    resize: vertical;
    min-height: 80px;
  }

  .instructions-section textarea:focus {
    outline: none;
    border-color: #3182ce;
    background: rgba(255, 255, 255, 0.15);
  }

  .instructions-section textarea::placeholder {
    color: #888;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }

  .option-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .option-button.primary {
    background: #3182ce;
    color: #fff;
  }

  .option-button.primary:hover {
    background: #2c5aa0;
  }

  .option-button.secondary {
    background: #444;
    color: #fff;
  }

  .option-button.secondary:hover {
    background: #666;
  }

  .streaming-content {
    text-align: left;
  }

  .streaming-content h3 {
    margin: 0 0 1rem 0;
    color: #fff;
  }

  .chat-preview {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    padding: 1rem;
    max-height: 500px;
    overflow-y: auto;
    white-space: pre-wrap;
    line-height: 1.4;
    color: #ddd;
    font-family: monospace;
    font-size: 0.9rem;
  }

  .typing-indicator {
    color: #888;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }
</style>
