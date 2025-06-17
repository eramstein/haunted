import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { config } from '@/lib/_config';

export function work(character: Character, activity: Activity<ActivityType.Work>) {
  activity.progress += config.actionSpeed.work;
  character.money += Math.ceil((character.work?.salary || 0) / 60);
}
