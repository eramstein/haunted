import { LABELS_ACTIVITY_TYPES } from '../_config/labels';
import type { Activity } from '../_model/model-sim';
import { ActivityType } from '../_model/model-sim.enums';
import { gs } from '../_state';

export function getActivityLabel(activity: Activity) {
  if (!activity) return 'None';
  let targetName = '';
  switch (activity.type) {
    case ActivityType.GoTo:
      targetName = gs.places[(activity as Activity<ActivityType.GoTo>).target]?.name || '';
      break;
    default:
      break;
  }
  return LABELS_ACTIVITY_TYPES[activity.type] + ' ' + targetName;
}
