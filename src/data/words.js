// src/data/words.js
// API-based solution to fetch random words
export const easyWords = Array.from({ length: 50 }, (_, i) => `easyword${i + 1}`);
export const intermediateWords = Array.from({ length: 50 }, (_, i) => `intermediate${i + 1}`);
export const hardWords = Array.from({ length: 50 }, (_, i) => `hardword${i + 1}`);
