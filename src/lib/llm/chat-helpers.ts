import { LABELS_FEELINGS } from '../_config/labels';
import type { Character, Problem, Relationship } from '../_model';
import {
  ActivityType,
  ItemType,
  ProblemType,
  RelationshipFeeling,
  RelationshipStatus,
} from '../_model/model-sim.enums';
import { gs } from '../_state';
import { describeEmotion, getItemsByTypeAndOwner, getMoodLabel } from '../sim';
import { getChatsByActivityType } from './index-db';

export const activityTypeToContext: Partial<Record<ActivityType, string>> = {
  [ActivityType.Chat]: 'Casual socializing',
  [ActivityType.Play]: 'Playing a game together',
};

export function getGroupDescription(characters: Character[]) {
  let description = '';
  for (const character of characters) {
    description +=
      ' - ' +
      getCharacterDescription(
        character,
        characters.filter((c) => c.id !== character.id)
      ) +
      '\n';
  }
  return description;
}

export function getCharacterDescription(
  character: Character,
  otherCharactersInvolved: Character[]
) {
  const traits = character.llm.traits.join(', ');
  const relationships = getRelationshipsDescription(character, otherCharactersInvolved);
  const mood = character.emotions.dominantEmotion
    ? describeEmotion(
        character.emotions.dominantEmotion.name,
        character.emotions.dominantEmotion.intensity
      )
    : getMoodLabel(character.emotions.mood);
  return `${character.name}: feeling ${mood}; Bio: ${character.llm.bio}; Traits: ${traits}; ${relationships}`;
}

function getRelationshipsDescription(character: Character, otherCharacters: Character[]) {
  const relationships: string[] = [];
  otherCharacters.forEach((otherCharacter) => {
    const relationship = character.relationships[otherCharacter.id];
    if (
      relationship.status !== RelationshipStatus.Unknown &&
      relationship.status !== RelationshipStatus.Acquaintance
    ) {
      relationships.push(`${relationship.status} ${otherCharacter.name}`);
    }
    const feelings = getRandomFeelings(relationship, otherCharacter.name);
    if (feelings) {
      relationships.push(feelings);
    }
  });
  return relationships.join('; ');
}

function getRandomFeelings(relationship: Relationship, otherCharacterName: string) {
  const descriptors: string[] = [];
  // get 3 of the top 5 strongest feelings
  const sampledFeelings = sampleFeelings(relationship.feelings, 3, 5);

  for (const [feeling, value] of sampledFeelings) {
    if (Math.abs(value) <= 20) continue;

    const labels = LABELS_FEELINGS[feeling];
    if (!labels) continue;

    let label: string;
    if (value > 70) label = labels[5];
    else if (value > 50) label = labels[4];
    else if (value > 30) label = labels[3];
    else if (value < -70) label = labels[0];
    else if (value < -50) label = labels[1];
    else if (value < -30) label = labels[2];
    else continue;

    descriptors.push(`${label} ${otherCharacterName}`);
  }

  return descriptors.length > 0 ? descriptors.join(', ') : '';
}

function sampleFeelings(
  feelings: Partial<Record<RelationshipFeeling, number>>,
  maxReturned = 3,
  considerTopN = 5
): [RelationshipFeeling, number][] {
  const topN = Object.entries(feelings)
    .filter(([, value]) => Math.abs(value) > 20)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, considerTopN) as [RelationshipFeeling, number][];

  // Shuffle topN
  for (let i = topN.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [topN[i], topN[j]] = [topN[j], topN[i]];
  }

  return topN.slice(0, maxReturned);
}

export function getCharacterResources(character: Character, problem: Problem) {
  const resources: string[] = [];
  if (problem.type === ProblemType.NoFood) {
    const meals = getItemsByTypeAndOwner(ItemType.Meal, character.id);
    if (meals.length > 0) {
      resources.push(meals.map((m) => m.description).join(', '));
    }
    const foodIngredients = getItemsByTypeAndOwner(ItemType.FoodIngredient, character.id);
    if (foodIngredients.length > 0) {
      resources.push('some food ingredients');
    }
  }
  if (problem.type === ProblemType.NoMoney || problem.type === ProblemType.NoFood) {
    resources.push(character.money.toString() + '$');
  }
  return resources.length > 0 ? character.name + ' has ' + resources.join(', ') : '';
}

export async function getPastHelpHistory(requester: Character, helper: Character) {
  try {
    // Query for AskForHelp activities between these two characters
    const endTime = gs.time.ellapsedTime;
    const startTime = endTime - 7 * 24 * 60 * 60; // 7 days ago
    const chats = await getChatsByActivityType(
      ActivityType.AskForHelp,
      [requester.id, helper.id],
      startTime,
      endTime
    );
    const filteredChats = chats.filter((chat) => {
      // Check if requester is first participant and helper is second participant
      if (chat.participants.length < 2) {
        return false;
      }
      return chat.participants[0] === requester.id && chat.participants[1] === helper.id;
    });
    return (
      helper.name + ' helped ' + requester.name + ' ' + filteredChats.length + ' times recently'
    );
  } catch (error) {
    console.error('Error fetching past help history:', error);
    return [];
  }
}
