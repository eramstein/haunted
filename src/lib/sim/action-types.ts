import { ActionType } from '@/lib/_config';
import { moveTool } from './actions/move';
import type { ActionTypeDefinition } from '@/lib/_model';

export const ACTION_TYPES: Record<string, ActionTypeDefinition> = {
  [ActionType.GoTo]: {
    fn: moveTool,
    duration: 30,
    description: 'Go somewhere',
  },
  [ActionType.None]: {
    fn: () => {},
    duration: 0,
    description: 'Do nothing',
  },
};
