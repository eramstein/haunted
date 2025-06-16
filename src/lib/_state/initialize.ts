import type { State } from '../_model/model-sim';
import { ItemType } from '../_model/model-sim.enums';
import { initialState } from './state-sim.svelte';
import { addItem } from '../sim/items';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';
import { resetVectorDatabase } from '../llm/vector-db';
import { resetIndexDB } from '../llm/index-db';
import { getRandomItemFromArray } from '../sim/_utils/random';
import { ARTICLES } from '@/data/world/items';

export async function createNewSimState(): Promise<State> {
  // add some initial items
  const kitchenId = PLACES_IDS_BY_TYPE.kitchen;
  if (kitchenId) {
    initialState.characters.forEach((c, charIndex) => {
      Array.from({ length: 1 }, () =>
        addItem({
          type: ItemType.Meal,
          owner: charIndex,
          location: kitchenId,
          ...getRandomItemFromArray(ARTICLES[ItemType.Meal] || []),
        })
      );
      Array.from({ length: 3 }, () =>
        addItem({
          type: ItemType.FoodIngredient,
          owner: charIndex,
          location: kitchenId,
          ...getRandomItemFromArray(ARTICLES[ItemType.FoodIngredient] || []),
        })
      );
    });
  } else {
    throw new Error('Kitchen not found for initial items');
  }

  //reset vector database and IndexDB
  await resetVectorDatabase();
  await resetIndexDB();

  return {
    ...initialState,
  };
}
