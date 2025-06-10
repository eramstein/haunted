import type { State } from '../_model/model-sim';
import { ItemType } from '../_model/model-sim.enums';
import { initialState } from './state-sim.svelte';
import { addItem } from '../sim/items';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';

export function createNewSimState(): State {
  // add some initial items
  const kitchenId = PLACES_IDS_BY_TYPE.kitchen;
  if (kitchenId) {
    initialState.characters.forEach((c, charIndex) => {
      Array.from({ length: 0 }, () =>
        addItem({
          type: ItemType.Meal,
          description: 'A sandwich',
          owner: charIndex,
          location: kitchenId,
        })
      );
      Array.from({ length: 1 }, () =>
        addItem({
          type: ItemType.FoodIngredient,
          description: 'Vegetables',
          owner: charIndex,
          location: kitchenId,
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
