import type { Character, Problem } from '@/lib/_model/model-sim';
import { getHelpTools } from './tools-definitions';
import { getCharacterDescription, getCharacterResources, getPastHelpHistory } from './chat-helpers';
import { stringifyProblem } from '../sim/problems';
import { llmService } from './llm-service';
import { type ToolCall } from 'ollama';

export async function characterAskingForHelp(
  character: Character,
  helper: Character,
  problem: Problem,
  onStream?: (chunk: string) => void
): Promise<{
  conversation: string;
  toolCalls: ToolCall[];
}> {
  const requesterDescription = getCharacterDescription(character, [helper]);
  const targetDescription = getCharacterDescription(helper, [character]);
  const problemDescription = character.name + ' ' + stringifyProblem(problem);
  const resources = getCharacterResources(helper, problem);
  const pastHelpHistory = await getPastHelpHistory(character, helper);

  // 1st call: generate the conversation
  const systemMessage = {
    role: 'system',
    content: `
    You are simulating a natural conversation between two characters.
      - Be concise but realistic.
      - Generate short back-and-forth dialogue where the requester asks for help and the target replies.
      - End the conversation naturally when the target has made a decision.
      - Do not call any functions, only write the conversation.
      - Do not output any explanations, only output the dialogue.
    `,
  };

  const userMessage = {
    role: 'user',
    content: `
      Requester: ${requesterDescription} 
      Target: ${targetDescription} ${resources ? 'Resources: ' + resources : ''}
      Past help history: ${pastHelpHistory}
      Problem: ${problemDescription}
      Simulate the conversation where ${character.name} asks for help.
    `,
  };

  const stream = await llmService.chat({
    messages: [systemMessage, userMessage],
    stream: true,
  });

  let transcript = '';
  for await (const chunk of stream) {
    const convertedChunk = llmService.getStreamChunk(chunk);
    transcript += convertedChunk;
    onStream?.(convertedChunk);
  }

  // 2nd call: generate the tool calls based on the conversation
  const systemToolsMessage = {
    role: 'system',
    content: `
    You are an AI simulation controller.
    - Given a conversation between two characters, extract the outcome as a function call.
    - Pick the correct function from the provided tools.
    - If the target refused help, call refuseHelp with a reason.
    - If the target offered help, call the appropriate function with its parameters.
    - You must only call one function.
    - You must not invent any new functions.
    `,
  };

  const userToolsMessage = {
    role: 'user',
    content: `
      Conversation: 
      ${transcript}
      ---

      What function should be called?
    `,
  };

  const response = await llmService.chat({
    messages: [systemToolsMessage, userToolsMessage],
    tools: getHelpTools(helper),
    options: {
      temperature: 0.1, // Lower temperature for more deterministic responses
    },
  });

  return {
    conversation: transcript,
    toolCalls: llmService.getTools(response),
  };
}
