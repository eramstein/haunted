<script lang="ts">
  import { gs, uiState } from '../_state';
  import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
  import type { GroupActivityLog, Character } from '../_model/model-sim';
  import { groupChat } from '../llm/chat';
  import { getChatsForCharacters } from '../llm/index-db';
  import { getCharacterImage } from './_helpers/images.svelte';
  import { formatDate } from './_helpers/date.svelte';
  import { getTime } from '../sim';
  import { POSITIVE_EMOTIONS, NEGATIVE_EMOTIONS } from '../sim/emotions';
  import { EmotionType } from '../_model/model-sim.enums';

  let props = $props<{
    characterId: number;
  }>();

  type Tab = 'none' | 'transcript' | 'summary' | 'updates';

  let characterName = $derived(gs.characters[props.characterId].name);
  let activities = $state<GroupActivityLog[]>([]);
  let activityTabs = $state<Record<string, Tab>>({});

  function getEmotionDeltaColor(type: EmotionType, delta: number): string {
    if (POSITIVE_EMOTIONS.includes(type)) {
      return delta > 0 ? '#afa' : '#F44336'; // Green for positive delta, red for negative
    } else if (NEGATIVE_EMOTIONS.includes(type)) {
      return delta < 0 ? '#afa' : '#F44336'; // Green for negative delta, red for positive
    }
    return '#9E9E9E'; // Gray for neutral emotions
  }

  $effect(() => {
    getChats();
  });

  function getChats() {
    // Fetch chats for the last 24 hours
    const endTime = gs.time.ellapsedTime;
    const startTime = endTime - 24 * 60 * 60; // 24 hours ago
    getChatsForCharacters([props.characterId], startTime, endTime)
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
    if (activity.content?.transcript) return;
    activityTabs[activity.id] = 'transcript';

    const participants = activity.participants
      .map((id: number) => gs.characters.find((c) => c.id === id))
      .filter((c): c is Character => c !== undefined);

    if (!participants.length) return;

    try {
      await groupChat(
        activity.id,
        activity.timestamp,
        participants,
        gs.places[activity.location],
        activity.activityType
      );
      getChats();
    } catch (error) {
      console.error('Failed to generate chat:', error);
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
              <span class="activity-time">{formatDate(getTime(activity.timestamp))}</span>
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
                  {:else if activityTabs[activity.id] === 'updates' && activity.content?.relationUpdates}
                    <div class="update-summary">
                      {#if activity.content.relationUpdates.length === 0}
                        <div>No relationship relationUpdates.</div>
                      {:else}
                        <div class="update-section-title">Relationship Updates</div>
                        <ul class="relation-updates-list">
                          {#each activity.content.relationUpdates.filter((u) => u.from === characterName || u.toward === characterName) as update}
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
                    <div class="update-summary">
                      {#if activity.content.emotionUpdates.length === 0}
                        <div>No emotion updates.</div>
                      {:else}
                        <div class="update-section-title">Emotions Updates</div>
                        {#each activity.content.emotionUpdates.filter((u) => u.characterName === characterName) as update}
                          <div class="update-item">
                            <span class="update-feeling">{update.type}</span>
                            {#if update.subtype}
                              <span class="update-subtype">({update.subtype})</span>
                            {/if}
                            <span
                              class="update-delta"
                              style="color: {getEmotionDeltaColor(update.type, update.delta)}"
                              >({update.delta > 0 ? '+' : ''}{update.delta})</span
                            >
                            <span class="update-reason">— {update.reason}</span>
                          </div>
                        {/each}
                      {/if}
                    </div>
                  {/if}
                </div>
              {:else if uiState.isStreaming && uiState.streamingContent}
                <div class="chat-log streaming">
                  {uiState.streamingContent}
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

  .update-summary {
    font-style: italic;
    color: #ddd;
    line-height: 1.4;
    margin-bottom: 1.5em;
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

  .relation-updates-list {
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

  .update-section-title {
    font-style: normal;
    font-weight: 500;
    margin-bottom: 0.5em;
    border-bottom: 1px solid #444;
    width: fit-content;
  }
</style>
