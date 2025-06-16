import type { Activity, Character } from '@/lib/_model/model-sim';
import { addItem } from '../items';
import { config, itemCartSize } from '@/lib/_config';
import { ARTICLES } from '@/data/world/items';
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

  // progress activity
  activity.progress += config.actionSpeed.buy;
  if (activity.progress < 100) {
    return;
  }

  // when done, add items
  const itemType = activity.target;
  for (let i = 0; i < itemCartSize[itemType]; i++) {
    const article = getRandomItemFromArray(ARTICLES[itemType] || []);
    if (article.price <= character.money) {
      character.money -= article.price;
      addItem({
        type: itemType,
        owner: character.id,
        location: character.place,
        ...article,
      });
    } else {
      break;
    }
  }
}
