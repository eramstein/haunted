<script lang="ts">
  import { gs } from '../_state';
  import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
  import { ActivityType } from '../_model/model-sim.enums';
  import type { GroupActivityLog, Character } from '../_model/model-sim';
  import { generateGroupActivityTranscript } from '../llm/chat';
  import { getChatsForCharacter } from '../llm/index-db';

  let props = $props<{
    characterId: number;
  }>();

  let activities = $state<GroupActivityLog[]>([]);
  let streamingChats = $state<Record<string, string>>({});

  $effect(() => {
    // Fetch chats for the last 24 hours
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000; // 24 hours ago
    getChatsForCharacter(props.characterId.toString(), startTime, endTime)
      .then((chats) => {
        activities = chats.sort((a, b) => b.timestamp - a.timestamp);
      })
      .catch((error) => {
        console.error('Failed to fetch chats:', error);
      });
  });

  async function generateActivityChat(activity: GroupActivityLog) {
    if (activity.content) return;

    const participants = activity.participants
      .map((id: number) => gs.characters.find((c) => c.id === id))
      .filter((c): c is Character => c !== undefined);

    if (!participants.length) return;

    streamingChats[activity.id] = '';

    try {
      await generateGroupActivityTranscript(
        activity.id,
        participants,
        gs.places[activity.location],
        activity.activityType,
        (chunk) => {
          streamingChats[activity.id] += chunk;
        }
      );
    } catch (error) {
      console.error('Failed to generate chat:', error);
      streamingChats[activity.id] = 'Failed to generate chat log.';
    }
  }
</script>

<div class="group-activity-history">
  <h3>Group Activity History</h3>
  {#if activities.length === 0}
    <p class="no-activities">No group activities yet</p>
  {:else}
    <div class="activities-list">
      {#each activities as activity}
        <div class="activity-item">
          <div class="activity-header">
            <span class="activity-type">{LABELS_ACTIVITY_TYPES[activity.activityType]}</span>
            <span class="activity-time">{new Date(activity.timestamp).toLocaleString()}</span>
          </div>
          <div class="activity-details">
            <div class="location">
              at {gs.places[activity.location]?.name}
            </div>
            <div class="participants">
              with {activity.participants
                .filter((id) => id !== props.characterId)
                .map((id) => gs.characters.find((c) => c.id === id)?.name)
                .join(', ')}
            </div>
            {#if activity.activityType === ActivityType.Chat}
              <div class="chat-section">
                {#if activity.content?.transcript}
                  <div class="chat-log">
                    {activity.content.transcript}
                  </div>
                {:else if streamingChats[activity.id]}
                  <div class="chat-log streaming">
                    {streamingChats[activity.id]}
                  </div>
                {:else}
                  <button
                    class="generate-chat-button"
                    onclick={() => generateActivityChat(activity)}
                  >
                    Generate Chat Log
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .group-activity-history {
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

  .no-activities {
    color: #888;
    font-style: italic;
  }

  .activities-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .activity-item {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.75rem;
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .activity-type {
    font-weight: 500;
  }

  .activity-time {
    color: #888;
    font-size: 0.9em;
  }

  .activity-details {
    font-size: 0.9em;
    color: #aaa;
  }

  .location {
    margin-bottom: 0.25rem;
  }

  .participants {
    font-style: italic;
    margin-bottom: 0.5rem;
  }

  .chat-section {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .chat-log {
    font-style: italic;
    color: #ddd;
    white-space: pre-wrap;
    line-height: 1.4;
  }

  .chat-log.streaming {
    color: #bbb;
  }

  .generate-chat-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background-color 0.2s;
  }

  .generate-chat-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .generate-chat-button:active {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
