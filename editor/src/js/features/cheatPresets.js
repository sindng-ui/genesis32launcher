/**
 * cheatPresets.js
 * One-click cheat presets for individual characters or all characters.
 */

/**
 * Apply Max Stats to a single character
 * @param {import('../core/saveParser.js').CharacterRecord} char 
 */
export function applyMaxStats(char) {
  char.hpCur = 9999;
  char.hpMax = 9999;
  char.lp = 4999;
  char.tpCur = 200;
  char.tpMax = 200;
  char.ctp = 250;
  char.psy = 250;
  char.dep = 250;
  char.dex = 250;
  char.atk = 250;
}

/**
 * Apply Max Level (Lv 99, 9,999,999 EXP)
 * @param {import('../core/saveParser.js').CharacterRecord} char 
 */
export function applyMaxLevel(char) {
  char.level = 99;
  char.exp = 9999999;
}

/**
 * Apply Ultimate Gear to a character
 * Sets best weapon, armor, and accessories
 * @param {import('../core/saveParser.js').CharacterRecord} char 
 */
export function applyUltimateGear(char) {
  // Ceramic/Bouncer armor (e.g. 73 세라믹 아머)
  char.equipAr = 73;
  // Lambert accessories
  char.equipShoe = 87; // 87: 램버트 슈즈
  char.equipRing = 99; // 99: 램버트 반지
  char.equipNeck = 104; // 104: 천신경
  char.equipBelt = 93; // 93: 램버트 벨트
}

/**
 * Apply all cheats to all characters in the save file
 * @param {import('../core/saveParser.js').SaveFile} saveFile 
 */
export function applyAllCharactersMax(saveFile) {
  if (!saveFile || !saveFile.characters) return 0;
  let count = 0;
  for (const char of saveFile.characters) {
    applyMaxStats(char);
    applyMaxLevel(char);
    count++;
  }
  return count;
}
