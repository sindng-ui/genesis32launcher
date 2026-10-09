/**
 * weaponCategories.js
 * Definitions and grouping logic for all Genesis 3 Part 2 weapons.
 * Groups 82 weapons into 11 character/class categories with tier sorting.
 */

import { getLookupName } from '../core/dataManager.js';

export const WEAPON_GROUPS = [
  {
    label: '⚔️ 세이버 / 크리슬로우 (살라딘, 디에네)',
    items: [174, 178, 129, 130, 131, 132]
  },
  {
    label: '🗡️ 소드 / 직검 (란, 죠안, 데미안, 아델룬 등)',
    items: [56, 57, 58, 59, 60, 61, 62, 154]
  },
  {
    label: '🪓 브로드소드 / 대검 (샤크바리, 유진)',
    items: [64, 65, 66, 67, 156]
  },
  {
    label: '🔫 피스톨 / 권총 (크리스티앙, 중앙군)',
    items: [25, 26, 27, 28, 29, 30, 148]
  },
  {
    label: '💣 S&M 357 / 중화기 (리차드)',
    items: [32, 33, 34, 35, 36, 37, 150]
  },
  {
    label: '🔮 부스터 & 프리즘 / ESP (베라모드, 엠블라)',
    items: [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 134, 135, 136, 137, 138]
  },
  {
    label: '🥊 크로 / 손톱 (마리아, 격투가)',
    items: [20, 21, 22, 23, 146]
  },
  {
    label: '🪀 휠 & 요요 (루시엔, 페이온)',
    items: [10, 11, 12, 13, 142]
  },
  {
    label: '🎯 렌즈 / 광학병기 (카를로스)',
    items: [15, 16, 17, 18, 144]
  },
  {
    label: '🎀 리본 / 밍밍 (네리사)',
    items: [1, 2, 3, 4, 5, 6, 7, 140]
  },
  {
    label: '🛸 포트 / 비트 (아슈레이, 하이델룬)',
    items: [39, 40, 41, 42, 43, 152]
  },
  {
    label: '🛡️ 일반병 공용 무기',
    items: [158, 159, 197]
  }
];

/**
 * Builds HTML <option> and <optgroup> elements for weapon select dropdown.
 * @param {number} selectedId 
 * @param {Function} [lookupFn] 
 * @returns {string}
 */
export function buildWeaponOptionsHtml(selectedId, lookupFn = getLookupName) {
  let matched = selectedId === 0;
  let html = `<option value="0" ${selectedId === 0 ? 'selected' : ''}>[0] 없음</option>\n`;

  for (const group of WEAPON_GROUPS) {
    let groupHtml = '';
    for (const itemId of group.items) {
      const isSel = itemId === selectedId;
      if (isSel) matched = true;
      const name = lookupFn('itemwp', itemId, `무기 ${itemId}`);
      groupHtml += `  <option value="${itemId}" ${isSel ? 'selected' : ''}>[${itemId}] ${name}</option>\n`;
    }
    html += `<optgroup label="${group.label}">\n${groupHtml}</optgroup>\n`;
  }

  // Fallback for unknown / custom weapon ID
  if (!matched && selectedId !== undefined && selectedId !== null) {
    const unknownName = lookupFn('itemwp', selectedId, `알 수 없음 (${selectedId})`);
    html = `<option value="${selectedId}" selected>[${selectedId}] ${unknownName}</option>\n` + html;
  }

  return html;
}
