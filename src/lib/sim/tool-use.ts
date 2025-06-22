import type { Character } from '../_model/model-sim';
import { ToolType } from '../llm/tools-definitions';
import { giftFood, giftMoney } from './actions/gift';
import { getCharacterByName } from './characters';

// Serves as a bridge to the LLM and Vector DB tool calls
// The LLM returns a tool call, and useTool actually changes the simulation state
// Returns a textual description of what happened
export function useTool(
  actingCharacter: Character,
  toolName: string,
  params: Record<string, any>
): string {
  let outcome = '';
  console.log('useTool', actingCharacter.name, toolName, params);
  switch (toolName) {
    case ToolType.GiveFood:
      if (!params.recipient) {
        return '';
      }
      const characterGiftedFoodTo = getCharacterByName(params.recipient);
      if (!characterGiftedFoodTo) {
        return '';
      }
      const food = giftFood(actingCharacter, characterGiftedFoodTo, params.item);
      if (food) {
        outcome =
          actingCharacter.name + ' gave ' + params.recipient + ' food (' + food.description + ')';
      }
      break;
    case ToolType.GiveMoney:
      if (!params.recipient || !params.amount) {
        return '';
      }
      const characterGiftedMoneyTo = getCharacterByName(params.recipient);
      if (!characterGiftedMoneyTo) {
        return '';
      }
      const moneyGifted = giftMoney(actingCharacter, characterGiftedMoneyTo, +params.amount);
      if (moneyGifted > 0) {
        outcome =
          actingCharacter.name +
          ' gave ' +
          characterGiftedMoneyTo.name +
          ' money (' +
          moneyGifted +
          '$)';
      }
      break;
    case ToolType.RefuseHelp:
      outcome =
        actingCharacter.name + ' refused to help ' + params.recipient + ' because ' + params.reason;
      break;
  }
  return outcome;
}
