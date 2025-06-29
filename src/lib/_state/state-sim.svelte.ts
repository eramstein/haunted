import type { Character, State, Place, Relationship, CharacterBase } from '../_model/model-sim';
import { PLACES } from '@/data/world/places';
import { NPCS } from '@/data/npcs';
import { RelationshipStatus } from '../_model/model-sim.enums';
import { config } from '../_config';

export const initialState: State = {
  time: {
    startDate: (() => {
      const date = new Date();
      date.setHours(6, 0, 0, 0);
      return date;
    })(),
    ellapsedTime: 0,
    lightLevel: 1,
    dateString: '06:00',
  },
  places: PLACES.map(initPlace),
  characters: NPCS.map(initCharacter),
  player: {
    place: 0, // Default to first place
  },
  items: {},
  itemIndices: {
    byType: {},
    byOwnerId: {},
    byLocationId: {},
    byTypeAndOwner: {},
  },
  chat: null,
};

function initCharacter(character: CharacterBase, index: number): Character {
  return {
    ...character,
    id: index,
    place: 0, // Default to first place
    activities: [],
    activitiesScheduled: {},
    objective: null,
    needs: {
      food: 0,
      sleep: 0,
      fun: 0,
      social: config.needs.social - 240,
      intimacy: config.needs.intimacy,
    },
    relationships: getRelationships(character),
    emotions: {
      mood: 50,
      dominantEmotion: null,
      byType: character.emotionalProfile,
    },
    onHoldObjectives: {},
    problems: [],
  };
}

function getRelationships(character: CharacterBase) {
  const relationships: Record<number, Relationship> = {};
  NPCS.forEach((otherCharacter, index) => {
    if (otherCharacter.name === character.name) return;
    relationships[index] = {
      status: RelationshipStatus.Unknown,
      feelings: {
        affection: character.name === 'Emma' && otherCharacter.name === 'Molly' ? 100 : 0,
      },
      summary: {
        description:
          character.name + ' just met ' + otherCharacter.name + '. They live in the same mansion.',
        lastUpdate: 0,
        cumulatedFeelingChanges: 0,
      },
    };
  });
  return relationships;
}

function initPlace(place: Omit<Place, 'id'>, index: number): Place {
  return {
    ...place,
    id: index,
  };
}
