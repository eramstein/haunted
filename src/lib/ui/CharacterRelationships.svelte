<script lang="ts">
  import { gs } from '../_state';
  import type { Character, Relationship, RelationshipUpdate } from '../_model/model-sim';
  import { getCharacterImage } from './_helpers/images.svelte';
  import { getChatsForCharacters } from '../llm/index-db';
  import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
  import { formatDate, getFeelingColor } from './_helpers';
  import { RelationshipFeeling } from '../_model/model-sim.enums';
  import { updateFeelingValue } from '../sim/relationships';
  import { getTime } from '../sim';

  let props = $props<{
    characterId: number;
  }>();

  let relationships = $state<
    Array<{
      character: Character;
      relationship: Relationship;
    }>
  >([]);

  let selectedFeeling = $state<{ feeling: RelationshipFeeling; character: Character } | null>(null);
  let selectedCharacter = $state<Character | null>(null);
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

  function updateFeeling(value: number) {
    if (!selectedFeeling) return;
    updateFeelingValue(
      selectedFeeling.feeling,
      props.characterId,
      selectedFeeling.character.id,
      value
    );
  }

  async function showFeelingUpdates(feeling: RelationshipFeeling, character: Character) {
    selectedFeeling = { feeling, character };

    // Fetch chats for the last 24 hours
    const endTime = gs.time.ellapsedTime;
    const startTime = endTime - 24 * 60 * 60; // 24 hours ago

    try {
      const chats = await getChatsForCharacters(
        [props.characterId, character.id],
        startTime,
        endTime
      );
      // Filter chats that include both characters and have relationUpdates for this feeling
      relationshipUpdates = chats
        .flatMap(
          (chat) =>
            chat.content?.relationUpdates?.map((update) => ({
              ...update,
              timestamp: chat.timestamp,
              activityType: LABELS_ACTIVITY_TYPES[chat.activityType],
            })) || []
        )
        .filter(
          (update) =>
            update.from === gs.characters[props.characterId].name &&
            update.toward === character.name &&
            update.feeling === feeling
        );
    } catch (error) {
      console.error('Failed to fetch relationship relationUpdates:', error);
    }
  }

  function togglePortraitSelection(character: Character) {
    selectedCharacter = selectedCharacter?.id === character.id ? null : character;
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
            class:selected={selectedCharacter?.id === rel.character.id}
            title={rel.character.name}
            onclick={() => togglePortraitSelection(rel.character)}
          />
          <div class="character-name">{rel.character.name}</div>
          <div class="relationship-status">{rel.relationship.status}</div>
          <div class="feelings">
            {#each Object.values(RelationshipFeeling) as feeling}
              {#if selectedCharacter?.id === rel.character.id || rel.relationship.feelings[feeling]}
                <div
                  class="feeling-item"
                  onclick={() => showFeelingUpdates(feeling, rel.character)}
                >
                  <span class="feeling-name">{feeling}</span>
                  <span
                    class="feeling-value"
                    style="color: {getFeelingColor(rel.relationship.feelings[feeling] || 0)}"
                  >
                    {rel.relationship.feelings[feeling] || 0}
                  </span>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if selectedFeeling}
    <div class="relation-updates-section">
      <h4>Updates for {selectedFeeling.feeling} with {selectedFeeling.character.name}</h4>
      <div class="feeling-update-controls">
        <label for="feeling-value">Update value:</label>
        <input
          type="number"
          id="feeling-value"
          min="-100"
          max="100"
          value={gs.characters[props.characterId].relationships[selectedFeeling.character.id]
            .feelings[selectedFeeling.feeling] || 0}
          onchange={(e) => updateFeeling(Number((e.target as HTMLInputElement).value))}
        />
      </div>
      {#if relationshipUpdates.length === 0}
        <p class="no-relation-updates">No relationUpdates found for this feeling.</p>
      {:else}
        <table class="relation-updates-table">
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
                <td>{formatDate(getTime(update.timestamp))}</td>
                <td
                  class="delta-cell"
                  class:positive={update.delta > 0}
                  class:negative={update.delta < 0}
                >
                  {update.delta > 0 ? '+' : ''}{update.delta}
                </td>
                <td class="cause-cell">{update.cause}</td>
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
    cursor: pointer;
    transition: all 0.2s;
  }

  .character-portrait:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .character-portrait.selected {
    border: 2px solid #fff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
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

  .relation-updates-section {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .no-relation-updates {
    color: #888;
    font-style: italic;
  }

  .relation-updates-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .relation-updates-table th,
  .relation-updates-table td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .relation-updates-table th {
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

  .cause-cell {
    color: #888;
    font-style: italic;
  }

  .activity-cell {
    text-transform: capitalize;
  }

  .feeling-update-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 1rem 0;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .feeling-update-controls label {
    color: #fff;
    font-size: 0.9rem;
  }

  .feeling-update-controls input {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    width: 80px;
  }

  .feeling-update-controls input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
  }

  .feeling-update-controls input::-webkit-inner-spin-button,
  .feeling-update-controls input::-webkit-outer-spin-button {
    opacity: 1;
  }
</style>
