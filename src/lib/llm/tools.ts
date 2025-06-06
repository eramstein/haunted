import { gs } from '../_state';
import type { Tool } from 'ollama';
import { ActionType } from '../_config';
import { ACTION_TYPES } from '../sim/action-types';

const goTo: () => Tool = () => {
  return {
    type: 'function',
    function: {
      name: ActionType.GoTo,
      description: ACTION_TYPES[ActionType.GoTo].description,
      parameters: {
        type: 'object',
        required: ['destinationPlace'],
        properties: {
          destinationPlace: {
            type: 'string',
            description: 'The place where the person is going to',
            enum: gs.places.map((p) => p.name),
          },
        },
      },
    },
  };
};

export function getTools(): Tool[] {
  return [goTo].map((f) => f());
}
