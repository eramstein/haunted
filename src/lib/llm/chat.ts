import { llmService } from './llm-service';
import type { Character, GroupActivitySummary, Place } from '../_model';
import { ActivityType } from '../_model/model-sim.enums';
import { updateChatContent } from './index-db';
import {
  groupActivityTranscriptSystemPrompt,
  playerChatSystemPrompt,
  summarySystemPrompt,
} from './chat-system-prompts';
import {
  activityTypeToContext,
  describeEmotionChanges,
  getActivityContext,
  getGroupDescription,
} from './chat-helpers';
import { gs, saveStateToLocalStorage } from '../_state';
import { uiState } from '../_state/state-ui.svelte';
import { updateRelationships } from '../sim/relationships';
import { addGroupActivityMemory } from './memory-vectors';
import { getTimeOfDay } from '../sim/time';
import { getSystemPromptMemories } from './memory';
import { checkIfProblemSolved, updateEmotions } from '../sim';
import { generateUniqueId } from '../sim/_utils/random';

export async function groupChat(
  chatId: string,
  timestamp: number,
  characters: Character[],
  place: Place,
  activityType: ActivityType
): Promise<string> {
  const memories = await getSystemPromptMemories(timestamp, characters, place, activityType);
  const memoriesPrompt = memories
    ? `Relevant Memory:\nThe characters remember a past event that may influence today's conversation:\n"${memories}"`
    : '';

  const systemPrompt = {
    role: 'system',
    content: `${groupActivityTranscriptSystemPrompt}\n\n${memoriesPrompt}`,
  };

  const context = activityTypeToContext[activityType] || '';
  const locationDescription = place.name + ', ' + place.description || '';
  const charactersDescription = getGroupDescription(characters);
  const timeOfDay = getTimeOfDay(timestamp);

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

  // Start streaming
  uiState.isStreaming = true;
  uiState.streamingContent = '';

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
    uiState.streamingContent = transcript;
  }

  // End streaming
  uiState.isStreaming = false;
  uiState.streamingContent = '';

  const postProcessing = await generateSummary(transcript);

  // store full chat in the database
  await updateChatContent(chatId, {
    transcript,
    summary: postProcessing.summary,
    relationUpdates: postProcessing.relationUpdates,
    emotionUpdates: postProcessing.emotionUpdates,
  });

  // store embedded vectors
  addGroupActivityMemory({
    id: chatId,
    timestamp,
    participants: characters.map((c) => c.id),
    location: place.id,
    activityType,
    content: postProcessing,
  });
  console.log('postProcessing', postProcessing);
  // update relationships and emotions
  updateRelationships(postProcessing.relationUpdates);
  updateEmotions(postProcessing.emotionUpdates);

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
      return { summary: '', relationUpdates: [], emotionUpdates: [], transcript };
    }

    if (typeof parsed.summary !== 'string') {
      console.error('Invalid response format: missing or invalid summary property');
      return { summary: '', relationUpdates: [], emotionUpdates: [], transcript };
    }

    if (!parsed.relationUpdates || typeof parsed.relationUpdates !== 'object') {
      console.error('Invalid response format: missing or invalid relationUpdates property');
      return { summary: '', relationUpdates: [], emotionUpdates: [], transcript };
    }

    if (!parsed.emotionUpdates || typeof parsed.emotionUpdates !== 'object') {
      console.error('Invalid response format: missing or invalid emotionUpdates property');
      return { summary: '', relationUpdates: [], emotionUpdates: [], transcript };
    }

    return parsed;
  } catch (error) {
    return { summary: '', relationUpdates: [], emotionUpdates: [], transcript };
  }
}

