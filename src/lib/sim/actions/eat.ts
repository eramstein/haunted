import type { Character, Item } from '@/lib/_model/model-sim';
import { getItemsByTypeAndOwner } from '../items';
import { ActivityType, ItemType } from '@/lib/_model/model-sim.enums';

export function eat(character: Character, foodItem: Item) {
  console.log('eat', character.id, foodItem.id);
}

export function setHaveMealTask(character: Character) {
  // are there available meals?
  const meals = getItemsByTypeAndOwner(ItemType.Meal, character.id);
  if (meals.length === 0) {
    // TODO
    console.log(character.name, 'no meals');
    return;
  } else {
    // is the a meal in the place?
    const mealInPlace = meals.find((meal) => meal.locationId === character.place);
    // if yes, eat it
    if (mealInPlace) {
      character.activity = { type: ActivityType.Eat, progress: 0, targetId: mealInPlace.id };
    }
    // if no, pick up a meal
    else {
      character.activity = { type: ActivityType.GoTo, progress: 0, targetId: meals[0].locationId };
    }
  }
}
