import type { Character, Item } from '@/lib/_model/model-sim';
import { addItem, getItemsByTypeAndOwner, removeItem } from '../items';
import { ActivityType, ItemType } from '@/lib/_model/model-sim.enums';
import { config } from '@/lib/_config/config';
import { gs } from '@/lib/_state';

export function eat(character: Character) {
  character.activity!.progress += config.actionSpeed.eat;
  if (character.activity!.progress >= 100) {
    character.needs.food.lastMeal = gs.time.ellapsedTime;
    removeItem(character.activity!.targetId);
  }
}

export function cook(character: Character) {
  character.activity!.progress += config.actionSpeed.cook;
  const ingredients = gs.items[character.activity!.targetId];
  if (character.activity!.progress >= 100) {
    // remove ingredient
    removeItem(character.activity!.targetId);
    // create meal
    addItem({
      type: ItemType.Meal,
      description: 'Cooked ' + ingredients.description,
      owner: character.id,
      location: character.place,
    });
  }
}

export function setHaveMealTask(character: Character) {
  // are there available meals?
  const meals = getItemsByTypeAndOwner(ItemType.Meal, character.id);
  if (meals.length === 0) {
    // are there ingredients? if yes cook them, else go find some
    const ingredients = getItemsByTypeAndOwner(ItemType.FoodIngredient, character.id);
    const ingredientsInPlace = ingredients.filter(
      (ingredient) => ingredient.location === character.place
    );
    if (ingredientsInPlace.length > 0) {
      character.activity = {
        type: ActivityType.Cook,
        progress: 0,
        targetId: ingredientsInPlace[0].id,
      };
    } else {
      character.activity = {
        type: ActivityType.GoTo,
        progress: 0,
        targetId: ingredients[0].location,
      };
    }
    return;
  } else {
    // is there a meal in the place?
    const mealInPlace = meals.find((meal) => meal.location === character.place);
    // if yes, eat it
    if (mealInPlace) {
      character.activity = { type: ActivityType.Eat, progress: 0, targetId: mealInPlace.id };
    }
    // if no, pick up a meal
    else {
      character.activity = {
        type: ActivityType.GoTo,
        progress: 0,
        targetId: meals[0].location,
      };
    }
  }
}
