export function generateUniqueId(): string {
  return crypto.randomUUID();
}

export function getRandomItemFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
