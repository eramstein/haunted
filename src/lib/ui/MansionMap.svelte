<script lang="ts">
  import { send, receive } from './_transitions/crossfade';

  import { getMapImage } from './_helpers/images.svelte';
  import { gs } from '../_state';
  import { UiView, type Character, type Place, type Position } from '../_model';
  import {
    getCharacterImage,
    getIconSheet,
    getActionIconPosition,
    getPlaceImage,
  } from './_helpers/images.svelte';
  import { uiState } from '../_state/state-ui.svelte';
  import ActivityIcon from './ActivityIcon.svelte';
  import { ActivityType } from '../_model/model-sim.enums';

  const mapImage = $derived(getMapImage('mansion'));
  const debug = false;

  let imageSize = $state(0);
  let imageLeft = $state(0);

  function updateImageDimensions(img: HTMLImageElement) {
    const rect = img.getBoundingClientRect();
    // the container is 100% of the width, the image is centered
    const fullWidth = rect.width;
    imageSize = rect.height;
    imageLeft = (fullWidth - imageSize) / 2;
  }

  function logClickedPosition(event: MouseEvent) {
    if (!debug) return;
    const rect = (event.currentTarget as HTMLImageElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left - imageLeft) / imageSize) * 100;
    const y = ((event.clientY - rect.top) / imageSize) * 100;
    console.log(`Clicked position: x=${x.toFixed(2)}%, y=${y.toFixed(2)}%`);
  }

  function getPlaceCoordinates(position: Position) {
    return {
      left: `${imageLeft + (position.x * imageSize) / 100}px`,
      top: `${(position.y * imageSize) / 100}px`,
      width: `${(position.width * imageSize) / 100}px`,
      height: `${(position.height * imageSize) / 100}px`,
    };
  }

  function onPlaceClick(place: Place) {
    uiState.selectedCharacter = null;
    if (uiState.selectedPlace?.id === place.id) {
      uiState.selectedPlace = null;
    } else {
      uiState.selectedPlace = place;
    }
  }

  function onPlaceDoubleClick(place: Place) {
    uiState.selectedPlace = null;
    uiState.selectedCharacter = null;
    uiState.currentView = UiView.Place;
    gs.player.place = place.id;
  }

  function onCharacterClick(event: MouseEvent, character: Character) {
    event.stopPropagation();
    uiState.selectedPlace = null;
    if (uiState.selectedCharacter?.id === character.id) {
      uiState.selectedCharacter = null;
    } else {
      uiState.selectedCharacter = character;
    }
  }

  function getCharactersInPlace(placeId: number) {
    return gs.characters.filter((char) => char.place === placeId);
  }
</script>

<div class="mansion-map">
  <div class="map-container">
    <img
      src={mapImage}
      class="map-background"
      onload={(e) => updateImageDimensions(e.currentTarget as HTMLImageElement)}
      onclick={logClickedPosition}
    />
    <div class="night-overlay" style="opacity: {1 - gs.time.lightLevel}"></div>
    {#each gs.places as place}
      {@const coords = getPlaceCoordinates(place.position)}
      {@const characters = getCharactersInPlace(place.id)}
      <div
        class="place-overlay"
        class:visible={debug || uiState.selectedPlace?.id === place.id}
        style:left={coords.left}
        style:top={coords.top}
        style:width={coords.width}
        style:height={coords.height}
        onclick={() => onPlaceClick(place)}
        ondblclick={() => onPlaceDoubleClick(place)}
      >
        {#if debug || place.outside}
          <div class="place-info">
            {#if place.outside}
              <img
                src={getPlaceImage(place.image || place.name)}
                class="place-image"
                alt={place.name}
              />
            {/if}
            <div class="place-name">{place.name}</div>
          </div>
        {/if}
        <div class="characters">
          {#each characters as character (character.id)}
            <div
              class="character-container"
              in:receive={{ key: character.id }}
              out:send={{ key: character.id }}
            >
              <img
                src={getCharacterImage(character.name)}
                class="character-portrait"
                onclick={(e) => onCharacterClick(e, character)}
              />
              {#if character.activities.length}
                <ActivityIcon
                  activity={character.activities[0]}
                  size={20}
                  position="absolute"
                  className="bottom-right"
                />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .mansion-map {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .map-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .map-background {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    user-select: none;
    -webkit-user-select: none;
  }

  .place-overlay {
    position: absolute;
    border: 2px solid rgba(255, 255, 255, 0);
    background-color: rgba(0, 0, 0, 0);
    cursor: pointer;
  }

  .place-overlay.visible {
    border: 2px solid rgba(255, 255, 255, 0.5);
    background-color: rgba(0, 0, 0, 0.2);
  }

  .place-overlay.visible:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }

  .place-name {
    color: white;
    text-shadow: 1px 1px 2px black;
    opacity: 1;
  }

  .place-info {
    position: absolute;
    bottom: -45px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .place-image {
    width: 80px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    object-fit: cover;
  }

  .characters {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    justify-content: center;
    width: 200px;
  }

  .character-container {
    position: relative;
  }

  .character-portrait {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    object-fit: cover;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 2px;
    user-select: none;
    -webkit-user-select: none;
  }

  .night-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    pointer-events: none;
    transition: opacity 1s ease-in-out;
  }
</style>
