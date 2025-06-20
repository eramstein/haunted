<script lang="ts">
  import { gs } from '../_state';
  import { playerSendChat } from '../llm/chat';
  import { getCharacterImage } from './_helpers/images.svelte';

  let messageInput = $state('');
  let isSending = $state(false);
  let streamingResponse = $state('');

  $effect(() => {
    // Scroll to bottom when new messages are added or streaming
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });

  async function sendMessage() {
    if (!messageInput.trim() || !gs.chat || isSending) return;

    const message = messageInput.trim();
    messageInput = '';
    isSending = true;
    streamingResponse = '';

    try {
      await playerSendChat(
        message,
        gs.chat.playingAsCharacter,
        gs.chat.otherCharacters,
        gs.chat.activityType,
        (chunk) => {
          streamingResponse += chunk;
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      streamingResponse = 'Error: Failed to send message';
    } finally {
      isSending = false;
      streamingResponse = '';
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  // Filter out system messages for display
  let displayMessages = $derived(gs.chat?.history.filter((msg) => msg.role !== 'system') || []);
</script>

<div class="chat-container">
  <!-- Characters Section -->
  <div class="characters-section">
    <h3>Chat Participants</h3>
    <div class="characters-grid">
      <!-- Playing as character -->
      <div class="character-card playing-as">
        <div
          class="character-portrait"
          style="background-image: url({getCharacterImage(gs.chat?.playingAsCharacter.name || '')})"
        ></div>
        <div class="character-info">
          <span class="character-name">{gs.chat?.playingAsCharacter.name}</span>
          <span class="character-role">(You)</span>
        </div>
      </div>

      <!-- Other characters -->
      {#each gs.chat?.otherCharacters || [] as character}
        <div class="character-card">
          <div
            class="character-portrait"
            style="background-image: url({getCharacterImage(character.name)})"
          ></div>
          <div class="character-info">
            <span class="character-name">{character.name}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Chat Messages Section -->
  <div class="chat-messages-section">
    <div class="chat-messages">
      {#each displayMessages as message}
        <div class="message {message.role}">
          <div class="message-content">
            {message.content}
          </div>
        </div>
      {/each}

      <!-- Streaming response -->
      {#if streamingResponse}
        <div class="message assistant streaming">
          <div class="message-content">
            {streamingResponse}
            <span class="typing-indicator">...</span>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Input Section -->
  <div class="chat-input-section">
    <div class="input-container">
      <textarea
        bind:value={messageInput}
        onkeypress={handleKeyPress}
        placeholder="Type your message..."
        disabled={isSending}
        rows="3"
      ></textarea>
      <button
        onclick={sendMessage}
        disabled={!messageInput.trim() || isSending}
        class="send-button"
      >
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </div>
  </div>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #1a1a1a;
    border-radius: 8px;
    overflow: hidden;
  }

  .characters-section {
    padding: 1rem;
    background-color: #2a2a2a;
    border-bottom: 1px solid #444;
  }

  .characters-section h3 {
    margin: 0 0 1rem 0;
    color: #fff;
    font-size: 1.1rem;
  }

  .characters-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .character-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: #333;
    border-radius: 6px;
    min-width: 120px;
  }

  .character-card.playing-as {
    background-color: #4a5568;
    border: 2px solid #63b3ed;
  }

  .character-portrait {
    width: 40px;
    height: 40px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    border-radius: 50%;
    border: 2px solid #555;
  }

  .character-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .character-name {
    color: #fff;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .character-role {
    color: #63b3ed;
    font-size: 0.8rem;
    font-style: italic;
  }

  .chat-messages-section {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    max-width: 80%;
  }

  .message.user {
    align-self: flex-end;
  }

  .message.assistant {
    align-self: flex-start;
  }

  .message-content {
    padding: 0.75rem 1rem;
    border-radius: 12px;
    line-height: 1.4;
    white-space: pre-wrap;
  }

  .message.user .message-content {
    background-color: #3182ce;
    color: #fff;
  }

  .message.assistant .message-content {
    background-color: #4a5568;
    color: #fff;
  }

  .message.streaming .message-content {
    background-color: #4a5568;
    color: #fff;
    opacity: 0.8;
  }

  .typing-indicator {
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

  .chat-input-section {
    padding: 1rem;
    background-color: #2a2a2a;
    border-top: 1px solid #444;
  }

  .input-container {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }

  textarea {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #555;
    border-radius: 6px;
    background-color: #333;
    color: #fff;
    font-family: inherit;
    font-size: 0.9rem;
    resize: vertical;
    min-height: 60px;
  }

  textarea:focus {
    outline: none;
    border-color: #63b3ed;
  }

  textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .send-button {
    padding: 0.75rem 1.5rem;
    background-color: #3182ce;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .send-button:hover:not(:disabled) {
    background-color: #2c5aa0;
  }

  .send-button:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
</style>
