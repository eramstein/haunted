import type { Activity, Character } from '../_model/model-sim';
import { ActivityType, ItemType, ObjectiveType } from '../_model/model-sim.enums';
import {
  move,
  cook,
  eat,
  setHaveMealTask,
  sleep,
  setRestTask,
  setSocializeTask,
  chat,
  setPlayTask,
  play,
  buy,
  setGetMoneyTask,
  work,
  askForHelp,
} from './actions';
import { checkIfObjectiveIsSatisfied } from './objectives';
import { setSolveProblemTask } from './problems';

export function workOnActivities(characters: Character[]) {
  characters.forEach(workOnActivity);
}

function workOnActivity(character: Character) {
  if (character.activities.length === 0) {
    setActivityFromObjective(character);
  } else {
    progressActivity(character);
    if (character.activities[0].progress >= 100) {
      finishActivity(character);
    }
  }
}

function setActivityFromObjective(character: Character) {
  switch (character.objective?.type) {
    case ObjectiveType.HaveMeal:
      setHaveMealTask(character);
      break;
    case ObjectiveType.Rest:
      setRestTask(character);
      break;
    case ObjectiveType.Socialize:
      setSocializeTask(character);
      break;
    case ObjectiveType.HaveFun:
      setPlayTask(character);
      break;
    case ObjectiveType.GetMoney:
      setGetMoneyTask(character);
      break;
    case ObjectiveType.SolveProblem:
      setSolveProblemTask(character);
      break;
    default:
      break;
  }
}

export function progressActivity(character: Character) {
  if (character.activities.length === 0) return;
  const activity = character.activities[0];
  switch (activity.type) {
    case ActivityType.GoTo:
      move(character, activity as Activity<ActivityType.GoTo>);
      break;
    case ActivityType.Eat:
      eat(character, activity as Activity<ActivityType.Eat>);
      break;
    case ActivityType.Sleep:
      sleep(character, activity as Activity<ActivityType.Sleep>);
      break;
    case ActivityType.Cook:
      cook(character, activity as Activity<ActivityType.Cook>);
      break;
    case ActivityType.Chat:
      chat(character, activity as Activity<ActivityType.Chat>);
      break;
    case ActivityType.Play:
      play(character, activity as Activity<ActivityType.Play>);
      break;
    case ActivityType.Buy:
      buy(character, activity as Activity<ActivityType.Buy>);
      break;
    case ActivityType.Work:
      work(character, activity as Activity<ActivityType.Work>);
      break;
    case ActivityType.AskForHelp:
      askForHelp(character, activity as Activity<ActivityType.AskForHelp>);
      break;
    default:
      break;
  }
}

export function finishActivity(character: Character) {
  character.activities.shift();
  if (character.objective) {
    const objectiveCompleted = checkIfObjectiveIsSatisfied(character, character.objective);
    if (objectiveCompleted) {
      character.objective = null;
    }
  }
}
