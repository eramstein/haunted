import type { Character, Activity } from '@/lib/_model/model-sim';
import { config } from '@/lib/_config/config';
import { ActivityType } from '@/lib/_model/model-sim.enums';

export function move(character: Character, activity: Activity<ActivityType.GoTo>) {
  activity.progress += config.actionSpeed.goTo;
  if (activity.progress >= 100) {
    character.place = activity.target;
  }
}
