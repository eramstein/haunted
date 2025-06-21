import type { Tool } from 'ollama';
import type { Character } from '../_model/model-sim';
import { fuzzyMatch } from './_utils/strings';
import { getTools, type ToolType } from './tools-definitions';

// Try to figure if the given tooltype usage is obvious from the message
// lookup parameters in the message
export function lookupToolUsage(
  message: string,
  toolType: ToolType,
  character: Character,
  defaultParameterValues: Record<string, any>
): {
  tool: Tool;
  parameterValues: Record<string, string>;
} | null {
  const tool = getTools(character).find((t) => t.function.name === toolType);

  if (!tool || !tool.function.parameters || !tool.function.parameters.properties) {
    return null;
  }

  // if there are no parameters, we can simply use the tool
  if (!tool.function.parameters.required || tool.function.parameters.required.length === 0) {
    return { tool, parameterValues: {} };
  }

  const properties = Object.entries(tool.function.parameters.properties).reduce(
    (acc, [name, parameter]) => {
      acc.push({ name, type: parameter.type as string, enum: parameter.enum as string[] });
      return acc;
    },
    [] as Array<{ name: string; type: string; enum?: string[] }>
  );

  const parameterValues: Record<string, string> = {};
  for (const parameter of properties) {
    switch (parameter.type) {
      case 'number':
        const match = message.match(/(\d+)/);
        console.log('numberFound', match);
        if (match) {
          const numberFound = match[1];
          parameterValues[parameter.name] = numberFound;
        }
        break;
      case 'string':
        const options = parameter.enum;
        if (options?.length) {
          // Find the best matching option using fuzzy search
          let bestMatch = options[0];
          let bestScore = 0;
          for (const option of options) {
            const score = fuzzyMatch(option, message);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = option;
            }
          }
          const targetScore = defaultParameterValues[parameter.name] ? 0.5 : 0.3;
          // Only use the match if it's above a certain threshold
          if (bestScore > targetScore) {
            parameterValues[parameter.name] = bestMatch;
          } else {
            parameterValues[parameter.name] = defaultParameterValues[parameter.name] || options[0];
          }
        }
        break;
    }
  }
  // check if the message contains the parameters
  return {
    tool,
    parameterValues,
  };
}
