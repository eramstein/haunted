import type { Character, Emotion } from '../_model/model-sim';
import { EmotionType } from '../_model/model-sim.enums';
import { gs } from '../_state/main.svelte';

export const POSITIVE_EMOTIONS = [EmotionType.Joy, EmotionType.Anticipation, EmotionType.Trust];
export const NEGATIVE_EMOTIONS = [
  EmotionType.Sadness,
  EmotionType.Anger,
  EmotionType.Fear,
  EmotionType.Disgust,
];
export const NEUTRAL_EMOTIONS = [EmotionType.Surprise];

export function updateEmotionValue(emotion: EmotionType, characterId: number, value: number) {
  const character = gs.characters[characterId];
  const emotions = Object.values(character.emotions.byType);
  character.emotions.byType[emotion].currentIntensity = value;
  character.emotions.mood = computeMood(emotions);
  character.emotions.dominantEmotion = computeDominantEmotion(emotions);
}

function computeMood(emotions: Emotion[]) {
  let score = 0;
  emotions.forEach((emotion) => {
    if (POSITIVE_EMOTIONS.includes(emotion.type)) {
      score += emotion.currentIntensity - 50;
    } else if (NEGATIVE_EMOTIONS.includes(emotion.type)) {
      score -= emotion.currentIntensity - 50;
    }
  });
  return Math.round(50 + score / (POSITIVE_EMOTIONS.length + NEGATIVE_EMOTIONS.length));
}

function computeDominantEmotion(emotions: Emotion[]) {
  let dominantEmotion = null;
  let maxIntensity = 70;
  emotions.forEach((emotion) => {
    if (emotion.currentIntensity > maxIntensity) {
      dominantEmotion = emotion.type;
      maxIntensity = emotion.currentIntensity;
    }
  });
  return dominantEmotion;
}

export function getMoodLabel(mood: number): string {
  if (mood >= 80) return 'Very Happy';
  if (mood >= 60) return 'Happy';
  if (mood >= 40) return 'Fine';
  if (mood >= 20) return 'Sad';
  return 'Very Sad';
}

function interpolateColor(value: number, startColor: string, endColor: string): string {
  // Convert hex to RGB
  const start = startColor.match(/\w\w/g)?.map((c) => parseInt(c, 16)) || [0, 0, 0];
  const end = endColor.match(/\w\w/g)?.map((c) => parseInt(c, 16)) || [0, 0, 0];

  // Interpolate each channel
  const r = Math.round(start[0] + (end[0] - start[0]) * value);
  const g = Math.round(start[1] + (end[1] - start[1]) * value);
  const b = Math.round(start[2] + (end[2] - start[2]) * value);

  return `rgb(${r}, ${g}, ${b})`;
}

export function getEmotionColor(type: EmotionType, value: number): string {
  if (NEUTRAL_EMOTIONS.includes(type)) {
    return '#9E9E9E'; // Gray for neutral emotions
  }

  // Normalize value to 0-1 range
  const normalizedValue = value / 100;

  if (POSITIVE_EMOTIONS.includes(type)) {
    // For positive emotions, interpolate from red (0) to green (100)
    return interpolateColor(normalizedValue, '#F44336', '#4CAF50');
  } else if (NEGATIVE_EMOTIONS.includes(type)) {
    // For negative emotions, interpolate from green (0) to red (100)
    return interpolateColor(normalizedValue, '#4CAF50', '#F44336');
  }

  return '#9E9E9E'; // Fallback to gray
}

function decayEmotions(character: Character) {
  const emotions = Object.values(character.emotions.byType);
  emotions.forEach((emotion) => {
    const decay = Math.round(
      (emotion.baselineIntensity - emotion.currentIntensity) * emotion.decayRate
    );
    updateEmotionValue(emotion.type, character.id, emotion.currentIntensity + decay);
  });
}

export function decayEmotionsForAllCharacters() {
  gs.characters.forEach((character) => {
    decayEmotions(character);
  });
}
