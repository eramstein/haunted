import { ActivityType, ObjectiveType } from '../_model/model-sim.enums';

export const LABELS_OBJECTIVE_TYPES: Record<ObjectiveType, string> = {
  [ObjectiveType.HaveMeal]: 'Have a meal',
  [ObjectiveType.Rest]: 'Rest',
  [ObjectiveType.HaveFun]: 'Have fun',
  [ObjectiveType.Socialize]: 'Socialize',
};

export const LABELS_ACTIVITY_TYPES: Record<ActivityType, string> = {
  [ActivityType.Eat]: 'Eat',
  [ActivityType.GoTo]: 'Go to',
  [ActivityType.Cook]: 'Cook',
  [ActivityType.Sleep]: 'Sleep',
  [ActivityType.Play]: 'Play',
  [ActivityType.Chat]: 'Chat',
};
