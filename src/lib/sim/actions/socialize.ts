import type { Activity, Character } from '@/lib/_model/model-sim';
import { ActivityType } from '@/lib/_model/model-sim.enums';
import { gs } from '@/lib/_state';
import { getCharactersByActivityType } from '../characters';
import { proposeActivity } from '../activities-group';
import { config } from '@/lib/_config/config';

export function setSocializeTask(character: Character) {
  const availableForChat = getCharactersByActivityType(gs.characters).filter(
    (c) => c.id !== character.id
  );
  if (availableForChat.length > 0) {
    proposeActivity(character, availableForChat, ActivityType.Chat, character.place);
  }
}

export function chat(character: Character, activity: Activity<ActivityType.Chat>) {
  activity.progress += config.actionSpeed.chat;
  character.needs.social -= config.needsRefill.chat;
  if (character.needs.social < 0) {
    character.needs.social = 0;
  }
}
