/**
 * Very small, deterministic pluralizer
 * - no magic
 * - no locale
 * - REST-oriented
 */
export function pluralize(word: string): string {
  if (word.endsWith("y") && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + "ies";
  }

  if (word.endsWith("s") || word.endsWith("x") || word.endsWith("z")) {
    return word + "es";
  }

  if (word.endsWith("ch") || word.endsWith("sh")) {
    return word + "es";
  }

  return word + "s";
}
