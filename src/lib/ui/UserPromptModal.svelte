<script lang="ts">
  import { uiState } from '../_state';

  let prompt = $derived(() => uiState.userPrompt);
  let feedback = $derived(() => uiState.userPromptFeedback);

  function closeModal() {
    uiState.userPrompt = null;
    uiState.userPromptFeedback = '';
  }
</script>

{#if prompt()}
  {@const p = prompt()!}
  <div class="modal-backdrop" onclick={closeModal}></div>
  <div class="modal">
    <button class="close-button" onclick={closeModal}>×</button>
    <h2>{p.title}</h2>
    {#if feedback() === '' && !uiState.streamingContent}
      <div class="options">
        {#each p.options as option}
          <button class="option-button" onclick={() => option.action()}>
            {option.label}
          </button>
        {/each}
      </div>
    {:else if uiState.streamingContent}
      <div class="feedback">{@html (uiState.streamingContent || '').replace(/\n/g, '<br>')}</div>
    {:else}
      <div class="feedback">
        {@html feedback().replace(/\n/g, '<br>')}
      </div>
    {/if}
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    z-index: 1000;
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
    z-index: 1001;
    width: 640px;
    text-align: center;
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
  .options {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .option-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    background: #444;
    color: #fff;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .option-button:hover {
    background: #666;
  }
  .feedback {
    margin-top: 2rem;
    font-size: 1.1rem;
    text-align: left;
  }
</style>
