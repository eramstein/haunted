<script lang="ts">
  import { gs } from '../_state';
  import type { Item } from '../_model/model-sim';
  import { splitCamelCase } from './_helpers';
  import { getItemsByOwner } from '../sim/items';

  let props = $props<{
    characterId: number;
  }>();

  let character = $derived(gs.characters.find((c) => c.id === props.characterId));
  let items = $derived(getItemsByOwner(props.characterId));
  let money = $derived(character?.money || 0);

  let selectedItem = $state<Item | null>(null);

  function formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  let groupedItems = $derived(() => {
    const groups: Record<string, Item[]> = {};
    items.forEach((item) => {
      const type = item.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
    });
    return groups;
  });
</script>

<div class="character-items">
  <h3>Items & Money</h3>

  <div class="money-section">
    <div class="money-amount">{formatMoney(money)}</div>
  </div>

  <div class="items-section">
    {#if items.length === 0}
      <p class="no-items">No items found</p>
    {:else}
      {#each Object.entries(groupedItems()) as [type, typeItems]}
        <div class="item-group">
          <h5 class="group-title">
            <span class="group-name">{splitCamelCase(type)}</span>
            <span class="group-count">{typeItems.length}</span>
          </h5>
          <div class="items-grid">
            {#each typeItems as item}
              <div class="item-card" class:selected={selectedItem?.id === item.id}>
                <div class="item-value">{formatMoney(item.price)}</div>
                <div class="item-description">{item.description}</div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .character-items {
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

  h5 {
    margin: 1.5rem 0 0.75rem 0;
    font-size: 1.1rem;
    color: #fff;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .group-name {
    text-transform: capitalize;
  }

  .group-count {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #aaa;
  }

  .money-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .money-amount {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4caf50;
  }

  .no-items {
    color: #888;
    font-style: italic;
  }

  .item-group {
    margin-bottom: 1.5rem;
  }

  .group-title {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .item-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .item-card:hover {
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.15);
  }

  .item-card.selected {
    border: 2px solid #fff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }

  .item-value {
    color: #4caf50;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .item-description {
    font-size: 0.85rem;
    color: #ccc;
    line-height: 1.2;
  }
</style>
