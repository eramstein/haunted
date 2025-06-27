<script lang="ts">
  import { gs } from '../_state';
  import type { GroupActivityLog, RelationshipUpdate, EmotionUpdate } from '../_model/model-sim';
  import { POSITIVE_EMOTIONS, NEGATIVE_EMOTIONS } from '../sim/emotions';
  import { EmotionType } from '../_model/model-sim.enums';
  import GenerateActivityChatModal from './GenerateActivityChatModal.svelte';

  let props = $props<{
    activity: GroupActivityLog;
    characterName?: string;
    showGenerateButton?: boolean;
    onRefresh?: () => void;
  }>();

  type Tab = 'none' | 'transcript' | 'summary' | 'updates';

  let selectedTab = $state<Tab>('summary');
  let selectedActivity = $state<GroupActivityLog | null>(null);
  let currentActivity = $state<GroupActivityLog>(props.activity);

  $effect(() => {
    currentActivity = props.activity;
  });

  function getEmotionDeltaColor(type: EmotionType, delta: number): string {
    if (POSITIVE_EMOTIONS.includes(type)) {
      return delta > 0 ? '#afa' : '#F44336'; // Green for positive delta, red for negative
    } else if (NEGATIVE_EMOTIONS.includes(type)) {
      return delta < 0 ? '#afa' : '#F44336'; // Green for negative delta, red for positive
    }
    return '#9E9E9E'; // Gray for neutral emotions
  }

  function openGenerateChatModal(activity: GroupActivityLog) {
    selectedActivity = activity;
  }

  function closeGenerateChatModal() {
    selectedActivity = null;
    // Refresh the activity data
    currentActivity = props.activity;
    // Call parent refresh callback if provided
    if (props.onRefresh) {
      props.onRefresh();
    }
  }

  function toggleTab(tab: Tab) {
    selectedTab = selectedTab === tab ? 'none' : tab;
  }
</script>

<div class="activity-content-display">
  {#if props.activity.timestamp <= gs.time.ellapsedTime}
    <div class="tabs">
      <button
        class="tab-button"
        class:active={selectedTab === 'summary'}
        onclick={() => toggleTab('summary')}
      >
        Summary
      </button>
      <button
        class="tab-button"
        class:active={selectedTab === 'transcript'}
        onclick={() => toggleTab('transcript')}
      >
        Transcript
      </button>
      <button
        class="tab-button"
        class:active={selectedTab === 'updates'}
        onclick={() => toggleTab('updates')}
      >
        Updates
      </button>
    </div>

    <div class="chat-section">
      {#if currentActivity.content?.transcript || currentActivity.content?.summary}
        <div class="chat-content">
          {#if selectedTab === 'transcript' && currentActivity.content?.transcript}
            <div class="chat-log">
              {currentActivity.content.transcript}
            </div>
          {:else if selectedTab === 'summary' && currentActivity.content?.summary}
            <div class="chat-summary">
              {currentActivity.content.summary}
            </div>
          {:else if selectedTab === 'updates' && currentActivity.content?.relationUpdates}
            <div class="update-summary">
              {#if currentActivity.content.relationUpdates.length === 0}
                <div>No relationship updates.</div>
              {:else}
                <div class="update-section-title">Relationship Updates</div>
                <ul class="relation-updates-list">
                  {#each currentActivity.content.relationUpdates.filter((u: RelationshipUpdate) => !props.characterName || u.from === props.characterName || u.toward === props.characterName) as update}
                    <li class="update-item">
                      <span>
                        {update.from} → {update.toward}
                      </span>:
                      <span class="update-feeling">{update.feeling}</span>
                      <span class="update-delta">({update.delta > 0 ? '+' : ''}{update.delta})</span
                      >
                      <span class="update-cause">— {update.cause}</span>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            <div class="update-summary">
              {#if currentActivity.content.emotionUpdates.length === 0}
                <div>No emotion updates.</div>
              {:else}
                <div class="update-section-title">Emotions Updates</div>
                {#each currentActivity.content.emotionUpdates.filter((u: EmotionUpdate) => !props.characterName || u.characterName === props.characterName) as update}
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
                    <span class="update-cause">— {update.cause}</span>
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      {:else if props.showGenerateButton}
        <button class="generate-chat-button" onclick={() => openGenerateChatModal(currentActivity)}>
          Generate Chat Log
        </button>
      {/if}
    </div>
  {/if}
</div>

{#if selectedActivity}
  <GenerateActivityChatModal activity={selectedActivity} onClose={closeGenerateChatModal} />
{/if}

<style>
  .activity-content-display {
    margin-top: 0.5rem;
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
