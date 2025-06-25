import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { getInviteList, proposeActivity } from '../activities-group';
import { config } from '@/lib/_config/config';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';
import { getRandomItemFromArray } from '../_utils/random';
import { putObjectiveOnHold } from '../objectives';
import { getNextAvailableScheduleSlot, willBeAvailableAt } from '../schedule';
import { getActivityTypeDuration, progressActivity } from '../activities';

export function setSocializeTask(character: Character) {
  const invited = getInviteList(character, ActivityType.Chat);
  if (invited.length === 0) {
    putObjectiveOnHold(character);
    return;
  }

  const place = getRandomItemFromArray<number>([
    PLACES_IDS_BY_TYPE.livingRoom,
    PLACES_IDS_BY_TYPE.library,
    PLACES_IDS_BY_TYPE.veranda,
  ]);

  console.log(
    character.name,
    'invites',
    invited.map((c) => c.name)
  );

  // if top 1 partner is available, propose activity, else schedule it for later
  if (invited[0].activities.length === 0) {
    const available = invited.filter((c) => c.activities.length === 0);
    proposeActivity(character, available, ActivityType.Chat, place);
  } else {
    const duration = getActivityTypeDuration(ActivityType.Chat);
    let nextAvailableSlot = getNextAvailableScheduleSlot(invited[0], duration);
    if (!nextAvailableSlot) {
      console.log('No slot for preferred character', character.name, invited[0]);
      putObjectiveOnHold(character);
      return;
    }
    if (willBeAvailableAt(character, nextAvailableSlot, duration)) {
      proposeActivity(character, invited, ActivityType.Chat, place, nextAvailableSlot);
    } else {
      console.log('Next slot is not available', character, invited[0]);
      putObjectiveOnHold(character);
    }
  }
}

export function chat(character: Character, activity: Activity<ActivityType.Chat>) {
  // check if character is at the agreed place
  if (character.place !== activity.target) {
    character.activities.unshift({
      type: ActivityType.GoTo,
      progress: 0,
      target: activity.target,
    });
    progressActivity(character);
    return;
  }
  activity.progress += config.actionSpeed.chat;
  character.needs.social -= config.needsRefill.chat;
  if (character.needs.social < 0) {
    character.needs.social = 0;
  }
}
