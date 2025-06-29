import type { Character } from '../_model/model-sim';
import { gs } from '../_state';
import type { Tool } from 'ollama';
import { getItemsByTypeAndOwner } from '../sim';
import { ItemType } from '../_model/model-sim.enums';

export enum ToolType {
  None = 'none',
  GoTo = 'goTo',
  GiveFood = 'giveFood',
  GiveMoney = 'giveMoney',
  RefuseHelp = 'refuseHelp',
}

const goTo = () => ({
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
});

export function getTools(character: Character): Tool[] {
  return [goTo(), ...getHelpTools(character)];
}

export const getHelpTools: (helper: Character) => Tool[] = (helper) => {
  const foodItems = getItemsByTypeAndOwner(ItemType.FoodIngredient, helper.id);
  const mealItems = getItemsByTypeAndOwner(ItemType.Meal, helper.id);
  const recipients = gs.characters.filter((c) => c.id !== helper.id).map((c) => c.name);
  const moneyTool: Tool = {
    type: 'function',
    function: {
      name: ToolType.GiveMoney,
      description: 'Give money to another character',
      parameters: {
        type: 'object',
        required: ['amount', 'recipient'],
        properties: {
          amount: { type: 'number', description: 'The amount of money to give' },
          recipient: {
            type: 'string',
            description: 'The character who is receiving the money',
            enum: recipients,
          },
        },
      },
    },
  };
  const refuseHelpTool: Tool = {
    type: 'function',
    function: {
      name: ToolType.RefuseHelp,
      description: 'Refuse to help and explain why',
      parameters: {
        type: 'object',
        required: ['cause'],
        properties: {
          cause: { type: 'string', description: 'The cause for refusing to help' },
        },
      },
    },
  };
  const foodtool: Tool = {
    type: 'function',
    function: {
      name: ToolType.GiveFood,
      description: 'Give food to another character',
      parameters: {
        type: 'object',
        required: ['item', 'recipient'],
        properties: {
          item: {
            type: 'string',
            enum: [...foodItems, ...mealItems].map((i) => i.description),
            description: 'The food ingredient or meal to give',
          },
          recipient: {
            type: 'string',
            description: 'The character who is receiving the food',
            enum: recipients,
          },
        },
      },
    },
  };
  const tools = [moneyTool, refuseHelpTool];
  if (foodItems.length > 0 || mealItems.length > 0) {
    tools.push(foodtool);
  }
  return tools;
};
