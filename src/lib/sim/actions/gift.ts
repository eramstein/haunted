import type { Character, Item } from '@/lib/_model/model-sim';
import { getItemsByOwner, getItemsByTypeAndOwner, transferItem } from '../items';
import { ItemType } from '@/lib/_model/model-sim.enums';

export function giftMoney(from: Character, to: Character, amount: number): number {
  if (from.money < amount) {
    console.log('not enough money to gift', from.name, amount);
    return 0;
  }
  from.money -= amount;
  to.money += amount;
  return amount;
}

export function giftFood(
  from: Character,
  to: Character,
  itemDescription?: string
): Item | undefined {
  // if an item desc is passed, use it
  if (itemDescription) {
    const item = getItemsByOwner(from.id).find((item) => item.description === itemDescription);
    if (item) {
      transferItem(item.id, to.id);
      return item;
    }
  }
  // Try to find a Meal owned by 'from'
  const meals = getItemsByTypeAndOwner(ItemType.Meal, from.id);
  if (meals.length > 0) {
    const meal = meals[0];
    transferItem(meal.id, to.id);
    return meal;
  }
  // If no Meal, try to find a FoodIngredient
  const ingredients = getItemsByTypeAndOwner(ItemType.FoodIngredient, from.id);
  if (ingredients.length > 0) {
    const ingredient = ingredients[0];
    transferItem(ingredient.id, to.id);
    return ingredient;
  }
  // Nothing to gift
  return undefined;
}
