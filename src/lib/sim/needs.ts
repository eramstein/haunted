import { gs } from '../_state';

export function updateCharactersNeeds() {
  gs.characters.forEach((character) => {
    character.needs.food += 1;
    character.needs.sleep += 1;
    character.needs.fun += 1;
    character.needs.social += 1;
  });
}
