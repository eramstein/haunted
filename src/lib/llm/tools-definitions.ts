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

export const getHelpTools: (helper: Character) => Tool[] = (helper) => {
  const foodItems = getItemsByTypeAndOwner(ItemType.FoodIngredient, helper.id);
  const mealItems = getItemsByTypeAndOwner(ItemType.Meal, helper.id);
  const moneyTool: Tool = {
    type: 'function',
    function: {
      name: ToolType.GiveMoney,
      description: 'Give money to another character',
      parameters: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', description: 'The amount of money to give' },
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
        required: ['reason'],
        properties: {
          reason: { type: 'string', description: 'The reason for refusing to help' },
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
        required: ['item'],
        properties: {
          item: {
            type: 'string',
            enum: [...foodItems, ...mealItems].map((i) => i.description),
            description: 'The food ingredient or meal to give',
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
