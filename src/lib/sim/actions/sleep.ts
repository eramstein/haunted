import type { Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { config } from '@/lib/_config/config';
import { gs } from '@/lib/_state';

export function sleep(character: Character) {
  character.activity!.progress += config.actionSpeed.sleep;
  if (character.activity!.progress >= 100) {
    character.needs.sleep.lastSleep = gs.time.ellapsedTime;
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
    character.activity = { type: ActivityType.Sleep, progress: 0, targetId: null };
  }
  // If not, go to bedroom
  else {
    character.activity = {
      type: ActivityType.GoTo,
      progress: 0,
      targetId: bedroom,
    };
  }
}
