import { llmService } from './llm-service';
import type { Memory } from '../_model';
import { BasicScale } from '../_config';
import { gs } from '../_state';

export async function generateMemories(chatTranscript: string): Promise<Memory[]> {
  let memoryCount = 1;
  if (chatTranscript.length > 5000) {
    memoryCount = 3;
  } else if (chatTranscript.length > 2000) {
    memoryCount = 2;
  }
  const importanceValues = Object.values(BasicScale)
    .map((s) => `"${s}"`)
    .join(', ');
  const systemMessage = {
    role: 'system',
    content: `
    Summarize the provided chat history into ${memoryCount}-${memoryCount + 1} distinct memories, each focusing on a specific event or topic (e.g., game outcome, social interaction, card trade, future plans). For each memory:
      1. Generate a concise summary (2-4 sentences) capturing the id details.
      2. Provide metadata in JSON format with the following required fields:
        - interaction_type: One of ["game_session", "tournament", "card_trade", "social_event", "conversation"].
        - relationship_status: One of ["friend", "rival", "neutral", "romantic_interest"].
        - sentiment: One of ["amused", "friendly", "tense", "frustrated", "excited", "curious", "confident", "nervous", "competitive", "playful", "nostalgic", "annoyed", "relaxed", "suspicious", "grateful", "disappointed", "eager", "sympathetic", "defensive", "inspired", "indifferent", "jealous", "proud", "embarrassed", "hopeful", "irritated", "warm", "cautious", "admiring", "bored"].
        - trait_expressed: One of ["playful", "strategic", "shy", "bold", "witty", "serious", "kind", "competitive", "curious", "charming", "skeptical", "energetic", "pensive", "loyal", "sarcastic", "optimistic", "cautious", "creative", "grumpy", "confident", "nostalgic", "patient", "impulsive", "helpful", "arrogant", "inquisitive", "relaxed", "proud", "empathetic", "mischievous"].
        - memory_importance: One of [${importanceValues}]        
        - tags: A comma-separated list of tags that describe the memory. For example: "travel, proposition, negociation, emotional_reaction".
        4. Output the result as a JSON array of objects, each with "summary" and "metadata" keys.
      5. Do not include any text outside the JSON output.

      **Chat History**:
      ${chatTranscript}

      **Output Format**:
      [
        {
          "summary": "Summary text here",
          "metadata": {
            "interaction_type": "string",
            "relationship_status": "string",
            "sentiment": "string",
            "trait_expressed": "string",
            "memory_importance": "string",
            "tags": "string"
          }
        },
        ...
      ]
    `,
  };
  const response = await llmService.chat({
    messages: [systemMessage],
    responseFormat: { type: 'json_object' },
  });

  try {
    const json = JSON.parse(llmService.getMessage(response));
    console.log('json', json);
    if (!Array.isArray(json)) {
      return [];
    }
    return json.map((memory: any) => {
      const baseMetadata = {
        time: new Date(gs.time.startDate.getTime() + gs.time.ellapsedTime * 60000).toISOString(),
        place: gs.places[gs.player.place].name,
        memory_type: 'player_interaction',
      };
      if (!memory.summary || !memory.metadata) {
        return {
          summary: JSON.stringify(memory),
          metadata: baseMetadata,
        };
      }
      const metadata = {
        ...baseMetadata,
        ...memory.metadata,
      };
      const summaryWithTags = `${memory.metadata.tags ? `[${memory.metadata.tags}]:` : ''} ${memory.summary}`;
      return {
        summary: summaryWithTags,
        metadata,
      };
    });
  } catch (error) {
    console.log('invalid json', error);
    return [];
  }
}
