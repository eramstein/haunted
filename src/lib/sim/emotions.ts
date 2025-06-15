import type {
  Character,
  CompositeEmotionType,
  DominantEmotion,
  Emotion,
  EmotionUpdate,
} from '../_model/model-sim';
import { EmotionType } from '../_model/model-sim.enums';
import { gs } from '../_state/main.svelte';
import { clamp } from './_utils/math';

export const POSITIVE_EMOTIONS = [EmotionType.Joy, EmotionType.Anticipation, EmotionType.Trust];
export const NEGATIVE_EMOTIONS = [
  EmotionType.Sadness,
  EmotionType.Anger,
  EmotionType.Fear,
  EmotionType.Disgust,
];
export const NEUTRAL_EMOTIONS = [EmotionType.Surprise];

const COMPOSITE_EMOTIONS: CompositeEmotionType[] = [
  // Primary dyads from Plutchik's Wheel
  { name: 'loving', components: [EmotionType.Joy, EmotionType.Trust] },
  { name: 'submissive', components: [EmotionType.Trust, EmotionType.Fear] },
  { name: 'awed', components: [EmotionType.Fear, EmotionType.Surprise] },
  { name: 'disapproving', components: [EmotionType.Surprise, EmotionType.Disgust] },
  { name: 'remorseful', components: [EmotionType.Disgust, EmotionType.Sadness] },
  { name: 'contemptuous', components: [EmotionType.Anger, EmotionType.Disgust] },
  { name: 'aggressive', components: [EmotionType.Anger, EmotionType.Anticipation] },
  { name: 'optimistic', components: [EmotionType.Anticipation, EmotionType.Joy] },

  // Secondary/common composite emotions
  { name: 'envious', components: [EmotionType.Sadness, EmotionType.Anger] },
  { name: 'bitter', components: [EmotionType.Sadness, EmotionType.Disgust] },
  { name: 'hopeful', components: [EmotionType.Trust, EmotionType.Anticipation] },
  { name: 'anxious', components: [EmotionType.Fear, EmotionType.Anticipation] },
  { name: 'delighted', components: [EmotionType.Joy, EmotionType.Surprise] },
  { name: 'curious', components: [EmotionType.Anticipation, EmotionType.Surprise] },
  { name: 'sentimental', components: [EmotionType.Sadness, EmotionType.Joy] },
];

// Create a Map for fast lookup of composite emotions
const COMPOSITE_EMOTIONS_MAP = new Map<string, CompositeEmotionType>();

// Helper function to create a consistent key from two emotion types
function createEmotionPairKey(type1: EmotionType, type2: EmotionType): string {
  // Sort the types to ensure consistent key regardless of order
  return [type1, type2].sort().join('|');
}

// Initialize the map with composite emotions
COMPOSITE_EMOTIONS.forEach((emotion) => {
  const [type1, type2] = emotion.components;
  const key = createEmotionPairKey(type1, type2);
  COMPOSITE_EMOTIONS_MAP.set(key, emotion);
});

// Helper function to get composite emotion from two emotion types
export function getCompositeEmotion(
  type1: EmotionType,
  type2: EmotionType
): CompositeEmotionType | undefined {
  const key = createEmotionPairKey(type1, type2);
  return COMPOSITE_EMOTIONS_MAP.get(key);
}

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

export function computeDominantEmotion(emotions: Emotion[]): DominantEmotion | null {
  if (emotions.length === 0) return null;

  const sortedEmotions = [...emotions].sort((a, b) => b.currentIntensity - a.currentIntensity);
  const [highest, secondHighest] = sortedEmotions;

  // If the highest emotion is too low, return null
  if (highest.currentIntensity < 30) return null;

  // If the top 2 are close, return composite emotion
  if (highest.currentIntensity - secondHighest.currentIntensity < 20) {
    const composite = getCompositeEmotion(highest.type, secondHighest.type);
    if (composite) {
      return { name: composite.name, intensity: highest.currentIntensity };
    }
  }

  // Else, return the dominant emotion
  return {
    name: highest.type,
    intensity: highest.currentIntensity,
  };
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

export function applyEmotionUpdate(characterId: number, update: EmotionUpdate) {
  const character = gs.characters[characterId];
  const emotion = character.emotions.byType[update.type];
  const newValue = clamp(emotion.currentIntensity + update.delta * emotion.volatility, 0, 100);
  updateEmotionValue(update.type, characterId, newValue);
}

export function describeEmotion(adjective: string, intensity: number): string {
  if (intensity <= 0) return `not ${adjective}`;
  if (intensity < 20) return `barely ${adjective}`;
  if (intensity < 40) return `slightly ${adjective}`;
  if (intensity < 60) return `${adjective}`;
  if (intensity < 80) return `very ${adjective}`;
  return `intensely ${adjective}`;
}
