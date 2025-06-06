import { type ToolCall } from 'ollama';
import { getTools } from './tools';
import { ActionType } from '../_config';
import { queryWorldsMemory } from './world';
import { llmService } from './llm-service';

async function getToolsFromText(message: string) {
  const memoryPrompt = await queryWorldsMemory(message);
  console.log('getToolsFromText memoryPrompt', message, memoryPrompt);
  const systemMessage = {
    role: 'system',
    content: `You are a tool selection assistant. Your task is to carefully analyze the user's intent and select the most appropriate tool among those presented.`,
  };
  const query = {
    role: 'user',
    content: `This is the key information to select the tool, give it priority: ${message}. ${memoryPrompt}`,
  };
  const response = await llmService.chat({
    messages: [systemMessage, query],
    tools: getTools(),
    options: {
      temperature: 0.1, // Lower temperature for more deterministic responses
    },
  });
  console.log('getToolsFromText tools response', response);
  return response;
}

export async function getActionFromText(actionText: string): Promise<{
  actionType: ActionType;
  args: Record<string, any>;
}> {
  const llmResponse = await getToolsFromText(actionText);
  const toolCalls = llmService.getTools(llmResponse);
  console.log('getActionFromText toolCalls', toolCalls);
  if (toolCalls === undefined || toolCalls.length === 0) {
    console.log('No tool found');
    return {
      actionType: ActionType.None,
      args: {},
    };
  }
  const tool = (toolCalls as ToolCall[])[0];
  const actionType = tool.function.name as ActionType;
  const args = llmService.getToolArguments(tool.function.arguments);
  return {
    actionType,
    args,
  };
}
