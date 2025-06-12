<script lang="ts">
  import { gs } from '../_state';
  import type { Character, Relationship, RelationshipUpdate } from '../_model/model-sim';
  import { getCharacterImage } from './_helpers/images.svelte';
  import { getChatsForCharacter } from '../llm/index-db';
  import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
  import { formatDate, getFeelingColor } from './_helpers';

  let props = $props<{
    characterId: number;
  }>();

  let relationships = $state<
    Array<{
      character: Character;
      relationship: Relationship;
    }>
  >([]);

  let selectedFeeling = $state<{ feeling: string; character: Character } | null>(null);
  let relationshipUpdates = $state<
    Array<RelationshipUpdate & { timestamp: number; activityType: string }>
  >([]);

  $effect(() => {
    updateRelationships();
  });

  function updateRelationships() {
    const character = gs.characters.find((c) => c.id === props.characterId);
    if (!character) return;

    relationships = gs.characters
      .filter((c) => c.id !== props.characterId)
      .map((otherCharacter) => ({
        character: otherCharacter,
        relationship: character.relationships[otherCharacter.id],
      }));
  }

  async function showFeelingUpdates(feeling: string, character: Character) {
    selectedFeeling = { feeling, character };

    // Fetch chats for the last 24 hours
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000; // 24 hours ago

    try {
      const chats = await getChatsForCharacter(props.characterId.toString(), startTime, endTime);
      // Filter chats that include both characters and have updates for this feeling
      relationshipUpdates = chats
        .flatMap(
          (chat) =>
            chat.content?.updates?.map((update) => ({
              ...update,
              timestamp: chat.timestamp,
              activityType: LABELS_ACTIVITY_TYPES[chat.activityType],
            })) || []
        )
        .filter(
          (update) =>
            (update.from === gs.characters[props.characterId].name ||
              update.toward === gs.characters[props.characterId].name) &&
            update.feeling === feeling
        );
    } catch (error) {
      console.error('Failed to fetch relationship updates:', error);
    }
  }
</script>

<div class="character-relationships">
  <h3>Relationships</h3>
  {#if relationships.length === 0}
    <p class="no-relationships">No relationships found</p>
  {:else}
    <div class="relationships-grid">
      {#each relationships as rel}
        <div class="relationship-column">
          <img
            src={getCharacterImage(rel.character.name)}
            alt={rel.character.name}
            class="character-portrait"
            title={rel.character.name}
          />
          <div class="character-name">{rel.character.name}</div>
          <div class="relationship-status">{rel.relationship.status}</div>
          <div class="feelings">
            {#each Object.entries(rel.relationship.feelings) as [feeling, value]}
              <div class="feeling-item" onclick={() => showFeelingUpdates(feeling, rel.character)}>
                <span class="feeling-name">{feeling}</span>
                <span class="feeling-value" style="color: {getFeelingColor(value)}">{value}</span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if selectedFeeling}
    <div class="updates-section">
      <h4>Updates for {selectedFeeling.feeling} with {selectedFeeling.character.name}</h4>
      {#if relationshipUpdates.length === 0}
        <p class="no-updates">No updates found for this feeling.</p>
      {:else}
        <table class="updates-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Time</th>
              <th>Change</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {#each relationshipUpdates as update}
              <tr>
                <td class="activity-cell">{update.activityType}</td>
                <td>{formatDate(update.timestamp)}</td>
                <td
                  class="delta-cell"
                  class:positive={update.delta > 0}
                  class:negative={update.delta < 0}
                >
                  {update.delta > 0 ? '+' : ''}{update.delta}
                </td>
                <td class="reason-cell">{update.reason}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  {/if}
</div>

<style>
  .character-relationships {
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

  h4 {
    margin: 1.5rem 0 1rem 0;
    font-size: 1.1rem;
    color: #fff;
  }

  .no-relationships {
    color: #888;
    font-style: italic;
  }

  .relationships-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .relationship-column {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .character-portrait {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 0.5rem;
  }

  .character-name {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .relationship-status {
    color: #888;
    font-size: 0.9rem;
    text-transform: capitalize;
    margin-bottom: 0.5rem;
  }

  .feelings {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
  }

  .feeling-item {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .feeling-item:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  .feeling-name {
    text-transform: capitalize;
  }

  .feeling-value {
    color: #888;
  }

  .updates-section {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .no-updates {
    color: #888;
    font-style: italic;
  }

  .updates-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .updates-table th,
  .updates-table td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .updates-table th {
    color: #888;
    font-weight: 500;
    text-transform: uppercase;
    font-size: 0.8rem;
  }

  .delta-cell {
    font-weight: 500;
  }

  .delta-cell.positive {
    color: #4caf50;
  }

  .delta-cell.negative {
    color: #f44336;
  }

  .reason-cell {
    color: #888;
    font-style: italic;
  }

  .activity-cell {
    text-transform: capitalize;
  }
</style>
