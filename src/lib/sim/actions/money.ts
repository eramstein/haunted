import type { Character } from '@/lib/_model/model-sim';
import { ActivityType, ObjectiveType } from '@/lib/_model/model-sim.enums';
import { failObjective } from '../objectives';

export function setGetMoneyTask(character: Character) {
  if (character.work) {
    character.activities.push({
      type: ActivityType.GoTo,
      progress: 0,
      target: character.work.place,
    });
    character.activities.push({
      type: ActivityType.Work,
      progress: 0,
      target: character.objective?.target || 0,
    });
  } else {
    failObjective(character, true);
  }
}
