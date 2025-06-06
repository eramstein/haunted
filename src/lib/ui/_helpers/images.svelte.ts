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
}

export function getCharacterImage(characterId: string) {
  return images.characters?.[`../../../assets/images/characters/${characterId}.png`]?.default;
}

export function getPlaceImage(placeId: string) {
  return images.places?.[`../../../assets/images/places/${placeId}.png`]?.default;
}

export function getMapImage(mapId: string) {
  return images.maps?.[`../../../assets/images/maps/${mapId}.png`]?.default;
}
