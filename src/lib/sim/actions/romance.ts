import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { getInviteList, inviteOrScheduleGroupActivity } from '../activities-group';
import { config } from '@/lib/_config/config';
import { getCharacterBedroom } from '../characters';
import { moveToActivity } from './move';

export function setRomanceTask(character: Character) {
  const whoToAsk = getInviteList(character, ActivityType.Romance);
  const place = getCharacterBedroom(character);
  if (whoToAsk.length > 0 && place) {
    inviteOrScheduleGroupActivity(character, whoToAsk, place.id, ActivityType.Romance);
  }
}

export function romance(character: Character, activity: Activity<ActivityType.Romance>) {
  if (moveToActivity(character, activity)) {
    return;
  }
  activity.progress += config.actionSpeed.romance;
  character.needs.intimacy -= config.needsRefill.intimacy;
  if (character.needs.intimacy < 0) {
    character.needs.intimacy = 0;
  }
}
