import type { RelationshipUpdate } from '../_model/model-sim';
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
