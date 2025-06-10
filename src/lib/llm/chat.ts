import { llmService } from './llm-service';
import type { Character, Place } from '../_model';
import { ActivityType } from '../_model/model-sim.enums';
import { saveChat } from './index-db';

async function summarizeChat(chatHistory: string, character: string) {
  const prompt = `
    Summarize all interactions between these characters into 2-3 sentences, focusing on id events (e.g., game outcomes, social moments, plans). Output only the summary text.
    Test to summarize: ${chatHistory}
  `;
  const memory = await llmService.chat({
    messages: [{ role: 'user', content: prompt }],
    stream: false,
  });
  return llmService.getMessage(memory);
}

export async function generateChat(
  chatId: string,
  characters: Character[],
  place: Place,
  activityType: ActivityType,
  onStream: (chunk: string) => void
): Promise<string> {
  const systemPrompt = {
    role: 'system',
    content:
      'The following characters have a chat: ' +
      characters.map((c) => c.name + ': ' + c.llm.systemPrompt).join('\n'),
  };

  const stream = await llmService.chat({
    messages: [systemPrompt],
    stream: true,
    options: {
      temperature: 0.7,
      repeat_penalty: 1.1,
      top_k: 40,
      top_p: 0.9,
    },
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const convertedChunk = llmService.getStreamChunk(chunk);
    fullResponse += convertedChunk;
    onStream?.(convertedChunk);
  }

  // store full chat in the database
  await saveChat(
    chatId,
    characters.map((c) => c.id),
    place.id,
    activityType,
    fullResponse
  );

  return fullResponse;
}
