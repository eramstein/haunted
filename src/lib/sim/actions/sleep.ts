import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { config } from '@/lib/_config/config';
import { gs } from '@/lib/_state';

export function sleep(character: Character, activity: Activity<ActivityType.Sleep>) {
  activity.progress += config.actionSpeed.sleep;
  character.needs.sleep -= config.needsRefill.sleep;
  if (character.needs.sleep < 0) {
    character.needs.sleep = 0;
  }
}

export function setRestTask(character: Character) {
  // Find the character's bedroom
  const bedroom = gs.places.findIndex((place) =>
    place.name.toLowerCase().includes(character.name.toLowerCase())
  );

  if (bedroom === -1) {
    console.log(character.name, 'no bedroom found');
    return;
  }

  // If character is in their bedroom, start sleeping
  if (character.place === bedroom) {
    character.activities.push({
      type: ActivityType.Sleep,
      progress: 0,
      target: undefined as never,
    });
  }
  // If not, go to bedroom
  else {
    character.activities.push({
      type: ActivityType.GoTo,
      progress: 0,
      target: bedroom,
    });
  }
}
