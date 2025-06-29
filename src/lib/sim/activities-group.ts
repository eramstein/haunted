import type { Activity, Character } from '@/lib/_model/model-sim';
import {
  ActivityTag,
  ActivityType,
  RelationshipFeeling,
  RelationshipStatus,
} from '@/lib/_model/model-sim.enums';
import type { ActivityTargets } from '@/lib/_model/model-sim';
import { gs } from '../_state';
import { generateUniqueId } from './_utils/random';
import { saveChat } from '../llm/index-db';
import { activityAffinityWeights, config } from '../_config/config';
import { putObjectiveOnHold } from './objectives';
import { getActivityTypeDuration } from './activities';
import { getNextAvailableScheduleSlot, scheduleActivity, willBeAvailableAt } from './schedule';
import { clamp } from './_utils/math';

export function proposeActivity(
  fromCharacter: Character,
  characters: Character[],
  activityType: ActivityType,
  target: ActivityTargets[ActivityType] = null,
  timestamp: number = 0,
  tags?: Partial<Record<ActivityTag, any>>
) {
  const acceptedCharacters = characters.filter((character) =>
    acceptActivity(character, fromCharacter, activityType, target, timestamp)
  );
  console.log(
    `${fromCharacter.name} proposes ${activityType} to ${characters.map((character) => character.name).join(', ')} at time ${timestamp}.
    Accepted: ${acceptedCharacters.map((character) => character.name).join(', ')}`
  );
  if (acceptedCharacters.length === 0) {
    console.log('No accepted characters', fromCharacter.name, activityType);
    putObjectiveOnHold(fromCharacter, false, activityType);
    return null;
  }
  const groupActivity: Activity<ActivityType> = {
    type: activityType,
    progress: 0,
    target,
    participants: [fromCharacter.id, ...acceptedCharacters.map((character) => character.id)],
    tags,
  };
  [fromCharacter, ...acceptedCharacters].forEach((character) => {
    if (timestamp > 0) {
      scheduleActivity(character, groupActivity, timestamp);
    } else {
      character.activities.unshift(groupActivity);
    }
  });
  recordGroupActivity(activityType, groupActivity.participants || [], target as number, timestamp);
  return groupActivity;
}

export function recordGroupActivity(
  activityType: ActivityType,
  participants: number[],
  location: number,
  timestamp: number = 0
) {
  // store a schrodinger's chat: empty reference with meatadata for new, actual generated when user looks at it
  const id = generateUniqueId();
  console.log(
    'recordGroupActivity',
    id,
    timestamp || gs.time.ellapsedTime,
    participants,
    location,
    activityType
  );

  saveChat(id, timestamp || gs.time.ellapsedTime, participants, location, activityType);
}

function acceptActivity(
  character: Character,
  fromCharacter: Character,
  activityType: ActivityType,
  target: ActivityTargets[ActivityType],
  timestamp: number = 0
) {
  if (
    timestamp > 0 &&
    !willBeAvailableAt(character, timestamp, getActivityTypeDuration(activityType))
  ) {
    console.log('Character is not available at the requested timestamp', character, timestamp);
    return false;
  }
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
    case ActivityType.Romance:
      return character.needs.intimacy / config.needs.intimacy;
    case ActivityType.GroupMeal:
      return (
        (character.needs.food / config.needs.food + character.needs.social / config.needs.social) /
        2
      );
  }
  return 0;
}

// return -1 to 1 based on how much the character has affinity with the character proposing the activity
export function scoreAffinity(
  character: Character,
  proposedBy: Character,
  activityType: ActivityType
) {
  // we assume partners are always willing to do anything for each other
  if (
    [RelationshipStatus.RomanticPartner, RelationshipStatus.Spouse].includes(
      character.relationships[proposedBy.id].status
    )
  ) {
    return 1;
  }
  // some activities get a modifier as a minimal treshold to accept them
  let activityTypeBaseline = 0;
  if (activityType === ActivityType.Romance) {
    activityTypeBaseline = -0.5;
  }
  // compute a -1 to 1 score based on feelings relevant to the activity
  const feelings = character.relationships[proposedBy.id].feelings;
  const feelingWeights = activityAffinityWeights[activityType];
  if (!feelingWeights) {
    return activityTypeBaseline;
  }
  const entries = Object.entries(feelingWeights);
  let weightSum = 0;
  if (entries.length === 0) {
    return activityTypeBaseline;
  }
  const sum = entries.reduce((acc, [feeling, weight]) => {
    const feelingValue = feelings[feeling as RelationshipFeeling];
    weightSum += Math.abs(weight);
    return acc + (feelingValue || 0) * weight;
  }, 0);
  if (sum === 0 || weightSum === 0) {
    return activityTypeBaseline;
  }
  const score = sum / weightSum / 100;
  return clamp(score + activityTypeBaseline, -1, 1);
}

export function getInviteList(character: Character, activityType: ActivityType): Character[] {
  let treshold = 0;
  const others = gs.characters.filter((c) => c.id !== character.id);
  // ranking of other characters by affinity for the activity with them
  const partners = others
    .map((c) => ({
      character: c,
      // affinity score: how likely would I accept if they proposed this activity to me?
      score: scoreAffinity(character, c, activityType),
    }))
    .filter((m) => m.score >= treshold)
    .sort((a, b) => b.score - a.score);

  if (partners.length === 0) {
    putObjectiveOnHold(character);
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

export function inviteOrScheduleGroupActivity(
  character: Character,
  invited: Character[],
  place: number,
  activityType: ActivityType,
  tags?: Partial<Record<ActivityTag, any>>
) {
  if (invited.length === 0) {
    console.log('No invited characters', character.name);
    putObjectiveOnHold(character, false, activityType);
    return null;
  }
  let createdActivity: Activity<ActivityType> | null = null;
  // if top 1 partner is available, propose activity, else schedule it for later
  if (invited[0].activities.length === 0) {
    const available = invited.filter((c) => c.activities.length === 0);
    createdActivity = proposeActivity(character, available, activityType, place, 0, tags);
  } else {
    const duration = getActivityTypeDuration(activityType);
    let nextAvailableSlot = getNextAvailableScheduleSlot(invited[0], duration);
    if (!nextAvailableSlot) {
      console.log('No slot for preferred character', character.name, invited[0]);
      putObjectiveOnHold(character, false, activityType);
      return null;
    }
    if (willBeAvailableAt(character, nextAvailableSlot, duration)) {
      createdActivity = proposeActivity(
        character,
        invited,
        activityType,
        place,
        nextAvailableSlot,
        tags
      );
    } else {
      console.log('Next slot is not available', character, invited[0]);
      putObjectiveOnHold(character, false, activityType);
    }
  }
  return createdActivity;
}
