import { config } from '../_config';
import type { Activity, Character } from '../_model/model-sim';
import { ActivityType, ObjectiveType } from '../_model/model-sim.enums';
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
  prepareMeal,
  setRomanceTask,
  romance,
} from './actions';
import { groupMeal, setGroupMealTask } from './actions/group-meal';
import { checkIfObjectiveIsSatisfied } from './objectives';
import { setSolveProblemTask } from './problems';
import { startScheduledActivity } from './schedule';

export function workOnActivities(characters: Character[], time: number) {
  characters.forEach((character) => workOnActivity(character, time));
}

function workOnActivity(character: Character, time: number) {
  if (character.activitiesScheduled[time]) {
    startScheduledActivity(character, time);
  }
  if (character.activities.length === 0) {
    setActivityFromObjective(character);
  } else {
    progressActivity(character);
    if (character.activities[0]?.progress >= 100) {
      finishActivity(character);
    }
  }
}

function setActivityFromObjective(character: Character) {
  switch (character.objective?.type) {
    case ObjectiveType.HaveMeal:
      if (
        character.needs.social > config.needs.social / 2 &&
        !character.objective?.pastAttempts?.[ActivityType.GroupMeal]
      ) {
        setGroupMealTask(character);
      } else {
        setHaveMealTask(character);
      }
      break;
    case ObjectiveType.Rest:
      setRestTask(character);
      break;
    case ObjectiveType.Socialize:
      if (
        character.needs.food > config.needs.food / 2 &&
        !character.objective?.pastAttempts?.[ActivityType.GroupMeal]
      ) {
        setGroupMealTask(character);
      } else {
        setSocializeTask(character);
      }
      break;
    case ObjectiveType.HaveFun:
      setPlayTask(character);
      break;
    case ObjectiveType.Intimacy:
      setRomanceTask(character);
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
    case ActivityType.GroupMeal:
      groupMeal(character, activity as Activity<ActivityType.GroupMeal>);
      break;
    case ActivityType.Romance:
      romance(character, activity as Activity<ActivityType.Romance>);
      break;
    case ActivityType.PrepareMeal:
      prepareMeal(character);
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

export function getActivityRemainingDuration(activity: Activity): number {
  const actionSpeed = config.actionSpeed[activity.type as keyof typeof config.actionSpeed];
  if (!actionSpeed) return 0;
  const remainingPercent = 1 - activity.progress / 100;
  return Math.ceil((100 / actionSpeed) * remainingPercent); // Duration in minutes
}

export function getActivityTypeDuration(activityType: ActivityType): number {
  const actionSpeed = config.actionSpeed[activityType as keyof typeof config.actionSpeed];
  if (!actionSpeed) return 0;
  return Math.ceil(100 / actionSpeed);
}
