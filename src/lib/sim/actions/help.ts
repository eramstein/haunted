import type { Activity, Character, Problem, RelationshipUpdate } from '@/lib/_model/model-sim';
import {
  ActivityType,
  ProblemReason,
  ProblemType,
  RelationshipFeeling,
} from '@/lib/_model/model-sim.enums';
import { finishActivity } from '../activities';
import { gs } from '@/lib/_state';
import { promptUser, closePrompt, uiState } from '@/lib/_state/state-ui.svelte';
import { giftFood, giftMoney } from './gift';
import { updateRelationships } from '../relationships';
import { solveProblem } from '../problems';
import { generateUniqueId } from '../_utils/random';
import { aiInitiatesChat, characterAskingForHelp, saveChat, ToolType } from '@/lib/llm';
import { llmService } from '@/lib/llm/llm-service';
import { useTool } from '../tool-use';

export function askForHelp(character: Character, activity: Activity<ActivityType.AskForHelp>) {
  if (character.problems.length === 0) {
    finishActivity(character);
    return;
  }
  const problem = character.objective?.target as Problem;
  const helper = gs.characters[activity.target];
  promptUser({
    title: `${character.name} asks ${helper.name} for help`,
    options: [
      {
        label: 'Quick resolution',
        action: () => quickResolution(character, helper, problem),
      },
      {
        label: 'Let LLM solve',
        action: () => letLLMSolve(character, helper, problem),
      },
      {
        label: 'Play as helper',
        action: () => playAsHelper(character, helper),
      },
    ],
  });
}

function quickResolution(
  character: Character,
  helper: Character,
  problem: Problem,
  transcript?: string
) {
  // check if character accepts to help (TODO)
  const accepts = true;
  if (!accepts) {
    finishActivity(character);
    return;
  }
  // check if they could help
  let didHelp = '';
  const didNotHelp = helper.name + ' refused to help ' + character.name;
  switch (problem.type) {
    case ProblemType.NoFood:
      if (problem.cause === ProblemReason.NoIncome) {
        const moneyGifted = giftMoney(helper, character, 100);
        if (moneyGifted > 0) {
          didHelp = helper.name + ' gave ' + character.name + ' money';
        }
      } else {
        const food = giftFood(helper, character);
        if (food) {
          didHelp = helper.name + ' gave ' + character.name + ' food (' + food.description + ')';
        }
      }
      break;
  }
  // update feelings and solve problem
  resolveHelpRequest(character, helper, problem, didHelp, didNotHelp, transcript || '');
}

async function letLLMSolve(character: Character, helper: Character, problem: Problem) {
  const response = await characterAskingForHelp(character, helper, problem);
  if (response.toolCalls.length === 0) {
    console.error('help request: LLM failure, no tool calls, revert on auto resolve');
    quickResolution(character, helper, problem, response.conversation);
    return;
  }
  const toolCall = response.toolCalls[0];
  const outcome = useTool(
    helper,
    toolCall.function.name,
    llmService.getToolArguments(toolCall.function.arguments)
  );
  const didHelp = toolCall.function.name !== ToolType.RefuseHelp ? outcome : '';
  const didNotHelp = toolCall.function.name === ToolType.RefuseHelp ? outcome : '';

  // update feelings and solve problem
  resolveHelpRequest(character, helper, problem, didHelp, didNotHelp, response.conversation);
}

function playAsHelper(character: Character, helper: Character) {
  closePrompt();
  aiInitiatesChat(helper, character, ActivityType.AskForHelp);
  // help request will be resolved on chat end
}

function resolveHelpRequest(
  character: Character,
  helper: Character,
  problem: Problem,
  didHelp: string,
  didNotHelp: string,
  transcript: string
) {
  const relationUpdates: RelationshipUpdate[] = [];
  if (didHelp) {
    relationUpdates.push({
      from: character.name,
      toward: helper.name,
      feeling: RelationshipFeeling.Gratitude,
      delta: 10,
      cause: didHelp,
    });
    solveProblem(character, problem);
  } else {
    relationUpdates.push({
      from: character.name,
      toward: helper.name,
      feeling: RelationshipFeeling.Gratitude,
      delta: -10,
      cause: didNotHelp,
    });
  }
  finishActivity(character);
  updateRelationships(relationUpdates);
  // log that chat happened
  const id = generateUniqueId();
  saveChat(
    id,
    gs.time.ellapsedTime,
    [character.id, helper.id],
    character.place,
    ActivityType.AskForHelp,
    {
      transcript,
      summary: didHelp || didNotHelp,
      relationUpdates,
      emotionUpdates: [],
    }
  );
  uiState.userPromptFeedback = `
    ${didHelp || didNotHelp} \n\n
    ${transcript}
  `;
}
