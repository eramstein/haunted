import type { Place, Character } from '@/lib/_model/model-sim';
import { gs } from '@/lib/_state';
import { config } from '@/lib/_config/config';

export function move(character: Character) {
  character.activity!.progress += config.actionSpeed.goTo;
  if (character.activity!.progress >= 100) {
    character.place = character.activity?.targetId || 0;
  }
}
