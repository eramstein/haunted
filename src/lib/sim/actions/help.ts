import { config } from '@/lib/_config/config';
import type { Activity, Character, Problem, RelationshipUpdate } from '@/lib/_model/model-sim';
import {
  ActivityType,
  ProblemReason,
  ProblemType,
  RelationshipFeeling,
} from '@/lib/_model/model-sim.enums';
import { finishActivity } from '../activities';
import { gs } from '@/lib/_state';
import { promptUser } from '@/lib/_state/state-ui.svelte';
import { giftFood, giftMoney } from './gift';
import { increaseFeelingValue } from '../relationships';
import { solveProblem } from '../problems';
import { saveChat } from '@/lib/llm/index-db';
import { generateUniqueId } from '../_utils/random';

export function askForHelp(character: Character, activity: Activity<ActivityType.AskForHelp>) {
  if (character.problems.length === 0) {
    finishActivity(character);
    return;
  }
  const problem = character.problems[0];
  const helper = gs.characters[activity.target];
  console.log(`${character.name} asks ${helper.name} for help with ${problem.type}`);
  // TODO: prompt player to choose: quick resolution, let LLM solve, or play as helper
  promptUser({
    title: `Ask for help`,
    options: [
      {
        label: 'Quick resolution',
        action: () => quickResolution(character, helper, activity, problem),
      },
      { label: 'Let LLM solve', action: () => letLLMSolve(character, helper, activity, problem) },
      { label: 'Play as helper', action: () => playAsHelper(character, helper, activity, problem) },
    ],
  });
}

function quickResolution(
  character: Character,
  helper: Character,
  activity: Activity<ActivityType.AskForHelp>,
  problem: Problem
) {
  // check if character accepts to help (TODO)
  const accepts = true;
  if (!accepts) {
    finishActivity(character);
    return;
  }
  // check if they could help
  let didHelp = '';
  const didntHelp = helper.name + ' refused to help ' + character.name;
  switch (problem.type) {
    case ProblemType.NoFood:
      if (problem.reason === ProblemReason.NoIncome) {
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
  const relationUpdates: RelationshipUpdate[] = [];
  if (didHelp) {
    relationUpdates.push({
      from: character.name,
      toward: helper.name,
      feeling: RelationshipFeeling.Gratitude,
      delta: 10,
      reason: didHelp,
    });
    solveProblem(character, problem);
  } else {
    relationUpdates.push({
      from: character.name,
      toward: helper.name,
      feeling: RelationshipFeeling.Gratitude,
      delta: -10,
      reason: didntHelp,
    });
  }
  finishActivity(character);
  // log that chat happened
  console.log(didHelp);
  const id = generateUniqueId();
  saveChat(id, gs.time.ellapsedTime, [character.id, helper.id], character.place, activity.type, {
    transcript: '',
    summary: didHelp || didntHelp,
    relationUpdates,
    emotionUpdates: [],
  });
}

function letLLMSolve(
  character: Character,
  helper: Character,
  activity: Activity<ActivityType.AskForHelp>,
  problem: Problem
) {
  console.log('let LLM solve');
}

function playAsHelper(
  character: Character,
  helper: Character,
  activity: Activity<ActivityType.AskForHelp>,
  problem: Problem
) {
  console.log('play as helper');
}
