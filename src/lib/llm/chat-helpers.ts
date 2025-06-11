import type { Character } from '../_model';
import { ActivityType } from '../_model/model-sim.enums';

export const activityTypeToContext: Partial<Record<ActivityType, string>> = {
  [ActivityType.Chat]: 'Casual socializing',
  [ActivityType.Play]: 'Playing a game together',
};

export function getGroupDescription(characters: Character[]) {
  let description = '';
  for (const character of characters) {
    description += ' - ' + getCharacterDescription(character, characters) + '\n';
  }
  return description;
}

export function getCharacterDescription(
  character: Character,
  otherCharactersInvolved: Character[]
) {
  const traits = character.llm.traits.join(', ');
  // add more contextual npc info
  const relationships = '';
  const mood = '';
  return `${character.name} (Bio: ${character.llm.bio}; Traits: ${traits}`;
}
