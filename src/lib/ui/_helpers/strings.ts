export function splitCamelCase(type: string): string {
  return type
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim(); // Remove any leading/trailing spaces
}
