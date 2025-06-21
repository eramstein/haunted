import type { Activity, Character } from '@/lib/_model/model-sim';
import { addItem } from '../items';
import { config } from '@/lib/_config';
import { ARTICLES } from '@/data/world/items';
import { getRandomItemFromArray } from '../_utils/random';
import { ActivityType, ObjectiveType } from '@/lib/_model/model-sim.enums';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';
import { changeObjective } from '../objectives';
import { progressActivity } from '..';

export function buy(character: Character, activity: Activity<ActivityType.Buy>) {
  // check if character is in the grocery store
  if (character.place !== PLACES_IDS_BY_TYPE.groceryStore) {
    character.activities.unshift({
      type: ActivityType.GoTo,
      progress: 0,
      target: PLACES_IDS_BY_TYPE.groceryStore,
    });
    progressActivity(character);
    return;
  }

  // progress activity
  activity.progress += config.actionSpeed.buy;
  if (activity.progress < 100) {
    return;
  }

  // when done, add items
  const itemType = activity.target;
  let boughtCount = 0;
  for (let i = 0; i < config.itemCartSize[itemType]; i++) {
    const article = getRandomItemFromArray(ARTICLES[itemType] || []);
    if (article.price <= character.money) {
      character.money -= article.price;
      boughtCount++;
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
  if (boughtCount === 0) {
    changeObjective(
      character,
      { type: ObjectiveType.GetMoney },
      'not enough money to buy ' + itemType
    );
  }
}
