<script lang="ts">
  import { getMapImage } from './_helpers/images.svelte';

  const mapImage = $derived(getMapImage('mansion'));
</script>

<div class="mansion-map">
  <img src={mapImage} alt="Mansion Map" class="map-background" />
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

  .map-background {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
