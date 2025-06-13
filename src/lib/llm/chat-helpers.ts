import { LABELS_FEELINGS } from '../_config/labels';
import type { Character, Relationship } from '../_model';
import { ActivityType, RelationshipFeeling, RelationshipStatus } from '../_model/model-sim.enums';

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
  console.log('getGroupDescription', description);
  return description;
}

export function getCharacterDescription(
  character: Character,
  otherCharactersInvolved: Character[]
) {
  const traits = character.llm.traits.join(', ');
  const relationships = getRelationshipsDescription(character, otherCharactersInvolved);
  const mood = '';
  return `${character.name} Bio: ${character.llm.bio}; Traits: ${traits}; ${relationships}`;
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
