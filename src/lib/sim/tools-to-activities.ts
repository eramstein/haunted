import { getToolCallsFromText } from '@/lib/llm';
import type { Character } from '@/lib/_model/model-sim';

export async function actFromText(actionText: string, character: Character) {
  const { toolType, args } = await getToolCallsFromText(actionText);
  // TODO
  // const place = gs.places.find((p) => p.name === param.destinationPlace);
  // if (place) {
  //   move(character, place);
  // }
}
