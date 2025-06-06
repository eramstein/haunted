<script lang="ts">
  import { gs, uiState } from '../_state';
  import { getTime } from '../sim';
  import { getCharacterImage, getPlaceImage } from './_helpers';

  const viewedPlace = $derived(gs.places[uiState.currentPlace]);
  const presentCharacters = $derived(
    gs.characters.filter((character) => character.place === uiState.currentPlace)
  );
</script>

<div
  class="place-container"
  style="background-image: url({getPlaceImage(viewedPlace.image || viewedPlace.name)})"
>
  <div class="characters">
    {#each presentCharacters as character (character.key)}
      <div
        style="background-image: url({getCharacterImage(character.key)})"
        class="character"
      ></div>
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
    gap: 20px;
  }
  .character {
    width: 270px;
    height: 270px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center center;
    border: 10px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
</style>
