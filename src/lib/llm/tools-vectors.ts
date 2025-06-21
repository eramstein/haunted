import { TOOLS_COLLECTION } from './config';
import { ToolType } from './tools-definitions';
import { vectorDatabaseClient } from './vector-db';

export async function queryToolVectors(message: string): Promise<ToolType | null> {
  // Check if a tool has been mentionned in the text
  const collection = await vectorDatabaseClient.getOrCreateCollection({
    name: TOOLS_COLLECTION,
  });
  const results = await collection.query({
    queryTexts: message,
    nResults: 5,
  });

  const documents = results.documents?.[0] || [];
  const scores = results.distances?.[0] || documents.map(() => 2);
  const metadatas = results.metadatas?.[0] || documents.map(() => ({}));

  // get tools within "not nonsense" distance
  const tools = documents
    .map((doc, i) => ({
      document: doc,
      score: scores[i],
      toolType: metadatas[i]?.tool as ToolType,
    }))
    .filter((tool) => tool.score < 1.7);

  // check if all results point ot the same tool, if yes, return that tool
  let currentTooltype = null;
  for (const tool of tools) {
    if (!currentTooltype) {
      currentTooltype = tool.toolType;
    } else if (currentTooltype !== tool.toolType) {
      currentTooltype = null;
      break;
    }
  }
  if (currentTooltype) {
    console.log('all tool types are the same, returning the first one', currentTooltype);
    return currentTooltype;
  }

  // the longer the message, the more the semantics of the embedded tool call are diluted
  // so larger messages need a larger distance to be considered a tool call
  const targetDistance = 1.1 + message.length / 100;
  const toolsWithinDistance = tools.filter((tool) => tool.score < targetDistance);

  if (toolsWithinDistance.length === 0) {
    return null;
  }

  const sumsByType = toolsWithinDistance.reduce(
    (acc, tool) => {
      if (!acc[tool.toolType]) {
        acc[tool.toolType] = { sum: 0, count: 0 };
      }
      acc[tool.toolType].sum += tool.score;
      acc[tool.toolType].count += 1;
      return acc;
    },
    {} as Record<ToolType, { sum: number; count: number }>
  );
  const avgByType = Object.entries(sumsByType).reduce(
    (acc, [toolType, { sum, count }]) => {
      acc[toolType as ToolType] = sum / count;
      return acc;
    },
    {} as Record<ToolType, number>
  );

  return Object.entries(avgByType).sort((a, b) => b[1] - a[1])[0][0] as ToolType;
}

// Used to detect tool usage in text
export const TOOLS_VECTORS: { tool: ToolType; descriptions: string[] }[] = [
  {
    tool: ToolType.GiveMoney,
    descriptions: [
      'Give money to another character',
      'A person gives money to another person',
      'Transfer money between characters',
      'One character lends or offers cash to another',
      'Handing someone a few bills',
      'Providing financial help to someone',
      'Giving some dollars, bucks, euros, or other currency',
      'Handing over some cash',
    ],
  },
  {
    tool: ToolType.GiveFood,
    descriptions: [
      'Give food to another character',
      'A person gives food to another person',
      'Share a meal with someone',
      'Offer something to eat',
      'Handing over groceries or supplies',
      'Providing food to someone in need',
      'Giving someone something edible',
      'Offering nourishment or a snack',
    ],
  },
];
