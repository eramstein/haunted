import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { getInviteList, inviteOrScheduleGroupActivity } from '../activities-group';
import { config } from '@/lib/_config/config';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';
import { getRandomItemFromArray } from '../_utils/random';
import { moveToActivity } from './move';

export function setSocializeTask(character: Character) {
  const place = getRandomItemFromArray<number>([
    PLACES_IDS_BY_TYPE.livingRoom,
    PLACES_IDS_BY_TYPE.library,
    PLACES_IDS_BY_TYPE.veranda,
  ]);
  inviteOrScheduleGroupActivity(
    character,
    getInviteList(character, ActivityType.Chat),
    place,
    ActivityType.Chat
  );
}

export function chat(character: Character, activity: Activity<ActivityType.Chat>) {
  if (moveToActivity(character, activity)) {
    return;
  }
  activity.progress += config.actionSpeed.chat;
  character.needs.social -= config.needsRefill.chat;
  if (character.needs.social < 0) {
    character.needs.social = 0;
  }
}
