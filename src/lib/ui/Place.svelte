<script lang="ts">
  import { gs, uiState } from '../_state';
  import {
    getCharacterImage,
    getPlaceImage,
    getIconSheet,
    getActionIconPosition,
    getItemIconPosition,
  } from './_helpers';
  import { getItemsByLocation } from '../sim/items';
  import ActivityIcon from './ActivityIcon.svelte';

  const viewedPlace = $derived(gs.places[gs.player.place] || gs.places[0]);
  const presentCharacters = $derived(
    gs.characters.filter((character) => character.place === gs.player.place)
  );
  const presentItems = $derived(getItemsByLocation(viewedPlace.id));

  function getOwnerName(ownerId: number) {
    const owner = gs.characters[ownerId];
    return owner?.name || 'Unknown';
  }
</script>

<div
  class="place-container"
  style="background-image: url({getPlaceImage(viewedPlace.image || viewedPlace.name)})"
>
  <div class="characters">
    {#each presentCharacters as character (character.id)}
      <div class="character-container">
        <div
          style="background-image: url({getCharacterImage(character.name)})"
          class="character"
          onclick={() => {
            uiState.selectedCharacter = character;
          }}
        ></div>
        {#if character.activities.length > 0}
          <ActivityIcon
            activity={character.activities[0]}
            size={32}
            position="absolute"
            className="bottom-right"
          />
        {/if}
      </div>
    {/each}
  </div>

  <div class="items">
    {#each presentItems as item (item.id)}
      <div
        class="item"
        onclick={() => {
          uiState.selectedItem = item;
        }}
      >
        <div
          class="item-icon"
          style="background-image: url({getIconSheet(
            'item-types'
          )}); background-position: {getItemIconPosition(item.type)}"
        ></div>
        <div class="item-info">
          <div class="item-description">
            {item.description}
          </div>
          <div class="item-owner">{getOwnerName(item.owner)}</div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .place-container {
    position: relative;
    width: 100%;
    height: 100vh;
    background-size: cover;
  }
  .characters {
    position: absolute;
    bottom: 100px;
    left: 50px;
    display: flex;
    flex-wrap: wrap;
    width: 100vh;
    gap: 20px;
  }
  .character-container {
    position: relative;
    width: 270px;
    height: 270px;
  }
  .character {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center center;
    border: 10px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
  .items {
    position: absolute;
    top: 50px;
    right: 50px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 300px;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .item:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.5);
  }
  .item-icon {
    width: 32px;
    height: 32px;
    background-repeat: no-repeat;
    background-size: auto 100%;
    flex-shrink: 0;
  }
  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .item-description {
    color: white;
    font-size: 14px;
  }
  .item-owner {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
  }
</style>
