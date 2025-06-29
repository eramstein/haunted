import {
  ActivityType,
  EmotionType,
  ItemType,
  RelationshipFeeling,
} from '../_model/model-sim.enums';

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
    groupMeal: 100 / 60, // 1 hour to eat together
    romance: 100 / 120, // 2 hour to romance
  },
  needs: {
    food: 360, // eat every 6 hours
    sleep: 1080, // get sleepy after 18 hours without sleep
    fun: 720, // get bored after 12 hours without fun
    social: 720, // get lonely after 12 hours without social interaction
    intimacy: 2880, // get lonely after 48 hours without intimacy
  },
  // how much needs are fullfilled by game tick
  needsRefill: {
    sleep: 3, // 1 hour of sleep keeps you going 3 hours
    chat: 12, // 1 hour of chat keeps you going 12 hours
    play: 12, // 1 hour of play keeps you going 12 hours
    intimacy: 24, // 1 hour of romance keeps you going 24 hours
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

export const activityAffinityWeights: Partial<
  Record<ActivityType, Partial<Record<RelationshipFeeling, number>>>
> = {
  [ActivityType.Chat]: {
    affection: 0.8,
    trust: 0.6,
    gratitude: 0.4,
    respect: 0.3,
    admiration: 0.2,

    annoyance: -0.8,
    resentment: -0.7,
    suspicion: -0.5,
    jealousy: -0.3,
  },

  [ActivityType.Play]: {
    trust: 0.7,
    rivalry: 0.5,
    admiration: 0.4,
    affection: 0.3,
    respect: 0.3,

    annoyance: -0.7,
    resentment: -0.6,
    suspicion: -0.5,
    intimidation: -0.4,
    envy: -0.3,
  },

  [ActivityType.Romance]: {
    attraction: 1,
    love: 1,
  },
};
