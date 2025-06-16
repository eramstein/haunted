import type { Activity, Character } from '@/lib/_model/model-sim';
import { addItem } from '../items';
import { config, itemCartSize, itemPrices } from '@/lib/_config';
import { FOOD_INGREDIENTS } from '@/data/world/items';
import { getRandomItemFromArray } from '../_utils/random';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';

export function buy(character: Character, activity: Activity<ActivityType.Buy>) {
  // check if character is in the grocery store
  if (character.place !== PLACES_IDS_BY_TYPE.groceryStore) {
    character.activities.unshift({
      type: ActivityType.GoTo,
      progress: 0,
      target: PLACES_IDS_BY_TYPE.groceryStore,
    });
    return;
  }

  // how many items the character can buy
  const itemType = activity.target;
  const buyableQuantity = Math.floor(character.money / itemPrices[itemType]);
  if (buyableQuantity === 0) {
    console.log(`${character.name} doesn't have enough money to buy ${itemType}`);
    return;
  }

  // progress activity
  activity.progress += config.actionSpeed.buy;
  if (activity.progress < 100) {
    return;
  }

  // when done, add items
  const boughtQuantity = Math.min(buyableQuantity, itemCartSize[itemType]);
  for (let i = 0; i < boughtQuantity; i++) {
    const itemDescription = getRandomItemFromArray(FOOD_INGREDIENTS);
    character.money -= itemPrices[itemType];
    addItem({
      type: itemType,
      description: itemDescription,
      owner: character.id,
      location: character.place,
    });
  }
}
