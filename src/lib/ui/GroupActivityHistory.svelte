<script lang="ts">
  import { gs, uiState } from '../_state';
  import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
  import type { GroupActivityLog, Character } from '../_model/model-sim';
  import { generateGroupActivityTranscript } from '../llm/chat';
  import { getChatsForCharacter } from '../llm/index-db';
  import { getCharacterImage } from './_helpers/images.svelte';

  let props = $props<{
    characterId: number;
  }>();

  type Tab = 'none' | 'transcript' | 'summary' | 'updates';

  let characterName = $derived(gs.characters[props.characterId].name);
  let activities = $state<GroupActivityLog[]>([]);
  let streamingChats = $state<Record<string, string>>({});
  let activityTabs = $state<Record<string, Tab>>({});

  $effect(() => {
    getChats();
  });

  function getChats() {
    // Fetch chats for the last 24 hours
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000; // 24 hours ago
    getChatsForCharacter(props.characterId.toString(), startTime, endTime)
      .then((chats) => {
        activities = chats.sort((a, b) => b.timestamp - a.timestamp);
        activityTabs = activities.reduce(
          (acc, activity) => {
            acc[activity.id] = 'summary';
            return acc;
          },
          {} as Record<string, Tab>
        );
      })
      .catch((error) => {
        console.error('Failed to fetch chats:', error);
      });
  }

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
      getChats();
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
            <div class="activity-info">
              <div class="activity-type-location">
                <div class="activity-type">{LABELS_ACTIVITY_TYPES[activity.activityType]}</div>
                <div class="activity-location">at {gs.places[activity.location]?.name}</div>
              </div>
              <div class="participant-portraits">
                {#each activity.participants
                  .filter((id) => id !== props.characterId)
                  .map((id) => gs.characters.find((c) => c.id === id))
                  .filter((c): c is Character => c !== undefined) as participant}
                  <img
                    src={getCharacterImage(participant.name)}
                    alt={participant.name}
                    class="participant-portrait"
                    title={participant.name}
                    onclick={() => {
                      uiState.selectedCharacter = participant;
                    }}
                  />
                {/each}
              </div>
            </div>
            <div class="activity-header-right">
              <span class="activity-time">{new Date(activity.timestamp).toLocaleString()}</span>
              <div class="tabs">
                <button
                  class="tab-button"
                  class:active={activityTabs[activity.id] === 'summary'}
                  onclick={() =>
                    (activityTabs[activity.id] =
                      activityTabs[activity.id] === 'summary' ? 'none' : 'summary')}
                >
                  Summary
                </button>
                <button
                  class="tab-button"
                  class:active={activityTabs[activity.id] === 'transcript'}
                  onclick={() =>
                    (activityTabs[activity.id] =
                      activityTabs[activity.id] === 'transcript' ? 'none' : 'transcript')}
                >
                  Transcript
                </button>
                <button
                  class="tab-button"
                  class:active={activityTabs[activity.id] === 'updates'}
                  onclick={() =>
                    (activityTabs[activity.id] =
                      activityTabs[activity.id] === 'updates' ? 'none' : 'updates')}
                >
                  Updates
                </button>
              </div>
            </div>
          </div>
          <div class="activity-details">
            <div class="chat-section">
              {#if activity.content?.transcript || activity.content?.summary}
                <div class="chat-content">
                  {#if activityTabs[activity.id] === 'transcript' && activity.content?.transcript}
                    <div class="chat-log">
                      {activity.content.transcript}
                    </div>
                  {:else if activityTabs[activity.id] === 'summary' && activity.content?.summary}
                    <div class="chat-summary">
                      {activity.content.summary}
                    </div>
                  {:else if activityTabs[activity.id] === 'updates' && activity.content?.updates}
                    <div class="chat-summary">
                      {#if activity.content.updates.length === 0}
                        <div>No relationship updates.</div>
                      {:else}
                        <ul class="updates-list">
                          {#each activity.content.updates.filter((u) => u.from === characterName || u.toward === characterName) as update}
                            <li class="update-item">
                              <span>
                                {update.from} → {update.toward}
                              </span>:
                              <span class="update-feeling">{update.feeling}</span>
                              <span class="update-delta"
                                >({update.delta > 0 ? '+' : ''}{update.delta})</span
                              >
                              <span class="update-reason">— {update.reason}</span>
                            </li>
                          {/each}
                        </ul>
                      {/if}
                    </div>
                  {/if}
                </div>
              {:else if streamingChats[activity.id]}
                <div class="chat-log streaming">
                  {streamingChats[activity.id]}
                </div>
              {:else}
                <button class="generate-chat-button" onclick={() => generateActivityChat(activity)}>
                  Generate Chat Log
                </button>
              {/if}
            </div>
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
    padding: 0.5rem 0.75rem 0.75rem 0.75rem;
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .activity-header-right {
    text-align: right;
  }

  .activity-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .activity-type-location {
    padding-right: 2rem;
  }

  .activity-type {
    font-size: 1.2rem;
    font-weight: 500;
  }

  .activity-location {
    color: #888;
  }

  .participant-portraits {
    display: flex;
    gap: 0.25rem;
    margin-left: 0.5rem;
  }

  .participant-portrait {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .activity-time {
    color: #888;
    font-size: 0.9em;
  }

  .activity-details {
    color: #aaa;
  }

  .chat-section {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .chat-content {
    position: relative;
  }

  .chat-log {
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

  .chat-summary {
    font-style: italic;
    color: #ddd;
    line-height: 1.4;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }

  .tab-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.25rem 0.5rem;
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

  .updates-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .update-item {
    margin-bottom: 0.25rem;
    color: #eee;
    font-size: 0.98em;
    line-height: 1.4;
  }
  .update-feeling {
    color: #aaf;
    margin-left: 0.25em;
    margin-right: 0.25em;
  }
  .update-delta {
    color: #afa;
    margin-left: 0.25em;
    margin-right: 0.25em;
  }
  .update-reason {
    color: #ccc;
    margin-left: 0.5em;
    font-style: italic;
  }
</style>
