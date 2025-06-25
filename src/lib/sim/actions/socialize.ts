import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { getInviteList, proposeActivity } from '../activities-group';
import { config } from '@/lib/_config/config';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';
import { getRandomItemFromArray } from '../_utils/random';
import { failObjective } from '../objectives';

export function setSocializeTask(character: Character) {
  const invited = getInviteList(character, ActivityType.Chat);
  if (invited.length === 0) {
    failObjective(character);
    return;
  }

  const place = getRandomItemFromArray<number>([
    PLACES_IDS_BY_TYPE.livingRoom,
    PLACES_IDS_BY_TYPE.library,
    PLACES_IDS_BY_TYPE.veranda,
  ]);

  // if top 1 partner is available, propose activity, else schedule it for later
  if (invited[0].activities.length === 0) {
    const available = invited.filter((c) => c.activities.length === 0);
    proposeActivity(character, available, ActivityType.Chat, place);
  } else {
    // TODO: schedule
    console.log('TODO: schedule - fail for now');
    failObjective(character);
  }
}

export function chat(character: Character, activity: Activity<ActivityType.Chat>) {
  activity.progress += config.actionSpeed.chat;
  character.needs.social -= config.needsRefill.chat;
  if (character.needs.social < 0) {
    character.needs.social = 0;
  }
}