export async function playerSendChat(
  message: string,
  playerCharacter: Character,
  otherCharacters: Character[],
  activityType: ActivityType
): Promise<string> {
  if (!gs.chat) {
    initPlayerChat(playerCharacter, otherCharacters, activityType);
  }
  if (message === 'end') {
    endPlayerChat();
    return '';
  }
  const place = gs.places[playerCharacter.place];
  const timestamp = gs.time.ellapsedTime;
  const memories = await getSystemPromptMemories(timestamp, otherCharacters, place, activityType);
  const memoriesPrompt = memories ? `Relevant Memories:\n"${memories}"` : '';
  const context = getActivityContext(activityType, [playerCharacter, ...otherCharacters]);
  const locationDescription = place.name + ', ' + place.description || '';
  const charactersDescription = getGroupDescription([playerCharacter, ...otherCharacters]);
  const timeOfDay = getTimeOfDay(timestamp);
  const currentSummary = gs.chat!.summary
    ? 'Previous Conversation Summary:\n' + gs.chat!.summary
    : '';

  const systemPrompt = {
    role: 'system',
    content: `${playerChatSystemPrompt.intro}

    Player Character:
      - The player controls ${playerCharacter.name}.
      - Do not write any dialogue, actions, body language, thoughts, or emotions for ${playerCharacter.name}.
      - The player will describe ${playerCharacter.name}'s dialogue and actions.

    NPC Control:
    - You control all other characters (NPCs).
    - Only write dialogue, actions, thoughts, emotions, and reactions for the NPCs.
    - NPCs should respond naturally and believably to ${playerCharacter.name} actions and words.

    Narrative Style:
    - Use immersive third-person narration for the NPCs you control.
    - Include their body language, tone of voice, emotions, and internal thoughts.
    - Do not include any narrative prose describing ${playerCharacter.name}.
    - If NPCs react to ${playerCharacter.name} actions or emotions, describe their perception or interpretation (e.g., “Lise noticed the tension in ${playerCharacter.name}'s voice.”), but do not narrate ${playerCharacter.name}'s state directly.

    Scene Context:
      - Location: ${locationDescription}
      - Time of Day: ${timeOfDay}
      - Current Activity: ${context}

    Characters:
    ${charactersDescription}

    ${memoriesPrompt}

    ${currentSummary}

    ${playerChatSystemPrompt.instruction}
    
    Example Output Style (NPC-only):
    Lise’s eyes darted nervously toward ${playerCharacter.name}. She took a shaky breath, her voice trembling.
    “I… I really hope I’m not imposing,” she whispered, twisting her fingers anxiously.

    She glanced down at the tiled floor, her cheeks flushed with embarrassment, awaiting ${playerCharacter.name}’s response.
    `,
  };
  console.log('systemPrompt', systemPrompt);

  // reset initial system prompt
  gs.chat!.history[0] = systemPrompt;

  const userPrompt = {
    role: 'user',
    content: message,
  };

  gs.chat!.history.push(userPrompt);

  // Start streaming
  uiState.isStreaming = true;
  uiState.streamingContent = '';

  const stream = await llmService.chat({
    messages: gs.chat!.history.slice(-6),
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
    uiState.streamingContent = transcript;
  }

  // End streaming
  uiState.isStreaming = false;
  uiState.streamingContent = '';

  gs.chat!.history.push({
    role: 'assistant',
    content: transcript,
  });

  // every 10 messages, add a summary to the chat history
  // the 2nd system prompt is the summary
  const SUMMARY_INTERVAL = 10;

  if ((gs.chat!.history.length - 1) % SUMMARY_INTERVAL <= 1) {
    const currentSummary = gs.chat!.summary;
    const messagesToSummarize = gs
      .chat!.history.filter((m) => m.role !== 'system')
      .slice(2 - SUMMARY_INTERVAL)
      .map((m) => m.content || '')
      .join(' \n');
    const summayPrompt = currentSummary
      ? 'Summary of previous events: ' + currentSummary + '\n\n New events:' + messagesToSummarize
      : messagesToSummarize;
    const summary = await generateSummary(summayPrompt);
    gs.chat!.summary = summary.summary;
    const emotionChanges = describeEmotionChanges(summary.emotionUpdates);
    if (emotionChanges) {
      gs.chat!.summary += '\n\nEmotional Developments: ' + emotionChanges;
    }
    gs.chat!.previousUpdates.push(summary);
    gs.chat!.lastSummaryMessageIndex = gs.chat!.history.length - 1;
    updateRelationships(summary.relationUpdates);
    updateEmotions(summary.emotionUpdates);
    saveStateToLocalStorage();
  }

  return transcript;
}

export async function aiInitiatesChat(
  playerCharacter: Character,
  aiCharacter: Character,
  activityType: ActivityType
): Promise<string> {
  if (!gs.chat) {
    initPlayerChat(playerCharacter, [aiCharacter], activityType);
  }
  const place = gs.places[playerCharacter.place];
  const timestamp = gs.time.ellapsedTime;
  const memories = await getSystemPromptMemories(timestamp, [aiCharacter], place, activityType);
  const memoriesPrompt = memories ? `Relevant Memories:\n"${memories}"` : '';
  const context = getActivityContext(activityType, [aiCharacter, playerCharacter]);
  const locationDescription = place.name + ', ' + place.description || '';
  const charactersDescription = getGroupDescription([playerCharacter, aiCharacter]);
  const timeOfDay = getTimeOfDay(timestamp);

  const systemPrompt = {
    role: 'system',
    content: `
    You are the AI game master for a collaborative novel-style simulation.
    You are playing the character ${aiCharacter.name}.
    You are initiating a chat with the player character ${playerCharacter.name}.
    You are in the location ${locationDescription} at ${timeOfDay}.
       
    Characters:
    ${charactersDescription}

    ${memoriesPrompt}

    ${aiCharacter.name} has come to see ${playerCharacter.name} because ${context}.
    Write what ${aiCharacter.name} says and does to begin the conversation.
    `,
  };
  console.log('systemPrompt', systemPrompt);

  // reset initial system prompt
  gs.chat!.history[0] = systemPrompt;

  // Start streaming
  uiState.isStreaming = true;
  uiState.streamingContent = '';

  const stream = await llmService.chat({
    messages: gs.chat!.history,
    stream: true,
  });

  let transcript = '';
  for await (const chunk of stream) {
    const convertedChunk = llmService.getStreamChunk(chunk);
    transcript += convertedChunk;
    uiState.streamingContent = transcript;
  }

  // End streaming
  uiState.isStreaming = false;
  uiState.streamingContent = '';

  gs.chat!.history.push({
    role: 'assistant',
    content: transcript,
  });

  return transcript;
}

export function initPlayerChat(
  character: Character,
  otherCharacters: Character[],
  activityType: ActivityType = ActivityType.Chat
) {
  gs.chat = {
    playingAsCharacter: character,
    otherCharacters: otherCharacters,
    activityType,
    history: [],
    summary: '',
    previousUpdates: [],
    lastSummaryMessageIndex: 0,
  };
}

export async function endPlayerChat() {
  const chatId = generateUniqueId();
  // complete the summary with last messages
  const currentSummary = gs.chat!.summary;
  const messagesToSummarize = gs
    .chat!.history.filter((m) => m.role !== 'system')
    .slice(gs.chat!.lastSummaryMessageIndex + 1)
    .map((m) => m.content || '')
    .join(' \n');
  const summayPrompt = currentSummary
    ? 'Summary of previous events: ' + currentSummary + '\n\n New events:' + messagesToSummarize
    : messagesToSummarize;
  const summary = await generateSummary(summayPrompt);

  // update relationships and emotions
  updateRelationships(summary.relationUpdates);
  updateEmotions(summary.emotionUpdates);

  // store full chat in the database
  await updateChatContent(
    chatId,
    {
      transcript: gs
        .chat!.history.filter((m) => m.role !== 'system')
        .map((m) => m.content)
        .join('\n'),
      summary: summary.summary,
      relationUpdates: [
        ...gs.chat!.previousUpdates.flatMap((u) => u.relationUpdates),
        ...summary.relationUpdates,
      ],
      emotionUpdates: [
        ...gs.chat!.previousUpdates.flatMap((u) => u.emotionUpdates),
        ...summary.emotionUpdates,
      ],
    },
    {
      timestamp: gs.time.ellapsedTime,
      participants: [gs.chat!.playingAsCharacter.id, ...gs.chat!.otherCharacters.map((c) => c.id)],
      location: gs.chat!.playingAsCharacter.place,
      activityType: gs.chat!.activityType,
    }
  );

  // store embedded vectors
  addGroupActivityMemory({
    id: chatId,
    timestamp: gs.time.ellapsedTime,
    participants: [gs.chat!.playingAsCharacter.id, ...gs.chat!.otherCharacters.map((c) => c.id)],
    location: gs.chat!.playingAsCharacter.place,
    activityType: gs.chat!.activityType,
    content: summary,
  });

  // if activity was ask for help, check if the problem is soved
  if (gs.chat!.activityType === ActivityType.AskForHelp) {
    const character = gs.characters[gs.chat!.otherCharacters[0].id];
    checkIfProblemSolved(character, character.objective?.target);
  }
  gs.chat = null;
}
