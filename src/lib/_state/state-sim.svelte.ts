import type {
  CharacterBase,
  Character,
  State,
  Place,
  Relationship,
  CharacterDefinition,
} from '../_model/model-sim';
import { PLACES } from '@/data/world/places';
import { NPCS } from '@/data/npcs';
import { RelationshipStatus } from '../_model/model-sim.enums';

export const initialState: State = {
  time: {
    startDate: new Date(),
    ellapsedTime: 0,
    lightLevel: 1,
    dateString: '12:00',
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
};

function initCharacter(character: CharacterDefinition, index: number): Character {
  return {
    ...character,
    id: index,
    place: 0, // Default to first place
    activities: [],
    objective: null,
    needs: {
      food: 0,
      sleep: 0,
      fun: 0,
      social: 1440,
    },
    relationships: getRelationships(character),
    emotions: {
      mood: 50,
      dominantEmotion: null,
      byType: character.emotionalProfile,
    },
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
