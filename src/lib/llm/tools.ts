import { type ToolCall } from 'ollama';
import { getTools, ToolType } from './tools-definitions';
import { llmService } from './llm-service';
import type { Character } from '../_model';

async function getToolsFromText(message: string, character: Character) {
  const systemMessage = {
    role: 'system',
    content: `You are a tool selection assistant. Your task is to carefully analyze the user's intent and select the most appropriate tool among those presented.`,
  };
  const query = {
    role: 'user',
    content: `This is the id information to select the tool, give it priority: ${message}.`,
  };
  const response = await llmService.chat({
    messages: [systemMessage, query],
    tools: getTools(character),
    options: {
      temperature: 0.1, // Lower temperature for more deterministic responses
    },
  });
  console.log('getToolsFromText tools response', response);
  return response;
}

export async function getToolCallsFromText(
  actionText: string,
  character: Character
): Promise<{
  toolType: ToolType;
  args: Record<string, any>;
}> {
  const llmResponse = await getToolsFromText(actionText, character);
  const toolCalls = llmService.getTools(llmResponse);
  console.log('getToolCallsFromText toolCalls', toolCalls);
  if (toolCalls === undefined || toolCalls.length === 0) {
    console.log('No tool found');
    return {
      toolType: ToolType.None,
      args: {},
    };
  }
  const tool = (toolCalls as ToolCall[])[0];
  const toolType = tool.function.name as ToolType;
  const args = llmService.getToolArguments(tool.function.arguments);
  return {
    toolType,
    args,
  };
}
