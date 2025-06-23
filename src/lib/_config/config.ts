import { EmotionType, ItemType } from '../_model/model-sim.enums';

export const config = {
  actionSpeed: {
    goTo: 100, // 1 minute to go to a place
    eat: 100 / 30, // 30 minutes to eat
    sleep: 100 / 480, // 8 hours to sleep
    cook: 100 / 30, // 30 minutes to eat
    chat: 100 / 60, // 1 hour to chat
    play: 100 / 60, // 1 hour to play
    buy: 100 / 15, // 15 minutes to buy
    work: 100 / 240, // 4 hours to work
  },
  needs: {
    food: 360, // eat every 6 hours
    sleep: 1080, // get sleepy after 18 hours without sleep
    fun: 720, // get bored after 12 hours without fun
    social: 720, // get lonely after 12 hours without social interaction
  },
  // how much needs are fullfilled by game tick
  needsRefill: {
    sleep: 3, // 1 hour of sleep keeps you going 3 hours
    chat: 12, // 1 hour of chat keeps you going 12 hours
    play: 12, // 1 hour of play keeps you going 12 hours
  },
  emotionBaseVolatility: {
    [EmotionType.Joy]: 50,
    [EmotionType.Sadness]: 50,
    [EmotionType.Anger]: 100,
    [EmotionType.Fear]: 100,
    [EmotionType.Surprise]: 100,
    [EmotionType.Anticipation]: 50,
    [EmotionType.Disgust]: 100,
    [EmotionType.Trust]: 50,
  },
  itemCartSize: {
    [ItemType.FoodIngredient]: 10,
    [ItemType.Drink]: 10,
    [ItemType.Meal]: 1,
  },
  itemsMinCost: {
    [ItemType.FoodIngredient]: 10,
    [ItemType.Drink]: 10,
    [ItemType.Meal]: 20,
  },
  // aggregation is adding feeling delta (-1 to +1) squared multiplied by relationSummaryVolatility, so a huge change counts for 10, a medium counts for 2.5
  relationSummaryUpdateTreshold: 20,
  relationSummaryVolatility: 10,
};
