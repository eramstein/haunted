import { ItemType, type State } from '../_model/model-sim';
import { initialState } from './state-sim.svelte';
import { addItem } from '../sim/items';

export function createNewSimState(): State {
  // add some initial items
  const kitchen = initialState.places.find((p) => p.name === 'Kitchen');
  if (kitchen) {
    initialState.characters.forEach((c) => {
      addItem({
        type: ItemType.Meal,
        description: 'A sandwich',
        ownerId: c.id,
        locationId: kitchen.index,
      });
    });
  } else {
    throw new Error('Kitchen not found for initial items');
  }
  return {
    ...initialState,
  };
}
