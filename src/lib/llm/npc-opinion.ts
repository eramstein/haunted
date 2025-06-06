import type { CharacterOpinion, ChatState } from '../_model/model-llm';
import { llmService } from './llm-service';
import { LLM_MODEL } from './config';
import { BasicScale, RelationshipStatus, TimePeriod } from '../_config';
import { PLAYER_CONFIG } from '@/data/npcs/player';

const RESPECT_DESCRIPTION = {
  [BasicScale.VeryLow]: 'treat him as completely incompetent',
  [BasicScale.Low]: 'treat him as inferior',
  [BasicScale.Medium]: 'treat him as competent but unproven',
  [BasicScale.High]: 'treat him as a peer',
  [BasicScale.VeryHigh]: 'treat him as a superior',
};

const FRIENDLINESS_DESCRIPTION = {
  [BasicScale.VeryLow]: 'be cold and dismissive, avoiding personal engagement',
  [BasicScale.Low]: 'be distant and curt, limiting warmth in interactions',
  [BasicScale.Medium]: 'be neutral but open, with a polite and professional tone',
  [BasicScale.High]: 'be warm and welcoming, encouraging friendly banter',
  [BasicScale.VeryHigh]: 'be exceptionally warm, treating him like a close friend',
};

const ATTRACTION_DESCRIPTION = {
  [BasicScale.VeryLow]:
    'show no romantic or personal interest, keeping interactions strictly platonic',
  [BasicScale.Low]: 'show minimal interest, with no romantic cues or flirtation',
  [BasicScale.Medium]: 'show mild interest, with subtle hints of curiosity or charm',
  [BasicScale.High]: 'show clear romantic interest, using playful flirtation or compliments',
  [BasicScale.VeryHigh]:
    'show strong romantic interest, with overt flirtation and personal engagement',
};

const TRUST_DESCRIPTION = {
  [BasicScale.VeryLow]: 'be highly suspicious, questioning his motives and actions',
  [BasicScale.Low]: 'be cautious, hesitant to share information or collaborate',
  [BasicScale.Medium]: 'be cautiously open, willing to engage but guarding sensitive details',
  [BasicScale.High]: 'be trusting, sharing information and collaborating freely',
  [BasicScale.VeryHigh]: 'be fully trusting, confiding personal secrets and relying on him',
};

export function updateNpcOpinion(chat: ChatState, character: string, newEventsSummary: string) {
  const previousOpinion = chat.characterOpinions[character];

  const basicScaleValues = Object.values(BasicScale)
    .map((s) => `"${s}"`)
    .join(', ');
  const relationshipStatusValues = Object.values(RelationshipStatus)
    .map((s) => `"${s}"`)
    .join(', ');
  const timePeriodValues = Object.values(TimePeriod)
    .map((s) => `"${s}"`)
    .join(', ');

  const prompt = `
    Generate or update the current opinion of ${character} about ${PLAYER_CONFIG.name} based on their previous opinion and new memories from the latest session. Output a single JSON object with the ${character}'s opinion, structured as follows:

    - summary: A concise narrative summary (2-4 sentences) describing the NPC's current feelings and perspective toward the player, reflecting recent interactions and shared interests.
    - gameTags: An object with the following required fields:
    - respect: One of [${basicScaleValues}].
    - friendliness: One of [${basicScaleValues}].
    - attraction: One of [${basicScaleValues}].
    - trust: One of [${basicScaleValues}].
    - relationshipStatus: One of [${relationshipStatusValues}].
    - relationTags: Other list of keywords describing the relationship (e.g., ["rival", "same_hobby", "neighbours"]).
    - knownSince: One of [${timePeriodValues}].
        
    Instructions:

    Use the provided previous opinion and new memories to update the NPC's opinion.
    Ensure the summary reflects the NPC's personality, recent interactions, and evolving relationship with the player.
    Set properties based on the memories' sentiment, trait_expressed, and context (e.g., shared interests, events like visiting Le Chat Noir).
    Use only the allowed values for enum fields.
    Output only the JSON object, with no additional text.
    Previous Opinion:
    summary: ${previousOpinion.summary}
    gameTags: ${JSON.stringify(previousOpinion.gameTags)}

    New Memories:
    ${newEventsSummary}

    Output Format:
    {
      "summary": "string",
      "gameTags": {
        "respect": "string",
        "friendliness": "string",
        "knownSince": "string",
        "attraction": "string",
        "trust": "string",
        "relationshipStatus": "string",
        "relationTags": ["string"]
      }
    }
  `;

  llmService
    .chat({
      model: LLM_MODEL,
      messages: [{ role: 'system', content: prompt }],
      stream: false,
      responseFormat: { type: 'json_object' },
    })
    .then((m) => {
      const opinion = llmService.getMessage(m);
      console.log('new opinion', opinion);
      chat.characterOpinions[character] = JSON.parse(opinion);
    });
}

export function getNpcOpinion(opinion: CharacterOpinion) {
  return `
    Summary: ${opinion.summary}
    Respect: ${RESPECT_DESCRIPTION[opinion.gameTags.respect]}
    Friendliness: ${FRIENDLINESS_DESCRIPTION[opinion.gameTags.friendliness]}
    Attraction: ${ATTRACTION_DESCRIPTION[opinion.gameTags.attraction]}
    Trust: ${TRUST_DESCRIPTION[opinion.gameTags.trust]}
    Relationship: ${opinion.gameTags.relationshipStatus}
    Known since: ${opinion.gameTags.knownSince}
    Tags: ${opinion.gameTags.relationTags.join(', ')}
  `;
}
