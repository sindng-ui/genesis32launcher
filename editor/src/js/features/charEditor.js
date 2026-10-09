/**
 * charEditor.js
 * Updates and validates character fields safely.
 */

/**
 * Validate numeric value within range
 */
export function clamp(val, min, max, defaultVal = min) {
  const num = parseInt(val, 10);
  if (isNaN(num)) return defaultVal;
  return Math.max(min, Math.min(max, num));
}

/**
 * Update stats for a character
 */
export function updateCharacterStats(char, values) {
  if (!char) return;

  if (values.level !== undefined) {
    char.level = clamp(values.level, 1, 99);
  }
  if (values.exp !== undefined) {
    char.exp = clamp(values.exp, 0, 99999999);
  }
  if (values.lp !== undefined) {
    char.lp = clamp(values.lp, 1, 65535);
    char.hpCur = char.lp * 2;
    char.hpMax = char.lp * 2;
  }
  if (values.hpMax !== undefined) {
    char.hpMax = clamp(values.hpMax, 1, 99999);
  }
  if (values.hpCur !== undefined) {
    char.hpCur = clamp(values.hpCur, 0, char.hpMax || 99999);
    char.lp = Math.round(char.hpCur / 2);
  }
  if (values.tpMax !== undefined) {
    char.tpMax = clamp(values.tpMax, 1, 999);
  }
  if (values.tpCur !== undefined) {
    char.tpCur = clamp(values.tpCur, 0, char.tpMax || 999);
  }

  // Extended stats
  if (values.ctp !== undefined) char.ctp = clamp(values.ctp, 0, 65535);
  if (values.psy !== undefined) char.psy = clamp(values.psy, 0, 65535);
  if (values.dep !== undefined) char.dep = clamp(values.dep, 0, 65535);
  if (values.dex !== undefined) char.dex = clamp(values.dex, 0, 65535);
  if (values.atk !== undefined) char.atk = clamp(values.atk, 0, 65535);

  // Equipment & job
  if (values.job !== undefined) char.job = clamp(values.job, 0, 65535);
  if (values.style !== undefined) char.style = clamp(values.style, 0, 65535);
  if (values.corps !== undefined) char.corps = clamp(values.corps, 0, 65535);
  if (values.atType !== undefined) char.atType = clamp(values.atType, 0, 65535);

  if (values.equipWp !== undefined) char.equipWp = clamp(values.equipWp, 0, 65535);
  if (values.equipAr !== undefined) char.equipAr = clamp(values.equipAr, 0, 65535);
  if (values.equipShoe !== undefined) char.equipShoe = clamp(values.equipShoe, 0, 65535);
  if (values.equipRing !== undefined) char.equipRing = clamp(values.equipRing, 0, 65535);
  if (values.equipNeck !== undefined) char.equipNeck = clamp(values.equipNeck, 0, 65535);
  if (values.equipBelt !== undefined) char.equipBelt = clamp(values.equipBelt, 0, 65535);
}
