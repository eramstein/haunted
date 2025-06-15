import type { RelationshipUpdate } from '../_model/model-sim';
import type { RelationshipFeeling } from '../_model/model-sim.enums';
import { gs } from '../_state';
import { clamp } from './_utils/math';

function getRelationship(fromId: number, towardId: number) {
  return gs.characters[fromId].relationships[towardId];
}

export function updateRelationships(relationUpdates: RelationshipUpdate[]) {
  const characterNamesToIds = Object.fromEntries(gs.characters.map((char) => [char.name, char.id]));

  relationUpdates.forEach(({ from, toward, feeling, delta }) => {
    const relationship = getRelationship(characterNamesToIds[from], characterNamesToIds[toward]);

    // Initialize feeling if it doesn't exist
    if (!relationship.feelings[feeling]) {
      relationship.feelings[feeling] = 0;
    }

    // Update feeling value and clamp between -100 and 100
    relationship.feelings[feeling] = clamp(
      (relationship.feelings[feeling] as number) + delta,
      -100,
      100
    );
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
