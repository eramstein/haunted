import { llmService } from './llm-service';
import type { Character } from '../_model';

async function summarizeChat(chatHistory: string, character: string) {
  const prompt = `
    Summarize all interactions between these characters into 2-3 sentences, focusing on key events (e.g., game outcomes, social moments, plans). Output only the summary text.
    Test to summarize: ${chatHistory}
  `;
  const memory = await llmService.chat({
    messages: [{ role: 'user', content: prompt }],
    stream: false,
  });
  return llmService.getMessage(memory);
}

export async function generateChat(
  characters: Character[],
  onStream: (chunk: string) => void
): Promise<string> {
  const systemPrompt = {
    role: 'system',
    content: characters.map((c) => c.llm.systemPrompt).join('\n'),
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

  return fullResponse;
}
