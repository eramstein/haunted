import { gs } from '../_state';
import { generateUniqueId } from '../sim/_utils/random';
import { VECTOR_OPINION } from './config';
import { getChatsForCharacters, saveRelationshipSummaryUpdate } from './index-db';
import { llmService } from './llm-service';
import { updateMemoryEntry } from './memory-vectors';

export async function updateRelationshipSummary(fromCharacterId: number, toCharacterId: number) {
  const characterNames = gs.characters.map((c) => c.name);
  const updates = await getMainRelationshipupdates(fromCharacterId, toCharacterId);
  const systemPrompt = {
    role: 'system',
    content: relUpdateSystemPrompt,
  };

  const userPrompt = {
    role: 'user',
    content: `
    {
      "from": "${characterNames[fromCharacterId]}",
      "toward": "${characterNames[toCharacterId]}",
      "previousArc": "${gs.characters[fromCharacterId].relationships[toCharacterId].summary.description}",
      "recentChanges": ${JSON.stringify(updates)}
    }`,
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
      return;
    }

    if (typeof parsed.updatedArc !== 'string') {
      console.error('Invalid response format: missing or invalid updatedArc property');
      return;
    }

    gs.characters[fromCharacterId].relationships[toCharacterId].summary = {
      description: parsed.updatedArc,
      lastUpdate: gs.time.ellapsedTime,
      cumulatedFeelingChanges: 0,
    };
    const id = generateUniqueId();
    saveRelationshipSummaryUpdate(
      id,
      fromCharacterId,
      toCharacterId,
      parsed.updatedArc,
      gs.time.ellapsedTime
    );
    updateMemoryEntry(fromCharacterId, VECTOR_OPINION + toCharacterId, parsed.updatedArc);
  } catch (error) {
    console.error('Error updating relationship summary', error);
  }
}

async function getMainRelationshipupdates(fromCharacterId: number, toCharacterId: number) {
  const relationship = gs.characters[fromCharacterId].relationships[toCharacterId];
  // get all relation updates since last update
  const chatsSinceUpdate = await getChatsForCharacters(
    [fromCharacterId, toCharacterId],
    relationship.summary.lastUpdate,
    gs.time.ellapsedTime
  );
  const relationUpdates: string[] = [];
  const includedChats: Record<string, boolean> = {};
  for (const chat of chatsSinceUpdate) {
    chat.content.relationUpdates.forEach((update) => {
      if (Math.abs(update.delta) > 0.5) {
        if (!includedChats[chat.id] && chat.content.summary !== update.cause) {
          relationUpdates.push(chat.content.summary);
          includedChats[chat.id] = true;
        }
        relationUpdates.push(update.cause);
      }
    });
  }
  return relationUpdates;
}

const relUpdateSystemPrompt = `
You are updating a fictional character’s long-term view of another character in a simulation.
This update happens only occasionally, when their relationship has evolved significantly over time.

You are given:
  The previous summary of how one character felt about the other.
  A list of important relational events and emotional shifts that occurred since the last update.
Your task is to write a new short paragraph that reflects how their relationship has evolved from the perspective of the first character.

Instructions:

Keep the summary focused on how Character A feels about Character B now, based on what’s changed.
-  Build naturally on the previous arc.
-  You may update tone, motivation, emotional closeness, admiration, resentment, protectiveness, rivalry, affection, etc.
-  Do not write about future hopes, hypothetical outcomes, or what might happen next — only reflect on the present emotional state.
-  Aim for 2 to 3 well-written sentences that feel like part of a character-driven narrative.
-  Be grounded in the actual events listed.

Format your response like this:
{
"from": "<Character A>",
"toward": "<Character B>",
"updatedArc": "<2–3 sentence summary of how Character A now views Character B>"
}

Example input:
{
"from": "Emma",
"toward": "Lise",
"previousArc": "Emma just met Lise. She feels a bit protective toward her, as Lise reminds her of a younger version of herself.",
"recentChanges": [
  "Emma promised to cover Lise’s rent for the next month after hearing about her financial troubles.",
  "Lise opened up about her fear of being a failure.",
  "Emma defended Lise in a house meeting when Joe accused her of freeloading.",
  "Lise thanked Emma with a handmade note and seemed to look up to her."
]
}

Example output:
{
"from": "Emma",
"toward": "Lise",
"updatedArc": "Emma now sees Lise as a younger sister — vulnerable but full of potential. She feels increasingly protective of her, and finds herself genuinely invested in Lise’s future. The trust Lise has shown touches Emma more than she expected."
}
`;
