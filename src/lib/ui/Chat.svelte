<script lang="ts">
  import { gs, uiState } from '../_state';
  import { playerSendChat } from '../llm/chat';
  import { getCharacterImage } from './_helpers/images.svelte';
  import { queryToolVectors } from '../llm/tools-vectors';
  import { lookupToolUsage } from '../llm/tools-lookup';
  import { useTool } from '../sim/tool-use';
  import { ActivityType } from '../_model/model-sim.enums';

  let messageInput = $state('');
  let isSending = $state(false);
  let pendingToolUsage = $state<any>(null);
  let pendingMessage = $state('');
  let showToolConfirmation = $state(false);

  $effect(() => {
    // Scroll to bottom when new messages are added or streaming
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      // Access reactive values to make the effect track them
      const messageCount = displayMessages.length;
      const isCurrentlyStreaming = uiState.streamingContent;

      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      });
    }
  });

  async function sendMessage(checkTools?: boolean) {
    if (!messageInput.trim() || !gs.chat || isSending) return;

    const message = messageInput.trim();
    messageInput = '';
    isSending = true;

    if (checkTools) {
      await setToolsUsageState(message);
      if (showToolConfirmation) {
        return;
      }
    }

    await sendMessageWithToolOutcome(message, '');
  }

  async function setToolsUsageState(message: string) {
    const toolType = await queryToolVectors(message);
    if (toolType) {
      // check for obvious tool usage with Typescript (no param, or number lookup, or string lookup)
      const defaultParameterValues: Record<string, any> = {};
      // todo: this is a hack to get the recipient for the ask for help activity
      if (gs.chat!.activityType === ActivityType.AskForHelp) {
        defaultParameterValues.recipient = gs.chat!.otherCharacters[0].name;
      }
      const toolUsage = lookupToolUsage(
        message,
        toolType,
        gs.chat!.playingAsCharacter,
        defaultParameterValues
      );
      if (toolUsage) {
        // Store pending tool usage and show confirmation
        pendingToolUsage = toolUsage;
        pendingMessage = message;
        showToolConfirmation = true;
        isSending = false;
      }
      // TODO: in case of doubt, send toolcall message to LLM
    }
  }

  async function sendMessageWithToolOutcome(message: string, toolOutcome: string) {
    if (!gs.chat) return;

    const fullMessage = toolOutcome ? message + ' \n\n(' + toolOutcome + ')' : message;
    try {
      await playerSendChat(
        fullMessage,
        gs.chat.playingAsCharacter,
        gs.chat.otherCharacters,
        gs.chat.activityType
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      isSending = false;
    }
  }

  function confirmToolUsage() {
    if (pendingToolUsage && gs.chat) {
      const toolOutcome = useTool(
        gs.chat.playingAsCharacter,
        pendingToolUsage.tool.function.name || '',
        pendingToolUsage.parameterValues
      );

      // Reset confirmation state
      showToolConfirmation = false;
      pendingToolUsage = null;

      // Send the message with tool outcome
      sendMessageWithToolOutcome(pendingMessage, toolOutcome);
      pendingMessage = '';
    }
  }

  function cancelToolUsage() {
    // Reset confirmation state and send message without tool
    showToolConfirmation = false;
    pendingToolUsage = null;
    sendMessageWithToolOutcome(pendingMessage, '');
    pendingMessage = '';
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage(event.shiftKey);
    }
  }

  function closeChat() {
    gs.chat = null;
  }

  // Filter out system messages for display
  let displayMessages = $derived(gs.chat?.history.filter((msg) => msg.role !== 'system') || []);
</script>

<div class="chat-container">
  <!-- Characters Section -->
  <div class="characters-section">
    <div class="characters-grid">
      <!-- Playing as character -->
      <div
        class="character-card playing-as"
        style="background-image: url({getCharacterImage(gs.chat?.playingAsCharacter.name || '')})"
      ></div>

      <!-- Other characters -->
      {#each gs.chat?.otherCharacters || [] as character}
        <div
          class="character-card"
          style="background-image: url({getCharacterImage(character.name)})"
        ></div>
      {/each}
    </div>
    <button onclick={closeChat} class="close-button" title="Close Chat">×</button>
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
      {#if uiState.isStreaming && uiState.streamingContent}
        <div class="message assistant streaming">
          <div class="message-content">
            {uiState.streamingContent}
            <span class="typing-indicator">...</span>
          </div>
        </div>
      {/if}

      <!-- Tool Confirmation -->
      {#if showToolConfirmation && pendingToolUsage}
        <div class="tool-confirmation">
          <div class="confirmation-content">
            <div class="confirmation-action-name">{pendingToolUsage.tool.function.name}</div>
            <div>{JSON.stringify(pendingToolUsage.parameterValues, null, 2)}</div>
          </div>
          <div class="confirmation-actions">
            <button onclick={confirmToolUsage} class="confirm-button">Use Tool</button>
            <button onclick={cancelToolUsage} class="cancel-button">Nope</button>
          </div>
          <div class="confirmation-message">{pendingMessage}</div>
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
        onclick={() => sendMessage(true)}
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
    background-color: #2a2a2a;
    border-bottom: 1px solid #444;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .characters-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .character-card {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 6px;
    width: 120px;
    height: 120px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }

  .character-card.playing-as {
    border: 2px solid #63b3ed;
    border-radius: 10px;
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

  /* Tool Confirmation Styles */
  .tool-confirmation {
    margin-top: 0.2rem;
    padding: 0.75rem;
    background-color: #2a2a2a;
    border-radius: 6px;
    border: 1px solid #444;
    display: flex;
    gap: 40px;
    align-items: center;
    height: 40px;
  }

  .confirmation-action-name {
    font-weight: bold;
    color: #3182ce;
    font-size: 0.9rem;
  }

  .confirmation-content,
  .confirmation-message {
    color: #fff;
    font-size: 0.8rem;
  }

  .confirmation-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    height: 30px;
  }

  .confirm-button {
    padding: 0.4rem 0.8rem;
    background-color: #3182ce;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.8rem;
  }

  .confirm-button:hover {
    background-color: #2c5aa0;
  }

  .cancel-button {
    padding: 0.4rem 0.8rem;
    background-color: #555;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.8rem;
  }

  .cancel-button:hover {
    background-color: #444;
  }

  .close-button {
    background: none;
    border: none;
    color: #888;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0.5rem;
    margin-right: 0.5rem;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .close-button:hover {
    color: #fff;
    background-color: #444;
  }
</style>
