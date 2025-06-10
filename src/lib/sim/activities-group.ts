import type { Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import type { ActivityTargets } from '@/lib/_model/model-sim';

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
  const groupActivity = {
    type: activityType,
    progress: 0,
    target,
    participants: [fromCharacter.id, ...acceptedCharacters.map((character) => character.id)],
  };
  console.log('groupActivity', groupActivity);
  if (acceptedCharacters.length > 0) {
    [fromCharacter, ...acceptedCharacters].forEach((character) => {
      // for now we assume that for group activities, the target is the place
      character.activities.push({
        type: ActivityType.GoTo,
        progress: 0,
        target,
      });
      character.activities.push(groupActivity);
    });
  }
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
