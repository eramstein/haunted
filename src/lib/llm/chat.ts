import { llmService } from './llm-service';
import type { Character, GroupActivitySummary, Place } from '../_model';
import { ActivityType } from '../_model/model-sim.enums';
import { saveChat, updateChatContent } from './index-db';
import { groupActivityTranscriptSystemPrompt, summarySystemPrompt } from './chat-system-prompts';
import { activityTypeToContext, getGroupDescription } from './chat-helpers';
import { gs, saveStateToLocalStorage } from '../_state';
import { updateRelationships } from '../sim/relationships';

export async function generateGroupActivityTranscript(
  chatId: string,
  characters: Character[],
  place: Place,
  activityType: ActivityType,
  onStream: (chunk: string) => void
): Promise<string> {
  const systemPrompt = {
    role: 'system',
    content: groupActivityTranscriptSystemPrompt,
  };

  const context = activityTypeToContext[activityType] || '';
  const locationDescription = place.name + ', ' + place.description || '';
  const charactersDescription = getGroupDescription(characters);
  const timeOfDay = gs.time.dateString.split(' ').pop() || '';

  const userPrompt = {
    role: 'user',
    content: `
      - Characters:
        ${charactersDescription}
      - Location: ${locationDescription}
      - Context: ${context}. Time of day ${timeOfDay}.
      - Past Events: none.
    `,
  };

  const stream = await llmService.chat({
    messages: [systemPrompt, userPrompt],
    stream: true,
    options: {
      temperature: 0.7,
      repeat_penalty: 1.1,
      top_k: 40,
      top_p: 0.9,
    },
  });

  let transcript = '';
  for await (const chunk of stream) {
    const convertedChunk = llmService.getStreamChunk(chunk);
    transcript += convertedChunk;
    onStream?.(convertedChunk);
  }

  console.log('transcript', transcript);

  const postProcessing = await generateSummary(transcript);

  console.log('postProcessing', postProcessing);

  // store full chat in the database
  await updateChatContent(chatId, {
    transcript,
    summary: postProcessing.summary,
    updates: postProcessing.updates,
  });

  // update relationships
  updateRelationships(postProcessing.updates);
  saveStateToLocalStorage();

  return transcript;
}

async function generateSummary(transcript: string): Promise<GroupActivitySummary> {
  const systemPrompt = {
    role: 'system',
    content: summarySystemPrompt,
  };

  const userPrompt = {
    role: 'user',
    content: `Transcript: ${transcript}`,
  };

  const response = await llmService.chat({
    messages: [systemPrompt, userPrompt],
    responseFormat: { type: 'json_object' },
  });

  const formattedResponse = llmService.getMessage(response);

  try {
    const parsed = JSON.parse(formattedResponse);

    if (!parsed || typeof parsed !== 'object') {
      console.error('Invalid response format: expected an object');
      return { summary: '', updates: [], transcript };
    }

    if (typeof parsed.summary !== 'string') {
      console.error('Invalid response format: missing or invalid summary property');
      return { summary: '', updates: [], transcript };
    }

    if (!parsed.updates || typeof parsed.updates !== 'object') {
      console.error('Invalid response format: missing or invalid updates property');
      return { summary: '', updates: [], transcript };
    }

    return parsed;
  } catch (error) {
    return { summary: '', updates: [], transcript };
  }
}
