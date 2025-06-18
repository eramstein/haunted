import type { Character, Problem } from '@/lib/_model/model-sim';
import { getHelpTools } from './tools-definitions';
import { getCharacterDescription } from './chat-helpers';
import { stringifyProblem } from '../sim/problems';
import { llmService } from './llm-service';

// TODO: this fails half the time with medium models -> make a 2 pass call
// 1: generate the conversation (streaming)
// 2: generate the tool calls based on the transcript

export async function characterAskingForHelp(
  character: Character,
  helper: Character,
  problem: Problem
) {
  const requesterDescription = getCharacterDescription(character, [helper]);
  const targetDescription = getCharacterDescription(helper, [character]);
  const problemDescription = character.name + ' ' + stringifyProblem(problem);

  const systemMessage = {
    role: 'system',
    content: `
    You are simulating a conversation between two characters.
    Your task is:          
      - Simulate a short conversation between them based on the problem description.
      - Based on the situation, decide if the target is willing and able to help.
      - If help is granted, you must call one of the provided functions.
      - If help is refused, call refuseHelp with a reason.
      - You cannot invent or assume any other functions.
      - You may only call functions that are defined in the tools list.
    `,
  };

  const userMessage = {
    role: 'user',
    content: `
      Requester: ${requesterDescription} 
      Target: ${targetDescription}
      Problem: ${problemDescription}
      Start the conversation.
    `,
  };

  const response = await llmService.chat({
    messages: [systemMessage, userMessage],
    tools: getHelpTools(helper),
    options: {
      temperature: 0.1, // Lower temperature for more deterministic responses
    },
  });
  return {
    conversation: llmService.getMessage(response),
    toolCalls: llmService.getTools(response),
  };
}
