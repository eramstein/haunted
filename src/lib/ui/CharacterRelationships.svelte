<script lang="ts">
  import { gs } from '../_state';
  import type { Character, Relationship } from '../_model/model-sim';
  import { getCharacterImage } from './_helpers/images.svelte';

  let props = $props<{
    characterId: number;
  }>();

  let relationships = $state<
    Array<{
      character: Character;
      relationship: Relationship;
    }>
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
              <div class="feeling-item">
                <span class="feeling-name">{feeling}</span>
                <span class="feeling-value">{value}</span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
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
  }

  .feeling-name {
    text-transform: capitalize;
  }

  .feeling-value {
    color: #888;
  }
</style>
