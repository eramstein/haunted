import type { Article } from '@/lib/_model';
import { ItemType } from '@/lib/_model/model-sim.enums';

export const ARTICLES: Partial<Record<ItemType, Article[]>> = {
  [ItemType.FoodIngredient]: [
    { description: 'Carrots', price: 10 },
    { description: 'Potatoes', price: 8 },
    { description: 'Onions', price: 7 },
    { description: 'Garlic', price: 6 },
    { description: 'Tomatoes', price: 9 },
    { description: 'Lettuce', price: 10 },
    { description: 'Spinach', price: 11 },
    { description: 'Broccoli', price: 12 },
    { description: 'Cauliflower', price: 12 },
    { description: 'Cabbage', price: 9 },
    { description: 'Zucchini', price: 8 },
    { description: 'Cucumber', price: 7 },
    { description: 'Bell Pepper', price: 10 },
    { description: 'Chili Pepper', price: 6 },
    { description: 'Celery', price: 9 },
    { description: 'Mushrooms', price: 14 },
    { description: 'Green Beans', price: 10 },
    { description: 'Peas', price: 9 },
    { description: 'Corn', price: 11 },
    { description: 'Eggplant', price: 10 },
    { description: 'Sweet Potato', price: 11 },
    { description: 'Pumpkin', price: 13 },
    { description: 'Radish', price: 7 },
    { description: 'Beetroot', price: 9 },
    { description: 'Turnip', price: 7 },
    { description: 'Leek', price: 8 },
    { description: 'Artichoke', price: 12 },
    { description: 'Asparagus', price: 15 },
    { description: 'Avocado', price: 14 },
    { description: 'Banana', price: 8 },
    { description: 'Apple', price: 9 },
    { description: 'Orange', price: 10 },
    { description: 'Lemon', price: 7 },
    { description: 'Lime', price: 6 },
    { description: 'Strawberries', price: 15 },
    { description: 'Blueberries', price: 18 },
    { description: 'Raspberries', price: 17 },
    { description: 'Blackberries', price: 17 },
    { description: 'Grapes', price: 13 },
    { description: 'Pear', price: 9 },
    { description: 'Peach', price: 10 },
    { description: 'Plum', price: 10 },
    { description: 'Kiwi', price: 9 },
    { description: 'Mango', price: 13 },
    { description: 'Pineapple', price: 14 },
    { description: 'Watermelon', price: 16 },
    { description: 'Cantaloupe', price: 13 },
    { description: 'Coconut', price: 15 },
    { description: 'Chicken Breast', price: 25 },
    { description: 'Chicken Thigh', price: 20 },
    { description: 'Whole Chicken', price: 30 },
    { description: 'Beef Steak', price: 35 },
    { description: 'Ground Beef', price: 28 },
    { description: 'Pork Chop', price: 26 },
    { description: 'Bacon', price: 24 },
    { description: 'Sausage', price: 22 },
    { description: 'Ham', price: 23 },
    { description: 'Turkey', price: 32 },
    { description: 'Lamb', price: 34 },
    { description: 'Salmon', price: 33 },
    { description: 'Tuna', price: 30 },
    { description: 'Shrimp', price: 31 },
    { description: 'Crab', price: 35 },
    { description: 'Lobster', price: 40 },
    { description: 'Eggs (Dozen)', price: 12 },
    { description: 'Milk (1L)', price: 8 },
    { description: 'Cheddar Cheese', price: 14 },
    { description: 'Mozzarella', price: 15 },
    { description: 'Yogurt', price: 10 },
    { description: 'Butter', price: 12 },
    { description: 'Cream', price: 11 },
    { description: 'Bread (Loaf)', price: 9 },
    { description: 'Rice (1kg)', price: 10 },
    { description: 'Pasta', price: 9 },
    { description: 'Flour (1kg)', price: 7 },
    { description: 'Sugar (1kg)', price: 8 },
    { description: 'Salt (500g)', price: 4 },
    { description: 'Pepper (100g)', price: 6 },
    { description: 'Olive Oil (500ml)', price: 15 },
    { description: 'Vegetable Oil (1L)', price: 10 },
    { description: 'Vinegar', price: 6 },
    { description: 'Soy Sauce', price: 8 },
    { description: 'Tomato Sauce', price: 9 },
    { description: 'Canned Beans', price: 7 },
    { description: 'Canned Corn', price: 6 },
    { description: 'Canned Tuna', price: 9 },
    { description: 'Pickles', price: 8 },
    { description: 'Mustard', price: 7 },
    { description: 'Ketchup', price: 7 },
    { description: 'Mayonnaise', price: 10 },
    { description: 'Honey', price: 13 },
    { description: 'Jam', price: 12 },
    { description: 'Peanut Butter', price: 14 },
    { description: 'Almonds (100g)', price: 12 },
    { description: 'Walnuts (100g)', price: 13 },
    { description: 'Cashews (100g)', price: 14 },
    { description: 'Raisins (100g)', price: 8 },
    { description: 'Oats (1kg)', price: 10 },
    { description: 'Cornflakes', price: 9 },
    { description: 'Tofu', price: 11 },
    { description: 'Chickpeas', price: 9 },
    { description: 'Lentils', price: 8 },
    { description: 'Green Tea (box)', price: 10 },
    { description: 'Coffee (ground, 250g)', price: 15 },
  ],
  [ItemType.Meal]: [
    { description: 'Ham Sandwich', price: 18 },
    { description: 'Chicken Salad', price: 22 },
    { description: 'Cheeseburger', price: 25 },
    { description: 'Margherita Pizza', price: 30 },
    { description: 'Pepperoni Pizza', price: 32 },
    { description: 'Spaghetti Bolognese', price: 28 },
    { description: 'Sushi Platter', price: 40 },
    { description: 'Fried Rice with Chicken', price: 26 },
    { description: 'Beef Tacos (3 pcs)', price: 24 },
    { description: 'Vegetable Stir Fry', price: 22 },
    { description: 'Fish and Chips', price: 29 },
    { description: 'Mac and Cheese', price: 20 },
    { description: 'Lasagna', price: 30 },
    { description: 'Pad Thai', price: 28 },
    { description: 'Chinese Takeout Combo', price: 35 },
    { description: 'Chicken Curry with Rice', price: 30 },
    { description: 'Ramen Bowl', price: 27 },
    { description: 'Grilled Cheese Sandwich', price: 16 },
    { description: 'Falafel Wrap', price: 21 },
    { description: 'BBQ Ribs Plate', price: 38 },
  ],
  [ItemType.Drink]: [
    { description: 'Bottled Water', price: 5 },
    { description: 'Sparkling Water', price: 6 },
    { description: 'Coca-Cola', price: 7 },
    { description: 'Pepsi', price: 7 },
    { description: 'Orange Juice', price: 8 },
    { description: 'Apple Juice', price: 8 },
    { description: 'Lemonade', price: 6 },
    { description: 'Iced Tea', price: 7 },
    { description: 'Energy Drink', price: 10 },
    { description: 'Milkshake (Vanilla)', price: 12 },
    { description: 'Hot Coffee', price: 9 },
    { description: 'Iced Coffee', price: 10 },
    { description: 'Green Tea', price: 8 },
    { description: 'Black Tea', price: 7 },
    { description: 'Red Wine (Glass)', price: 15 },
    { description: 'White Wine (Glass)', price: 14 },
    { description: 'Beer (Bottle)', price: 12 },
    { description: 'Whiskey (Shot)', price: 18 },
    { description: 'Cocktail (Mojito)', price: 20 },
    { description: 'Smoothie (Berry Mix)', price: 13 },
  ],
};
