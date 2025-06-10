import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { gs } from '@/lib/_state';
import { proposeActivity } from '../activities-group';
import { config } from '@/lib/_config/config';
import { PLACES_IDS_BY_TYPE } from '@/data/world/places';
import { getCharactersByActivityType } from '../characters';

export function setPlayTask(character: Character) {
  const availableForPlay = getCharactersByActivityType(gs.characters).filter(
    (c) => c.id !== character.id
  );
  if (availableForPlay.length > 0) {
    proposeActivity(character, availableForPlay, ActivityType.Play, PLACES_IDS_BY_TYPE.gamingRoom);
  }
}

export function play(character: Character, activity: Activity<ActivityType.Play>) {
  activity.progress += config.actionSpeed.play;
  character.needs.fun -= config.needsRefill.play;
  if (character.needs.fun < 0) {
    character.needs.fun = 0;
  }
}
