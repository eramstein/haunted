// Fuzzy string matching function using Levenshtein distance
export function fuzzyMatch(searchTerm: string, target: string): number {
  const search = searchTerm.toLowerCase();
  const targetLower = target.toLowerCase();

  // Simple substring check first (exact match gets highest score)
  if (targetLower.includes(search)) {
    return 1.0;
  }

  // Check if words in search term appear in target
  const searchWords = search.split(/\s+/);
  const targetWords = targetLower.split(/\s+/);

  let matchScore = 0;
  for (const searchWord of searchWords) {
    for (const targetWord of targetWords) {
      if (targetWord.includes(searchWord) || searchWord.includes(targetWord)) {
        matchScore += 0.8;
        break;
      }
    }
  }

  if (matchScore > 0) {
    return matchScore / searchWords.length;
  }

  // Simple character-based similarity
  let commonChars = 0;
  for (const char of search) {
    if (targetLower.includes(char)) {
      commonChars++;
    }
  }

  return (commonChars / Math.max(search.length, targetLower.length)) * 0.5;
}
