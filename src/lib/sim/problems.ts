import type { Character, Objective } from '@/lib/_model/model-sim';

export function recordProblem(character: Character, objective: Objective) {
  character.problems.push('Failed to ' + objective.type);
}
