<script lang="ts">
  import { gs, uiState } from '../_state';
  import { getCharacterImage, getPlaceImage } from './_helpers';

  const viewedPlace = $derived(gs.places[gs.player.place] || gs.places[0]);
  const presentCharacters = $derived(
    gs.characters.filter((character) => character.place === gs.player.place)
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
        onclick={() => {
          uiState.selectedCharacter = character;
        }}
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
    flex-wrap: wrap;
    width: 100vh;
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
