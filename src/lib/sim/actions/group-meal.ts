import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityType, ItemType } from '@/lib/_model/model-sim.enums';
import { getInviteList, inviteOrScheduleGroupActivity } from '../activities-group';
import { getItemsByTypeAndOwner, removeItem } from '../items';
import { getRandomItemFromArray } from '../_utils/random';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';
import { moveToActivity } from './move';
import { config } from '@/lib/_config/config';

enum MealType {
  Cooked,
  Delivered,
  Restaurant,
}

export function setGroupMealTask(character: Character) {
  const invited = getInviteList(character, ActivityType.GroupMeal);
  const place = selectPlaceToEat([character, ...invited]);
  const createdActivity = inviteOrScheduleGroupActivity(
    character,
    invited,
    place,
    ActivityType.GroupMeal
  );
  // if cook together, prepare meal
  if (createdActivity?.target === PLACES_IDS_BY_TYPE.kitchen) {
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
function selectPlaceToEat(characters: Character[]) {
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
    getRandomItemFromArray<number>([PLACES_IDS_BY_TYPE.restaurant, PLACES_IDS_BY_TYPE.diningRoom]);
  }
  return PLACES_IDS_BY_TYPE.kitchen;
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
    if (groupMealType(activity) !== MealType.Cooked) {
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

function groupMealType(activity: Activity<ActivityType.GroupMeal>) {
  if (activity.target === PLACES_IDS_BY_TYPE.kitchen) {
    return MealType.Cooked;
  } else if (activity.target === PLACES_IDS_BY_TYPE.restaurant) {
    return MealType.Restaurant;
  } else {
    return MealType.Delivered;
  }
}
