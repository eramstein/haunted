<script lang="ts">
  import type { Place } from '../_model';
  import { getPlaceImage } from './_helpers/images.svelte';

  let props = $props<{
    place: Place;
  }>();
</script>

<div class="place-panel">
  <h2>{props.place.name}</h2>
  <div
    class="place-picture"
    style="background-image: url({getPlaceImage(props.place.image)})"
  ></div>
  <div class="place-details">
    <div class="detail-item">
      <span class="value">{props.place.description}</span>
    </div>
  </div>
</div>

<style>
  .place-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #fff;
  }

  .place-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-item {
    display: flex;
    gap: 0.5rem;
  }

  .label {
    color: #888;
    min-width: 80px;
  }

  .value {
    color: #fff;
  }

  .place-picture {
    width: 400px;
    height: 400px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center center;
  }
</style>
