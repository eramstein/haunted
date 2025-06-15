import { EmotionType } from '../_model/model-sim.enums';

export const config = {
  actionSpeed: {
    goTo: 100, // 1 minute to go to a place
    eat: 100 / 30, // 30 minutes to eat
    sleep: 100 / 480, // 8 hours to sleep
    cook: 100 / 30, // 30 minutes to eat
    chat: 100 / 60, // 1 hour to chat
    play: 100 / 60, // 1 hour to play
  },
  needs: {
    food: 360, // eat every 6 hours
    sleep: 1080, // get sleepy after 18 hours without sleep
    fun: 1440, // get bored after 24 hours without fun
    //social: 1440, // get lonely after 24 hours without social interaction
    social: 60,
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
};
