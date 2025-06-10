import type { Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import type { ActivityTargets } from '@/lib/_model/model-sim';
import { gs } from '../_state';
import { generateUniqueId } from './_utils/random';
import { saveChat } from '../llm/index-db';

// TODO: use a better UUID library
export function proposeActivity(
  fromCharacter: Character,
  characters: Character[],
  activityType: ActivityType,
  target: ActivityTargets[ActivityType] = null
) {
  const acceptedCharacters = characters.filter((character) =>
    acceptActivity(character, fromCharacter, activityType, target)
  );
  console.log(
    `${fromCharacter.name} proposes ${activityType} to ${characters.map((character) => character.name).join(', ')}.
    Accepted: ${acceptedCharacters.map((character) => character.name).join(', ')}`
  );
  if (acceptedCharacters.length === 0) {
    return;
  }
  const groupActivity = {
    type: activityType,
    progress: 0,
    target,
    participants: [fromCharacter.id, ...acceptedCharacters.map((character) => character.id)],
  };
  [fromCharacter, ...acceptedCharacters].forEach((character) => {
    // for now we assume that for group activities, the target is the place
    character.activities.push({
      type: ActivityType.GoTo,
      progress: 0,
      target,
    });
    character.activities.push(groupActivity);
  });
  recordGroupActivity(activityType, groupActivity.participants, target as number);
}

function acceptActivity(
  character: Character,
  fromCharacter: Character,
  activityType: ActivityType,
  target: ActivityTargets[ActivityType]
) {
  // TODO: check based on character's preferences, opinions and current needs
  return Math.random() < 0.5;
}

export function recordGroupActivity(
  activityType: ActivityType,
  participants: number[],
  location: number
) {
  // store a schrodinger's chat: empty reference with meatadata for new, actual generated when user looks at it
  const id = generateUniqueId();
  saveChat(id, participants, location, activityType, '');
}
