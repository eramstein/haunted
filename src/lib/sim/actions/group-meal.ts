import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityTag, ActivityType, ItemType } from '@/lib/_model/model-sim.enums';
import { getInviteList, inviteOrScheduleGroupActivity } from '../activities-group';
import { getItemsByTypeAndOwner, removeItem } from '../items';
import { getRandomItemFromArray } from '../_utils/random';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';
import { moveToActivity } from './move';
import { config } from '@/lib/_config/config';

export function setGroupMealTask(character: Character) {
  const invited = getInviteList(character, ActivityType.GroupMeal);
  const { place, tags } = selectPlaceToEat([character, ...invited]);
  const createdActivity = inviteOrScheduleGroupActivity(
    character,
    invited,
    place,
    ActivityType.GroupMeal,
    tags
  );
  // if cook together, prepare meal
  if (createdActivity?.tags?.homeCooking) {
    createdActivity?.participants?.forEach((p) => {
      const meals = getItemsByTypeAndOwner(ItemType.Meal, character.id);
      if (!meals.length) {
        character.activities.unshift({
          type: ActivityType.PrepareMeal,
          progress: 0,
          target: null,
        });
      }
    });
  }
}

// decide where to eat based on money and available meals
// - kitchen -> cook together
// - dininig room -> order delivery
// - restaurant
function selectPlaceToEat(characters: Character[]): {
  place: number;
  tags: Partial<Record<ActivityTag, any>>;
} {
  let charactersWithMeals = 0;
  let charactersWithMoney = 0;
  characters.forEach((c) => {
    if (getItemsByTypeAndOwner(ItemType.Meal, c.id).length > 0) {
      charactersWithMeals++;
    }
    if (c.money > 100) {
      charactersWithMoney++;
    }
  });
  if (charactersWithMoney >= charactersWithMeals) {
    return getRandomItemFromArray([
      { place: PLACES_IDS_BY_TYPE.diningRoom, tags: { [ActivityTag.Delivery]: true } },
      { place: PLACES_IDS_BY_TYPE.restaurant, tags: { [ActivityTag.AtRestaurant]: true } },
    ]);
  }
  return {
    place: PLACES_IDS_BY_TYPE.kitchen,
    tags: { [ActivityTag.HomeCooking]: true },
  };
}

export function groupMeal(character: Character, activity: Activity<ActivityType.GroupMeal>) {
  if (moveToActivity(character, activity)) {
    return;
  }
  activity.progress += config.actionSpeed.chat;
  character.needs.social -= config.needsRefill.chat;
  if (character.needs.social < 0) {
    character.needs.social = 0;
  }
  if (activity.progress >= 100) {
    if (activity.tags?.[ActivityTag.Delivery] || activity.tags?.[ActivityTag.AtRestaurant]) {
      // case: restaurant or delivery -> pay for meal
      character.money -= 100;
      character.needs.food = 0;
    } else {
      // case: kitchen -> use a meal
      const meals = getItemsByTypeAndOwner(ItemType.Meal, character.id);
      if (meals.length > 0) {
        removeItem(meals[0].id);
        character.needs.food = 0;
      }
    }
  }
}
