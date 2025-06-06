<script lang="ts">
  import { getMapImage } from './_helpers/images.svelte';
  import { gs } from '../_state';
  import type { Character, Place, Position } from '../_model';
  import { getCharacterImage } from './_helpers/images.svelte';
  import { uiState } from '../_state/state-ui.svelte';

  const mapImage = $derived(getMapImage('mansion'));
  const debug = $state(false);

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
    if (uiState.selectedPlace?.index === place.index) {
      uiState.selectedPlace = null;
    } else {
      uiState.selectedPlace = place;
    }
  }

  function onCharacterClick(event: MouseEvent, character: Character) {
    event.stopPropagation();
    uiState.selectedPlace = null;
    if (uiState.selectedCharacter?.key === character.key) {
      uiState.selectedCharacter = null;
    } else {
      uiState.selectedCharacter = character;
    }
  }

  function getCharactersInPlace(placeIndex: number) {
    return gs.characters.filter((char) => char.place === placeIndex);
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
    {#each gs.places as place}
      {@const coords = getPlaceCoordinates(place.position)}
      {@const characters = getCharactersInPlace(place.index)}
      <div
        class="place-overlay"
        class:visible={debug || uiState.selectedPlace?.index === place.index}
        style:left={coords.left}
        style:top={coords.top}
        style:width={coords.width}
        style:height={coords.height}
        onclick={() => onPlaceClick(place)}
      >
        {#if debug}
          <div class="place-name">{place.name}</div>
        {/if}
        <div class="characters">
          {#each characters as character (character.key)}
            <img
              src={getCharacterImage(character.key)}
              class="character-portrait"
              onclick={(e) => onCharacterClick(e, character)}
            />
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
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    text-shadow: 1px 1px 2px black;
    opacity: 1;
  }

  .characters {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 2px;
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
  }

  .place-overlay.visible .character-portrait {
    border-color: rgba(255, 255, 255, 1);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }
</style>
