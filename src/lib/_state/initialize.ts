import type { State } from '../_model/model-sim';
import { ItemType } from '../_model/model-sim.enums';
import { initialState } from './state-sim.svelte';
import { addItem } from '../sim/items';

export function createNewSimState(): State {
  // add some initial items
  const kitchen = initialState.places.findIndex((p) => p.name === 'Kitchen');
  if (kitchen) {
    initialState.characters.forEach((c, charIndex) => {
      Array.from({ length: 0 }, () =>
        addItem({
          type: ItemType.Meal,
          description: 'A sandwich',
          owner: charIndex,
          location: kitchen,
        })
      );
      Array.from({ length: 1 }, () =>
        addItem({
          type: ItemType.FoodIngredient,
          description: 'Vegetables',
          owner: charIndex,
          location: kitchen,
        })
      );
    });
  } else {
    throw new Error('Kitchen not found for initial items');
  }
  return {
    ...initialState,
  };
}
