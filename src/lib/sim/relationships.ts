import type { Character, RelationshipUpdate } from '../_model/model-sim';
import type { RelationshipFeeling } from '../_model/model-sim.enums';
import { gs } from '../_state';

export function updateRelationships(updates: RelationshipUpdate[]) {
  const characterNamesToIds = gs.characters.reduce(
    (acc, character) => {
      acc[character.name] = character.id;
      return acc;
    },
    {} as Record<string, number>
  );
  updates.forEach((update) => {
    if (
      !gs.characters[characterNamesToIds[update.from]].relationships[
        characterNamesToIds[update.toward]
      ].feelings[update.feeling]
    ) {
      gs.characters[characterNamesToIds[update.from]].relationships[
        characterNamesToIds[update.toward]
      ].feelings[update.feeling] = 0;
    }
    (gs.characters[characterNamesToIds[update.from]].relationships[
      characterNamesToIds[update.toward]
    ].feelings[update.feeling] as number) += update.delta;
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
