<script lang="ts">
  import { getIconSheet, getActionIconPosition } from './_helpers/images.svelte';
  import type { Activity } from '../_model/model-sim';

  let props = $props<{
    activity: Activity;
    size?: number;
    position?: 'absolute' | 'static';
    className?: string;
  }>();

  const size = $derived(props.size || 32);
  const position = $derived(props.position || 'static');
  const className = $derived(props.className || '');
</script>

<div
  class="activity-icon {className}"
  style="
    background-image: url({getIconSheet('actions')});
    background-position: {getActionIconPosition(props.activity.type, size)};
    width: {size}px;
    height: {size}px;
    position: {position};
  "
></div>

<style>
  .activity-icon {
    background-repeat: no-repeat;
    background-size: auto 100%;
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 2px;
    background-color: rgba(255, 255, 255);
  }
  .bottom-right {
    bottom: 0px;
    right: 0px;
  }
</style>
