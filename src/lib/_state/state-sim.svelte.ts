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
    objective: null,
    needs: {
      food: config.needs.food,
      sleep: 0,
      fun: config.needs.fun - 180,
      social: config.needs.social - 120,
    },
    relationships: getRelationships(character),
    emotions: {
      mood: 50,
      dominantEmotion: null,
      byType: character.emotionalProfile,
    },
    failedObjectives: {},
    problems: [],
  };
}

function getRelationships(character: CharacterBase) {
  const relationships: Record<number, Relationship> = {};
  NPCS.forEach((otherCharacter, index) => {
    if (otherCharacter.name === character.name) return;
    relationships[index] = {
      status: RelationshipStatus.Unknown,
      feelings: {},
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
