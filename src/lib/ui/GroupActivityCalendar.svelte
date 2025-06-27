<script lang="ts">
  import { gs } from '../_state';
  import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
  import type { GroupActivityLog, Character } from '../_model/model-sim';
  import { getChatsForCharacters } from '../llm/index-db';
  import { getCharacterImage } from './_helpers/images.svelte';
  import { getTime } from '../sim/time';
  import ActivityContentDisplay from './ActivityContentDisplay.svelte';
  import GenerateActivityChatModal from './GenerateActivityChatModal.svelte';

  interface DayActivities {
    date: Date;
    activities: GroupActivityLog[];
  }

  let activities = $state<GroupActivityLog[]>([]);
  let calendarDays = $state<DayActivities[]>([]);
  let expandedActivityId = $state<string | null>(null);
  let selectedActivity = $state<GroupActivityLog | null>(null);

  $effect(() => {
    loadActivities();
  });

  async function loadActivities() {
    const currentTime = gs.time.ellapsedTime;
    const minutesPerDay = 24 * 60;

    // Get the current date and align to start of day
    const currentDate = getTime(currentTime);
    const startOfToday = new Date(currentDate);
    startOfToday.setHours(0, 0, 0, 0);

    // Calculate the timestamp for start of today
    const startOfTodayTimestamp = Math.floor(
      (startOfToday.getTime() - gs.time.startDate.getTime()) / (1000 * 60)
    );

    // Get activities for 5 days: 2 days before, today, 2 days after
    const startTime = startOfTodayTimestamp - 2 * minutesPerDay;
    const endTime = startOfTodayTimestamp + 3 * minutesPerDay; // 3 days after start of today

    try {
      const allActivities = await getChatsForCharacters(
        gs.characters.map((c) => c.id),
        startTime,
        endTime
      );

      activities = allActivities.sort((a, b) => a.timestamp - b.timestamp);
      generateCalendarDays();
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  }

  function generateCalendarDays() {
    const currentTime = gs.time.ellapsedTime;
    const minutesPerDay = 24 * 60;
    const days: DayActivities[] = [];

    // Get the current date and align to start of day
    const currentDate = getTime(currentTime);
    const startOfToday = new Date(currentDate);
    startOfToday.setHours(0, 0, 0, 0);

    // Calculate the timestamp for start of today
    const startOfTodayTimestamp = Math.floor(
      (startOfToday.getTime() - gs.time.startDate.getTime()) / (1000 * 60)
    );

    // Generate 5 days: 2 days before, today, 2 days after
    for (let i = -2; i <= 2; i++) {
      const dayStart = startOfTodayTimestamp + i * minutesPerDay;
      const dayEnd = dayStart + minutesPerDay;

      const dayDate = new Date(gs.time.startDate.getTime() + dayStart * 60 * 1000);
      // Reset to start of day
      dayDate.setHours(0, 0, 0, 0);

      const dayActivities = activities.filter(
        (activity) => activity.timestamp >= dayStart && activity.timestamp < dayEnd
      );

      days.push({
        date: dayDate,
        activities: dayActivities,
      });
    }

    calendarDays = days;
  }

  function formatDayHeader(date: Date): string {
    const today = getTime();
    const isToday = date.toDateString() === today.toDateString();

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });

    return `${dayName} ${dayNumber} ${month}${isToday ? ' (Today)' : ''}`;
  }

  function formatActivityTime(timestamp: number): string {
    const date = getTime(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  function getActivityParticipants(activity: GroupActivityLog): Character[] {
    return activity.participants
      .map((id) => gs.characters.find((c) => c.id === id))
      .filter((c): c is Character => c !== undefined);
  }

  function isActivityUpcoming(activity: GroupActivityLog): boolean {
    return activity.timestamp > gs.time.ellapsedTime;
  }

  function isActivityPast(activity: GroupActivityLog): boolean {
    return activity.timestamp <= gs.time.ellapsedTime;
  }

  function toggleActivityExpansion(activityId: string) {
    console.log('toggleActivityExpansion called with:', activityId);
    if (expandedActivityId === activityId) {
      expandedActivityId = null;
    } else {
      expandedActivityId = activityId;
    }
    console.log('expandedActivityId after toggle:', expandedActivityId);
  }

  function isActivityExpanded(activityId: string): boolean {
    return expandedActivityId === activityId;
  }

  function openGenerateChatModal(activity: GroupActivityLog) {
    selectedActivity = activity;
  }

  function closeGenerateChatModal() {
    selectedActivity = null;
    loadActivities(); // Refresh the data after modal closes
  }
</script>

<div class="group-activity-calendar">
  <h3>Group Activity Calendar</h3>

  <div class="calendar-grid">
    {#each calendarDays as day}
      <div class="calendar-day">
        <div class="day-header">
          {formatDayHeader(day.date)}
        </div>

        <div class="day-activities">
          {#if day.activities.length === 0}
            <div class="no-activities">No activities</div>
          {:else}
            {#each day.activities as activity}
              <div
                class="activity-card"
                class:upcoming={isActivityUpcoming(activity)}
                class:past={isActivityPast(activity)}
                class:expanded={isActivityExpanded(activity.id)}
                onclick={() => toggleActivityExpansion(activity.id)}
              >
                <div class="activity-header">
                  <div class="activity-type">
                    {LABELS_ACTIVITY_TYPES[activity.activityType]}
                  </div>
                  <div class="activity-time">
                    {formatActivityTime(activity.timestamp)}
                  </div>
                </div>

                <div class="activity-location">
                  at {gs.places[activity.location]?.name || 'Unknown location'}
                </div>

                <div class="activity-bottom">
                  <div class="activity-participants">
                    {#each getActivityParticipants(activity) as participant}
                      <img
                        src={getCharacterImage(participant.name)}
                        alt={participant.name}
                        class="participant-portrait"
                        title={participant.name}
                      />
                    {/each}
                  </div>
                  {#if isActivityPast(activity) && !activity.content?.transcript && !activity.content?.summary}
                    <button
                      class="generate-chat-button-small"
                      onclick={(e) => {
                        e.stopPropagation();
                        openGenerateChatModal(activity);
                      }}
                      title="Generate Chat Log"
                    >
                      💬
                    </button>
                  {/if}
                </div>

                {#if isActivityExpanded(activity.id)}
                  <div class="activity-expanded-content" onclick={(e) => e.stopPropagation()}>
                    <ActivityContentDisplay
                      {activity}
                      showGenerateButton={false}
                      onRefresh={loadActivities}
                    />
                  </div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

{#if selectedActivity}
  <GenerateActivityChatModal activity={selectedActivity} onClose={closeGenerateChatModal} />
{/if}

<style>
  .group-activity-calendar {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 1rem;
    color: #fff;
    margin-left: 220px;
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #fff;
    text-align: center;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }

  .calendar-day {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 0.75rem;
    min-height: 200px;
  }

  .day-header {
    font-weight: 600;
    font-size: 0.9rem;
    color: #fff;
    text-align: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.75rem;
  }

  .day-activities {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .no-activities {
    color: #888;
    font-style: italic;
    text-align: center;
    font-size: 0.8rem;
    padding: 1rem 0;
  }

  .activity-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.5rem;
    border-left: 3px solid #666;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .activity-card:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .activity-card.upcoming {
    background: rgba(135, 206, 250, 0.15);
    border-left-color: #87ceeb;
  }

  .activity-card.upcoming:hover {
    background: rgba(135, 206, 250, 0.25);
  }

  .activity-card.past {
    background: rgba(255, 255, 255, 0.08);
    border-left-color: #888;
    opacity: 0.8;
  }

  .activity-card.past:hover {
    background: rgba(255, 255, 255, 0.12);
    opacity: 1;
  }

  .activity-card.expanded {
    background: rgba(255, 255, 255, 0.2);
    border-left-color: #fff;
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .activity-type {
    font-weight: 500;
    font-size: 0.85rem;
    color: #fff;
  }

  .activity-time {
    font-size: 0.75rem;
    color: #ccc;
  }

  .activity-location {
    font-size: 0.75rem;
    color: #aaa;
    margin-bottom: 0.5rem;
  }

  .activity-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .activity-participants {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .participant-portrait {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .generate-chat-button-small {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .generate-chat-button-small:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .activity-expanded-content {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .calendar-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .calendar-day {
      min-height: auto;
    }
  }
</style>
