import type { Item } from '../_model/model-sim';
import { ItemType } from '../_model/model-sim.enums';
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
  if (!gs.itemIndices.byOwnerId[item.owner]) {
    gs.itemIndices.byOwnerId[item.owner] = [];
  }
  gs.itemIndices.byOwnerId[item.owner].push(id);

  // Update location index
  if (!gs.itemIndices.byLocationId[item.location]) {
    gs.itemIndices.byLocationId[item.location] = [];
  }
  gs.itemIndices.byLocationId[item.location].push(id);

  // Update type-owner index
  const typeOwnerKey = `${item.type}-${item.owner}`;
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
  if (gs.itemIndices.byOwnerId[item.owner]) {
    gs.itemIndices.byOwnerId[item.owner] = gs.itemIndices.byOwnerId[item.owner].filter(
      (id) => id !== itemId
    );
  }
  if (gs.itemIndices.byLocationId[item.location]) {
    gs.itemIndices.byLocationId[item.location] = gs.itemIndices.byLocationId[item.location].filter(
      (id) => id !== itemId
    );
  }
  const typeOwnerKey = `${item.type}-${item.owner}`;
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
  if (gs.itemIndices.byLocationId[item.location]) {
    gs.itemIndices.byLocationId[item.location] = gs.itemIndices.byLocationId[item.location].filter(
      (id) => id !== itemId
    );
  }

  // Update item location
  item.location = newLocationId;

  // Add to new location index
  if (!gs.itemIndices.byLocationId[newLocationId]) {
    gs.itemIndices.byLocationId[newLocationId] = [];
  }
  gs.itemIndices.byLocationId[newLocationId].push(itemId);
}

export function transferItem(itemId: string, newOwnerId: number) {
  const item = gs.items[itemId];
  if (!item) return;

  // Remove from old owner indices
  if (gs.itemIndices.byOwnerId[item.owner]) {
    gs.itemIndices.byOwnerId[item.owner] = gs.itemIndices.byOwnerId[item.owner].filter(
      (id) => id !== itemId
    );
  }
  const oldTypeOwnerKey = `${item.type}-${item.owner}`;
  if (gs.itemIndices.byTypeAndOwner[oldTypeOwnerKey]) {
    gs.itemIndices.byTypeAndOwner[oldTypeOwnerKey] = gs.itemIndices.byTypeAndOwner[
      oldTypeOwnerKey
    ].filter((id) => id !== itemId);
  }

  // Update item owner
  item.owner = newOwnerId;

  // Add to new owner indices
  if (!gs.itemIndices.byOwnerId[newOwnerId]) {
    gs.itemIndices.byOwnerId[newOwnerId] = [];
  }
  gs.itemIndices.byOwnerId[newOwnerId].push(itemId);

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

export function getItemsByOwner(ownerId: number): Item[] {
  const itemIds = gs.itemIndices.byOwnerId[ownerId] || [];
  return itemIds.map((id) => gs.items[id]);
}

export function getItemsByLocation(locationId: number): Item[] {
  const itemIds = gs.itemIndices.byLocationId[locationId] || [];
  return itemIds.map((id) => gs.items[id]);
}

export function getItemsByTypeAndOwner(type: ItemType, ownerId: number): Item[] {
  const typeOwnerKey = `${type}-${ownerId}`;
  const itemIds = gs.itemIndices.byTypeAndOwner[typeOwnerKey] || [];
  return itemIds.map((id) => gs.items[id]);
}
