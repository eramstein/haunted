import type { Character, Activity } from '@/lib/_model/model-sim';
import { config } from '@/lib/_config/config';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { progressActivity } from '../activities';

export function move(character: Character, activity: Activity<ActivityType.GoTo>) {
  activity.progress += config.actionSpeed.goTo;
  if (activity.progress >= 100) {
    character.place = activity.target;
  }
}

export function moveToActivity(character: Character, activity: Activity): boolean {
  // check if character is at the agreed place
  if (character.place !== activity.target) {
    character.activities.unshift({
      type: ActivityType.GoTo,
      progress: 0,
      target: activity.target,
    });
    progressActivity(character);
    return true;
  }
  return false;
}
