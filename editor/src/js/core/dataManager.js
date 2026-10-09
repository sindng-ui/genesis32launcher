/**
 * dataManager.js
 * Manages game metadata (character names, jobs, skills, items, styles).
 * Uses static embedded metadata for zero-latency, offline O(1) performance.
 */

import { GAME_DATA } from './gameData.js';

let gameData = GAME_DATA;
const lookupCache = new Map();

/**
 * Initialize game data (synchronous or static fallback)
 */
export async function initGameData(externalData = null) {
  if (externalData) {
    gameData = externalData;
  } else {
    gameData = GAME_DATA;
  }
  return gameData;
}

/**
 * Get category item dictionary
 * @param {string} category 
 * @returns {Record<number, string>}
 */
export function getCategoryMap(category) {
  if (!gameData) return {};
  return gameData[category] || {};
}

/**
 * Get display name by category and numeric ID with memoization
 * @param {string} category 
 * @param {number} id 
 * @param {string|null} defaultVal 
 * @returns {string}
 */
export function getLookupName(category, id, defaultVal = null) {
  const cacheKey = `${category}:${id}`;
  if (lookupCache.has(cacheKey)) {
    return lookupCache.get(cacheKey);
  }

  const map = getCategoryMap(category);
  let name = defaultVal !== null ? defaultVal : `알 수 없음 (${id})`;

  if (map && map[id] !== undefined) {
    name = map[id];
  } else if (map && map[String(id)] !== undefined) {
    name = map[String(id)];
  }

  lookupCache.set(cacheKey, name);
  return name;
}

/**
 * Get category options list for dropdowns [{ id, name }]
 * @param {string} category 
 * @returns {Array<{ id: number, name: string }>}
 */
export function getCategoryOptions(category) {
  const map = getCategoryMap(category);
  const list = [];
  for (const [k, v] of Object.entries(map)) {
    list.push({ id: parseInt(k, 10), name: v });
  }
  list.sort((a, b) => a.id - b.id);
  return list;
}
