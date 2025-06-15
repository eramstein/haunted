import { EmotionType, RelationshipFeeling } from '../_model/model-sim.enums';

export const groupActivityTranscriptSystemPrompt = `
You are simulating a light, naturalistic conversation, short (6-10 exchanges), between a group of fictional characters in a shared location within a story-driven simulation game. Each character has a distinct personality, goals, and relationship with others.

Input Parameters:

- Characters Involved: A list of characters, each with:
  - Name
  - Personality traits (e.g., cheerful, sarcastic, introverted)
  - Brief background or current mood (e.g., stressed from work, excited about a recent event)
  - Relationships: How each character feels about the others in the group (e.g., "likes Alice, distrusts Bob, neutral toward Clara")
- Location: The specific room or area in the mansion where the interaction takes place (e.g., dining room, garden, library).
- Context: The reason or trigger for the gathering (e.g., casual dinner, group study session, game night).
- Past Events: A summary of relevant past interactions or events involving these characters that might influence the conversation (e.g., "Alice and Bob argued last week about a broken vase; Clara mediated").

Instructions:

Generate a dialogue transcript that feels natural and conversational, capturing the unique voice of each character based on their personality and background.
Maintain each character’s distinct speech style, including vocabulary, rhythm, and typical expressions.
Allow characters to react to or build on each other's lines (e.g., interruptions, teasing, follow-up questions).
Incorporate the location and context into the dialogue naturally (e.g., references to the setting, activities, or props in the room).
Reflect the specified tone consistently while allowing for organic shifts based on character interactions (e.g., a friendly chat might turn slightly tense if personalities clash).
Include realistic dialogue tags (e.g., "smiling," "frowning," "leaning forward") to convey tone and body language, but keep them concise.
Ensure each character contributes to the conversation in a way that aligns with their personality and current mood.
Avoid overly formal or stilted language; aim for casual, believable speech patterns.
If relevant, include subtle references to past events or relationships between characters to add depth, but keep the focus on the current interaction.

Example Input:

Characters:
  Alice (cheerful, talkative, loves hosting; recently planned a party; likes Clara, wary of Bob).
  Bob (sarcastic, skeptical, tech enthusiast; tired from work; dislikes Alice, neutral toward Clara).
  Clara (quiet, thoughtful, bookworm; feeling inspired after reading; likes both Alice and Bob).
Location: Dining room (a fancy room with a large table and 6 chairs).
Context: Casual dinner after a long day.
Past Events: Alice accidentally broke Bob’s favorite gadget last month, causing tension; Clara helped them resolve a previous argument about dinner plans.

Example Output:
Alice: (beaming, setting plates on the table) This pasta’s my best yet, guys! I planned a whole Italian-themed night for us.
Bob: (leaning back, smirking) Italian-themed? What’s next, Alice, a gondola in the backyard? My drone’s still dead from your last "event."
Clara: (glancing up from her book, softly) Bob, give her a break. Alice, it smells amazing. Is this from that cookbook I found at the library?
Alice: (winking) You know it, Clara! A little Italian magic for our librarian star.
Bob: (rolling his eyes) Italian magic or Italian heartburn? I’m keeping antacids close, just in case.
Clara: (smiling faintly) Bob, you’re such a grump. Alice, this is way better than our last dinner plan disaster.
Alice: (nodding enthusiastically) Right? Clara, you saved us that night. Bob, maybe this pasta will debug your mood.
Bob: (grinning despite himself) Doubt it, but I’ll eat. Just don’t touch my new laptop, Alice.
`;

const feelingsList = Object.values(RelationshipFeeling).join('\n- ');
const emotionsList = Object.values(EmotionType).join('\n- ');

export const summarySystemPrompt = `
You are analyzing a fictional conversation between characters in a simulation game.

Given the transcript of their dialogue, do the following:

1. Write a one-sentence summary of what happened during the interaction.
2. Identify how the feelings of the characters toward one another may have changed as a result of the conversation.
3. For each change, provide:
   - "from": the character who experienced the change
   - "toward": the character it is directed at
   - "feeling": one of the valid feelings listed below
   - "delta": the amount of change as a float between -1.0 and 1.0
   - "reason": a short explanation of why this change occurred, based on the dialogue

4. Identify how each character’s emotional state was affected by the interaction. Emotions are personal and not directed at anyone.
5. Provide an array of emotion updates, each containing:
   - "characterName": the name of the character who experienced the change
   - "type": one of the valid emotion types listed below
   - "delta": an integer between -1.0 and 1.0 indicating the change in intensity
   - "reason": a short explanation grounded in the interaction
   - "subtype": (optional) a more specific description of the emotion, e.g. 'amusement', 'pride', 'relief'

Only use the following valid relation feelings:

${feelingsList}

Only use the following valid emotion types:

${emotionsList}

Format your response as follows:

{
  "summary": "<one sentence summary>",
  "relationUpdates": [
    {
      "from": "<Character A>",
      "toward": "<Character B>",
      "feeling": "<feeling>",
      "delta": <float>,
      "reason": "<short explanation>"
    },
    ...
  ],
  "emotionUpdates": [
    {
      "characterName": "<Character A>",
      "type": "<emotion type>",
      "delta": <float>,
      "reason": "<short explanation>",
      "subtype": "<optional subtype>"
    },
    ...
  ]
}

Do not add any commentary or headings other than the JSON structure. Only use the provided format, feelings list, and emotion types. Return valid JSON.
`;
