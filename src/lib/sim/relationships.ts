import { config } from '../_config';
import type { Character, RelationshipUpdate } from '../_model/model-sim';
import { RelationshipStatus, type RelationshipFeeling } from '../_model/model-sim.enums';
import { gs } from '../_state';
import { clamp } from './_utils/math';

function getRelationship(fromId: number, towardId: number) {
  return gs.characters[fromId].relationships[towardId];
}

export function updateRelationships(relationUpdates: RelationshipUpdate[]) {
  const characterNamesToIds = Object.fromEntries(gs.characters.map((char) => [char.name, char.id]));

  // update individual feelings
  relationUpdates.forEach(({ from, toward, feeling, delta }) => {
    const relationship = getRelationship(characterNamesToIds[from], characterNamesToIds[toward]);

    // Initialize feeling if it doesn't exist
    if (!relationship.feelings[feeling]) {
      relationship.feelings[feeling] = 0;
    }

    // we square delta to give more weight to larger changes, and have always positive values
    const changeScale = getRelationChangeValue(delta);
    const changeDirection = delta > 0 ? 1 : -1;

    // Update feeling value and clamp between -100 and 100
    relationship.feelings[feeling] = clamp(
      (relationship.feelings[feeling] as number) + changeScale * changeDirection,
      -100,
      100
    );

    // aggregate feeling changes
    relationship.summary.cumulatedFeelingChanges += changeScale;
  });

  // TODO: handle relationship status, derived from feelings? or mix with LLM
}

export function updateFeelingValue(
  feeling: RelationshipFeeling,
  fromCharacterId: number,
  towardsCharacterId: number,
  value: number
) {
  const character = gs.characters.find((c) => c.id === fromCharacterId);
  if (!character) return;

  // Ensure the feeling exists in the relationship
  if (!character.relationships[towardsCharacterId].feelings[feeling]) {
    character.relationships[towardsCharacterId].feelings[feeling] = 0;
  }

  // Update the feeling value
  character.relationships[towardsCharacterId].feelings[feeling] = value;
}

export function increaseFeelingValue(
  feeling: RelationshipFeeling,
  fromCharacterId: number,
  towardsCharacterId: number,
  value: number
) {
  const character = gs.characters.find((c) => c.id === fromCharacterId);
  if (!character) return;

  // Ensure the feeling exists in the relationship
  if (!character.relationships[towardsCharacterId].feelings[feeling]) {
    character.relationships[towardsCharacterId].feelings[feeling] = 0;
  }

  // Update the feeling value
  character.relationships[towardsCharacterId].feelings[feeling] = clamp(
    character.relationships[towardsCharacterId].feelings[feeling] || 0 + value,
    -100,
    100
  );
}

export function getBestFriend(
  character: Character,
  notIn: Record<number, boolean> = {}
): Character | null {
  Object.entries(character.relationships).forEach(([towardId, relationship]) => {
    if (relationship.status === RelationshipStatus.CloseFriend && !notIn[+towardId]) {
      return gs.characters[+towardId];
    }
  });
  let maxScore = -Infinity;
  let bestFriend: Character | null = null;
  gs.characters
    .filter((c) => c.id !== character.id && !notIn[c.id])
    .forEach((other) => {
      const feelings = other.relationships[character.id].feelings;
      const score =
        (feelings.gratitude || 0) * 2 +
        (feelings.admiration || 0) +
        (feelings.affection || 0) +
        (feelings.love || 0) * 2;
      if (score > maxScore) {
        maxScore = score;
        bestFriend = other;
      }
    });
  return bestFriend;
}

export function getRelationChangeValue(delta: number) {
  const changeDirection = delta > 0 ? 1 : -1;
  return Math.round(delta * delta * config.relationSummaryVolatility * changeDirection * 10) / 10;
}
