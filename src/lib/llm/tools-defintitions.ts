import { gs } from '../_state';
import type { Tool } from 'ollama';

export enum ToolType {
  None = 'none',
  GoTo = 'goTo',
}

const goTo: () => Tool = () => {
  return {
    type: 'function',
    function: {
      name: ToolType.GoTo,
      description: 'Go somewhere',
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
