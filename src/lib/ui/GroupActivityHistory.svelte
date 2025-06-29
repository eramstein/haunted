<script lang="ts">
  import { gs, uiState } from '../_state';
  import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
  import type { GroupActivityLog, Character } from '../_model/model-sim';
  import { getChatsForCharacters } from '../llm/index-db';
  import { getCharacterImage } from './_helpers/images.svelte';
  import { formatDate } from './_helpers/date.svelte';
  import { getTime } from '../sim';
  import ActivityContentDisplay from './ActivityContentDisplay.svelte';

  let props = $props<{
    characterId: number;
  }>();

  let characterName = $derived(gs.characters[props.characterId].name);
  let activities = $state<GroupActivityLog[]>([]);

  $effect(() => {
    getChats();
  });

  function getChats() {
    // Fetch chats for the last and next 24 hours
    const endTime = gs.time.ellapsedTime + 24 * 60 * 60;
    const startTime = gs.time.ellapsedTime - 24 * 60 * 60;
    getChatsForCharacters([props.characterId], startTime, endTime)
      .then((chats) => {
        activities = chats.sort((a, b) => b.timestamp - a.timestamp);
      })
      .catch((error) => {
        console.error('Failed to fetch chats:', error);
      });
  }
</script>

<div class="group-activity-history">
  <h3>Group Activity History</h3>
  {#if activities.length === 0}
    <p class="no-activities">No group activities yet</p>
  {:else}
    <div class="activities-list">
      {#each activities as activity}
        <div class="activity-item" class:upcoming={activity.timestamp > gs.time.ellapsedTime}>
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
              <span class="activity-time" class:upcoming={activity.timestamp > gs.time.ellapsedTime}
                >{formatDate(getTime(activity.timestamp))}</span
              >
            </div>
          </div>

          <ActivityContentDisplay
            {activity}
            {characterName}
            showGenerateButton={true}
            onRefresh={getChats}
          />
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

  .activity-item.upcoming {
    background: rgba(135, 206, 250, 0.15);
    border: 1px solid rgba(135, 206, 250, 0.3);
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

  .activity-time.upcoming {
    color: #87ceeb;
    font-weight: 500;
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
  .update-cause {
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
