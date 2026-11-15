/**
 * Normalize free text for keyword matching.
 * NFKC folds full/half width and compatibility forms, katakana is folded to hiragana,
 * and whitespace, punctuation and symbols are removed so that "Cant  find!" and "cantfind" match alike.
 */
export function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u30A1-\u30F6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}
