// Import all card images
export let images: Record<string, Record<string, { default: string }>> = $state({});

export function loadImages() {
  images.characters = import.meta.glob('../../../assets/images/characters/*.png', {
    eager: true,
  }) as Record<string, { default: string }>;
  images.places = import.meta.glob('../../../assets/images/places/*.png', {
    eager: true,
  }) as Record<string, { default: string }>;
  images.maps = import.meta.glob('../../../assets/images/maps/*.png', {
    eager: true,
  }) as Record<string, { default: string }>;
  images.icons = import.meta.glob('../../../assets/images/icons/*.png', {
    eager: true,
  }) as Record<string, { default: string }>;
}

export function getCharacterImage(characterName: string) {
  return images.characters?.[`../../../assets/images/characters/${characterName.toLowerCase()}.png`]
    ?.default;
}

export function getPlaceImage(placeImage: string) {
  return images.places?.[`../../../assets/images/places/${placeImage}.png`]?.default;
}

export function getMapImage(mapId: string) {
  return images.maps?.[`../../../assets/images/maps/${mapId}.png`]?.default;
}

export function getItemIcon(type: string) {
  return images.icons?.['../../../assets/images/icons/icons.png']?.default;
}

export function getItemIconPosition(type: string) {
  // Map of item types to their position in the sprite sheet
  const typePositions: Record<string, number> = {
    FoodIngredient: 0,
    Meal: 4,
    Drink: 3,
    // Add more types as needed
  };

  const position = typePositions[type] || 0;
  return `-${position * 32}px 0`;
}
