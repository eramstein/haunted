import type { Activity, Character, Item } from '@/lib/_model/model-sim';
import { addItem, getItemsByTypeAndOwner, removeItem } from '../items';
import { ActivityType, ItemType } from '@/lib/_model/model-sim.enums';
import { config } from '@/lib/_config/config';
import { gs } from '@/lib/_state';

export function eat(character: Character, activity: Activity<ActivityType.Eat>) {
  activity.progress += config.actionSpeed.eat;
  if (activity.progress >= 100) {
    character.needs.food = 0;
    if (activity.type === ActivityType.Eat) {
      const targetId = activity.target as string;
      removeItem(targetId);
    }
  }
}

export function cook(character: Character, activity: Activity<ActivityType.Cook>) {
  activity.progress += config.actionSpeed.cook;
  if (activity.type === ActivityType.Cook) {
    const target = activity.target as string[];
    const ingredients = gs.items[target[0]];
    if (activity.progress >= 100) {
      // remove ingredient
      removeItem(target[0]);
      // create meal
      addItem({
        type: ItemType.Meal,
        description: 'Cooked ' + ingredients.description,
        owner: character.id,
        location: character.place,
      });
    }
  }
}

export function setHaveMealTask(character: Character) {
  // are there available meals?
  const meals = getItemsByTypeAndOwner(ItemType.Meal, character.id);
  if (meals.length === 0) {
    // are there ingredients? if yes cook them, else go find some
    const ingredients = getItemsByTypeAndOwner(ItemType.FoodIngredient, character.id);
    if (ingredients.length === 0) {
      // TODO: go shopping
      return;
    }
    const ingredientsInPlace = ingredients.filter(
      (ingredient) => ingredient.location === character.place
    );
    if (ingredientsInPlace.length > 0) {
      character.activity = {
        type: ActivityType.Cook,
        progress: 0,
        target: [ingredientsInPlace[0].id],
      };
    } else {
      character.activity = {
        type: ActivityType.GoTo,
        progress: 0,
        target: ingredients[0].location,
      };
    }
    return;
  } else {
    // is there a meal in the place?
    const mealInPlace = meals.find((meal) => meal.location === character.place);
    // if yes, eat it
    if (mealInPlace) {
      character.activity = {
        type: ActivityType.Eat,
        progress: 0,
        target: mealInPlace.id,
      };
    }
    // if no, pick up a meal
    else {
      character.activity = {
        type: ActivityType.GoTo,
        progress: 0,
        target: meals[0].location,
      };
    }
  }
}
