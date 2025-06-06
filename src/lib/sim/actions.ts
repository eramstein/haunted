import { getActionFromText } from '@/lib/llm';
import type { Character } from '@/lib/_model/model-sim';
import { ACTION_TYPES } from './action-types';
import { ActionType } from '@/lib/_config';

export async function actFromText(actionText: string, character: Character) {
  const { actionType, args } = await getActionFromText(actionText);
  await act(actionType, args, character);
}

export async function act(actionType: ActionType, args: Record<string, any>, character: Character) {
  const action = ACTION_TYPES[actionType];
  if (!action) {
    console.log('No action found for tool ' + actionType);
  }
  action.fn(character, args);
}
