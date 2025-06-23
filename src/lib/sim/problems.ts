import type { Character, Objective, Problem } from '@/lib/_model/model-sim';
import {
  ActivityType,
  EmotionType,
  ItemType,
  ObjectiveType,
  ProblemReason,
  ProblemType,
} from '../_model/model-sim.enums';
import { config } from '../_config/config';
import { updateEmotionValue } from './emotions';
import { getBestFriend } from './relationships';
import { setCharactersObjectives } from './objectives';
import { getItemsByTypeAndOwner } from './items';

export function recordProblem(character: Character, objective: Objective) {
  let problemReason = ProblemReason.NoReason;
  let problemType = ProblemType.NoProblem;

  // define problem based on failed objective
  switch (objective.type) {
    case ObjectiveType.GetMoney:
      problemType = ProblemType.NoMoney;
      problemReason = ProblemReason.NoIncome;
      break;
  }

  // overwrite in case of urgent need
  if (character.needs.food > config.needs.food) {
    problemType = ProblemType.NoFood;
  }

  // add problem if not already recorded
  if (
    character.problems.findIndex((p) => p.type === problemType && p.cause === problemReason) === -1
  ) {
    character.problems.push({
      type: problemType,
      cause: problemReason,
    });
  }
  problemEmotionImpact(character, problemType);
}

export function stringifyProblem(problem: Problem) {
  return problem.type + ' because ' + problem.cause;
}

function problemEmotionImpact(character: Character, problemType: ProblemType) {
  switch (problemType) {
    case ProblemType.NoFood:
      updateEmotionValue(EmotionType.Fear, character.id, 100);
      break;
    case ProblemType.NoMoney:
      updateEmotionValue(EmotionType.Sadness, character.id, 100);
      break;
  }
}

export function setSolveProblemTask(character: Character) {
  const askedForHelp = getBestFriend(character);
  character.activities.push({
    type: ActivityType.GoTo,
    progress: 0,
    target: askedForHelp.place,
  });
  character.activities.push({
    type: ActivityType.AskForHelp,
    progress: 0,
    target: askedForHelp.id,
  });
}

export function solveProblem(character: Character, problem: Problem) {
  character.problems = character.problems.filter(
    (p) => p.type !== problem.type && p.cause !== problem.cause
  );
  character.failedObjectives = {};
  setCharactersObjectives([character]);
}

export function checkIfProblemSolved(character: Character, problem: Problem) {
  let solved = false;
  console.log('checkIfProblemSolved', character, problem);
  switch (problem.type) {
    case ProblemType.NoFood:
      const meal = getItemsByTypeAndOwner(ItemType.Meal, character.id);
      const food = getItemsByTypeAndOwner(ItemType.FoodIngredient, character.id);
      solved =
        (problem.cause === ProblemReason.NoIncome && character.money >= 30) ||
        meal.length > 0 ||
        food.length > 0;
      break;
    case ProblemType.NoMoney:
      solved = character.money >= 100;
      break;
  }
  console.log('solved', solved);
  if (solved) {
    solveProblem(character, problem);
  }
  return solved;
}
