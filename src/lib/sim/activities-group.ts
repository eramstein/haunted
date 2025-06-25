import type { Character } from '@/lib/_model/model-sim';
import { ActivityType, RelationshipFeeling } from '@/lib/_model/model-sim.enums';
import type { ActivityTargets } from '@/lib/_model/model-sim';
import { gs } from '../_state';
import { generateUniqueId } from './_utils/random';
import { saveChat } from '../llm/index-db';
import { activityAffinityWeights, config } from '../_config/config';
import { failObjective } from './objectives';

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
    failObjective(fromCharacter);
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

export function recordGroupActivity(
  activityType: ActivityType,
  participants: number[],
  location: number
) {
  // store a schrodinger's chat: empty reference with meatadata for new, actual generated when user looks at it
  const id = generateUniqueId();
  saveChat(id, gs.time.ellapsedTime, participants, location, activityType);
}

function acceptActivity(
  character: Character,
  fromCharacter: Character,
  activityType: ActivityType,
  target: ActivityTargets[ActivityType]
) {
  return motivatedByActivity(character, fromCharacter, activityType, target) >= 0.333;
}

// returns 0 to 1 based on how much the character is motivated by the activity
export function motivatedByActivity(
  character: Character,
  proposedBy: Character,
  activityType: ActivityType,
  target: ActivityTargets[ActivityType]
) {
  const needScore = scoreNeed(character, activityType);
  const affinityScore = scoreAffinity(character, proposedBy, activityType);
  return (needScore + affinityScore) / 2;
}

// return 0 to 1 based on how much the character needs that activity
function scoreNeed(character: Character, activityType: ActivityType) {
  switch (activityType) {
    case ActivityType.Chat:
      return character.needs.social / config.needs.social;
    case ActivityType.Play:
      return character.needs.fun / config.needs.fun;
  }
  return 0;
}

// return -1 to 1 based on how much the character has affinity with the character proposing the activity
export function scoreAffinity(
  character: Character,
  proposedBy: Character,
  activityType: ActivityType
) {
  const feelings = character.relationships[proposedBy.id].feelings;
  const feelingWeights = activityAffinityWeights[activityType];
  if (!feelingWeights) {
    return 0;
  }
  const entries = Object.entries(feelingWeights);
  let weightSum = 0;
  if (entries.length === 0) {
    return 0;
  }
  const sum = entries.reduce((acc, [feeling, weight]) => {
    const feelingValue = feelings[feeling as RelationshipFeeling];
    weightSum += Math.abs(weight);
    return acc + (feelingValue || 0) * weight;
  }, 0);
  if (sum === 0 || weightSum === 0) {
    return 0;
  }
  return sum / weightSum / 100;
}

export function getInviteList(character: Character, activityType: ActivityType): Character[] {
  const others = gs.characters.filter((c) => c.id !== character.id);
  // ranking of other characters by affinity for the activity with them
  const partners = others
    .map((c) => ({
      character: c,
      score: scoreAffinity(character, c, activityType),
    }))
    .filter((m) => m.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (partners.length === 0) {
    failObjective(character);
    return [];
  }

  // normalize scores vs top score, from 0.5 to 1
  const topScore = partners[0].score;
  partners.forEach((p) => {
    p.score = topScore ? 0.5 + (p.score / topScore) * 0.5 : 1;
  });

  // invite based on score probability
  return partners.filter((p) => Math.random() < p.score).map((p) => p.character);
}
