import type { Item, ItemType, ItemIndices } from '../_model/model-sim';
import { gs } from '../_state';

function generateUniqueId(): string {
  return crypto.randomUUID();
}

export function addItem(item: Omit<Item, 'id'>): Item {
  const id = generateUniqueId();
  const newItem: Item = {
    ...item,
    id,
  };

  gs.items[id] = newItem;

  // Update type index
  if (!gs.itemIndices.byType[item.type]) {
    gs.itemIndices.byType[item.type] = [];
  }
  gs.itemIndices.byType[item.type]!.push(id);

  // Update owner index
  if (!gs.itemIndices.byOwner[item.ownerId]) {
    gs.itemIndices.byOwner[item.ownerId] = [];
  }
  gs.itemIndices.byOwner[item.ownerId].push(id);

  // Update location index
  if (!gs.itemIndices.byLocation[item.locationId]) {
    gs.itemIndices.byLocation[item.locationId] = [];
  }
  gs.itemIndices.byLocation[item.locationId].push(id);

  // Update type-owner index
  const typeOwnerKey = `${item.type}-${item.ownerId}`;
  if (!gs.itemIndices.byTypeAndOwner[typeOwnerKey]) {
    gs.itemIndices.byTypeAndOwner[typeOwnerKey] = [];
  }
  gs.itemIndices.byTypeAndOwner[typeOwnerKey].push(id);

  return newItem;
}

export function removeItem(itemId: string) {
  const item = gs.items[itemId];
  if (!item) return;

  // Remove from all indices
  if (gs.itemIndices.byType[item.type]) {
    gs.itemIndices.byType[item.type] = gs.itemIndices.byType[item.type]!.filter(
      (id) => id !== itemId
    );
  }
  if (gs.itemIndices.byOwner[item.ownerId]) {
    gs.itemIndices.byOwner[item.ownerId] = gs.itemIndices.byOwner[item.ownerId].filter(
      (id) => id !== itemId
    );
  }
  if (gs.itemIndices.byLocation[item.locationId]) {
    gs.itemIndices.byLocation[item.locationId] = gs.itemIndices.byLocation[item.locationId].filter(
      (id) => id !== itemId
    );
  }
  const typeOwnerKey = `${item.type}-${item.ownerId}`;
  if (gs.itemIndices.byTypeAndOwner[typeOwnerKey]) {
    gs.itemIndices.byTypeAndOwner[typeOwnerKey] = gs.itemIndices.byTypeAndOwner[
      typeOwnerKey
    ].filter((id) => id !== itemId);
  }

  // Remove from main storage
  delete gs.items[itemId];
}

export function moveItem(itemId: string, newLocationId: number) {
  const item = gs.items[itemId];
  if (!item) return;

  // Remove from old location index
  if (gs.itemIndices.byLocation[item.locationId]) {
    gs.itemIndices.byLocation[item.locationId] = gs.itemIndices.byLocation[item.locationId].filter(
      (id) => id !== itemId
    );
  }

  // Update item location
  item.locationId = newLocationId;

  // Add to new location index
  if (!gs.itemIndices.byLocation[newLocationId]) {
    gs.itemIndices.byLocation[newLocationId] = [];
  }
  gs.itemIndices.byLocation[newLocationId].push(itemId);
}

export function transferItem(itemId: string, newOwnerId: string) {
  const item = gs.items[itemId];
  if (!item) return;

  // Remove from old owner indices
  if (gs.itemIndices.byOwner[item.ownerId]) {
    gs.itemIndices.byOwner[item.ownerId] = gs.itemIndices.byOwner[item.ownerId].filter(
      (id) => id !== itemId
    );
  }
  const oldTypeOwnerKey = `${item.type}-${item.ownerId}`;
  if (gs.itemIndices.byTypeAndOwner[oldTypeOwnerKey]) {
    gs.itemIndices.byTypeAndOwner[oldTypeOwnerKey] = gs.itemIndices.byTypeAndOwner[
      oldTypeOwnerKey
    ].filter((id) => id !== itemId);
  }

  // Update item owner
  item.ownerId = newOwnerId;

  // Add to new owner indices
  if (!gs.itemIndices.byOwner[newOwnerId]) {
    gs.itemIndices.byOwner[newOwnerId] = [];
  }
  gs.itemIndices.byOwner[newOwnerId].push(itemId);

  const newTypeOwnerKey = `${item.type}-${newOwnerId}`;
  if (!gs.itemIndices.byTypeAndOwner[newTypeOwnerKey]) {
    gs.itemIndices.byTypeAndOwner[newTypeOwnerKey] = [];
  }
  gs.itemIndices.byTypeAndOwner[newTypeOwnerKey].push(itemId);
}

export function getItemsByType(type: ItemType): Item[] {
  const itemIds = gs.itemIndices.byType[type] || [];
  return itemIds.map((id) => gs.items[id]);
}

export function getItemsByOwner(ownerId: string): Item[] {
  const itemIds = gs.itemIndices.byOwner[ownerId] || [];
  return itemIds.map((id) => gs.items[id]);
}

export function getItemsByLocation(locationId: number): Item[] {
  const itemIds = gs.itemIndices.byLocation[locationId] || [];
  return itemIds.map((id) => gs.items[id]);
}

export function getItemsByTypeAndOwner(type: ItemType, ownerId: string): Item[] {
  const typeOwnerKey = `${type}-${ownerId}`;
  const itemIds = gs.itemIndices.byTypeAndOwner[typeOwnerKey] || [];
  return itemIds.map((id) => gs.items[id]);
}
