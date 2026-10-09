/**
 * saveParser.js
 * Multi-format parser for Genesis 3 Part 2 save files.
 * Automatically detects:
 *   Format A: 932-byte (0x3A4) master pool records (e.g. G3P_II00.sav, world/party saves)
 *   Format B: 327-byte (0x147) battle records (e.g. G3P_II20.sav, tactical battle saves)
 */

import { readUint16, writeUint16, readUint32, writeUint32 } from './saveCodec.js';

export const STRIDE_327 = 0x147; // 327 bytes
export const STRIDE_932 = 0x3A4; // 932 bytes

export const KNOWN_HERO_IDS = new Set([
  27, 30, 228, 229, 437, 443, 449, 450, 451, 452, 455, 456, 458, 459, 460, 462, 463, 464, 466,
  467, 470, 472, 475, 477, 479, 1170, 1171, 1173, 1692, 1943, 2392, 2423
]);

/**
 * Format B (327 bytes) offsets
 */
export const OFFSETS_327 = {
  ID: 0x000,
  ID_MIRROR: 0x0EA,
  LEVEL: 0x0EE,
  JOB: 0x0D8,
  STYLE: 0x0DC,
  CORPS: 0x0D6,
  AT_TYPE: 0x0D4,
  EXP: 0x130,
  HP_CUR: 0x136,
  HP_MAX: 0x13C,
  TP_CUR: 0x138,
  TP_MAX: 0x13E,
  EQUIP_WP: 0x100,
  EQUIP_AR: 0x102,
  EQUIP_NECK: 0x104,
  EQUIP_RING: 0x106,
  EQUIP_BELT: 0x108,
  EQUIP_SHOE: 0x10A,
};

/**
 * Format A (932 bytes) offsets
 * Verified against G3P_II01.sav (Saladin: Lv 4, Exp 318, LP 1132, TP 173, Wp 174, Ar 177)
 */
export const OFFSETS_932 = {
  ID: 0x000,
  ID_MIRROR: 0x002,
  JOB: 0x00A,
  STYLE: 0x00C,
  CORPS: 0x00E,
  AT_TYPE: 0x014,
  ATK: 0x024,
  LEVEL: 0x026,
  EXP: 0x02A,
  LP: 0x02E,
  PSY: 0x036,
  TP: 0x038,
  CTP: 0x03C,
  DEP: 0x03E,
  DEX: 0x040,
  EQUIP_WP: 0x046,
  EQUIP_AR: 0x048,
  EQUIP_NECK: 0x04A,
  EQUIP_RING: 0x04C,
  EQUIP_BELT: 0x04E,
  EQUIP_SHOE: 0x050,
};

export class CharacterRecord {
  constructor(rawBytes, startOffset, index, formatType = '327') {
    this.rawBytes = rawBytes;
    this.startOffset = startOffset;
    this.index = index;
    this.formatType = formatType;
    this.offsets = formatType === '932' ? OFFSETS_932 : OFFSETS_327;
    this.load();
  }

  load() {
    const o = this.startOffset;
    const b = this.rawBytes;
    const off = this.offsets;

    this.id = readUint16(b, o + off.ID);
    this.idMirror = readUint16(b, o + off.ID_MIRROR);
    this.level = readUint16(b, o + off.LEVEL);

    if (this.formatType === '932') {
      // 932 format: Exp is DWORD at 0x2A
      this.exp = readUint32(b, o + off.EXP);
      // In Genesis 3 Part 2, HP = LP * 2
      this.lp = readUint16(b, o + off.LP);
      this.hpCur = this.lp * 2;
      this.hpMax = this.lp * 2;
      this.tpCur = readUint16(b, o + off.TP);
      this.tpMax = this.tpCur;

      // Extended stats in 932 format
      this.psy = readUint16(b, o + off.PSY);
      this.ctp = readUint16(b, o + off.CTP);
      this.dep = readUint16(b, o + off.DEP);
      this.dex = readUint16(b, o + off.DEX);
      this.atk = readUint16(b, o + off.ATK);
    } else {
      // 327 format: battle save format
      this.exp = off.EXP ? readUint32(b, o + off.EXP) : 0;
      this.hpCur = readUint16(b, o + off.HP_CUR);
      this.hpMax = readUint16(b, o + off.HP_MAX);
      this.tpCur = readUint16(b, o + off.TP_CUR);
      this.tpMax = readUint16(b, o + off.TP_MAX);
      this.lp = Math.round(this.hpCur / 2);
      this.psy = 0;
      this.ctp = 0;
      this.dep = 0;
      this.dex = 0;
      this.atk = 0;
    }

    this.job = readUint16(b, o + off.JOB);
    this.style = readUint16(b, o + off.STYLE);
    this.corps = readUint16(b, o + off.CORPS);
    this.atType = readUint16(b, o + off.AT_TYPE);

    this.equipWp = readUint16(b, o + off.EQUIP_WP);
    this.equipAr = readUint16(b, o + off.EQUIP_AR);
    this.equipNeck = readUint16(b, o + off.EQUIP_NECK);
    this.equipRing = readUint16(b, o + off.EQUIP_RING);
    this.equipBelt = readUint16(b, o + off.EQUIP_BELT);
    this.equipShoe = readUint16(b, o + off.EQUIP_SHOE);
  }

  save() {
    const o = this.startOffset;
    const b = this.rawBytes;
    const off = this.offsets;

    writeUint16(b, o + off.ID, this.id);
    writeUint16(b, o + off.ID_MIRROR, this.id);
    writeUint16(b, o + off.LEVEL, this.level);

    if (this.formatType === '932') {
      writeUint32(b, o + off.EXP, this.exp);
      // Synchronize LP and HP
      const savedLp = this.lp > 0 ? this.lp : Math.round(this.hpCur / 2);
      writeUint16(b, o + off.LP, savedLp);
      writeUint16(b, o + off.TP, this.tpCur);

      if (off.PSY) writeUint16(b, o + off.PSY, this.psy || 0);
      if (off.CTP) writeUint16(b, o + off.CTP, this.ctp || 0);
      if (off.DEP) writeUint16(b, o + off.DEP, this.dep || 0);
      if (off.DEX) writeUint16(b, o + off.DEX, this.dex || 0);
      if (off.ATK) writeUint16(b, o + off.ATK, this.atk || 0);
    } else {
      if (off.EXP) writeUint32(b, o + off.EXP, this.exp);
      writeUint16(b, o + off.HP_CUR, this.hpCur);
      writeUint16(b, o + off.HP_MAX, this.hpMax);
      writeUint16(b, o + off.TP_CUR, this.tpCur);
      writeUint16(b, o + off.TP_MAX, this.tpMax);
    }

    writeUint16(b, o + off.JOB, this.job);
    writeUint16(b, o + off.STYLE, this.style);
    writeUint16(b, o + off.CORPS, this.corps);
    writeUint16(b, o + off.AT_TYPE, this.atType);

    writeUint16(b, o + off.EQUIP_WP, this.equipWp);
    writeUint16(b, o + off.EQUIP_AR, this.equipAr);
    writeUint16(b, o + off.EQUIP_NECK, this.equipNeck);
    writeUint16(b, o + off.EQUIP_RING, this.equipRing);
    writeUint16(b, o + off.EQUIP_BELT, this.equipBelt);
    writeUint16(b, o + off.EQUIP_SHOE, this.equipShoe);
  }
}

export class SaveFile {
  constructor(decodedBytes) {
    this.decodedBytes = decodedBytes;
    this.characters = [];
    this.formatType = 'unknown';
    this.tableStartOffset = 0;
    this.stride = 0;
    this.inventoryStore = null;
    this.parseCharacters();
    if (typeof window !== 'undefined' && window.G3Inventory && window.G3Inventory.InventoryStore) {
      this.inventoryStore = new window.G3Inventory.InventoryStore(decodedBytes);
    }
  }

  detectAndParse() {
    const b = this.decodedBytes;
    const len = b.length;

    // 1. Try Format A: 932 bytes (stride 0x3A4)
    // Scan for record where rec[0:2] == rec[2:4] and ID is known hero with valid level (1-99)
    for (let off = 0; off <= len - STRIDE_932; off++) {
      const id1 = readUint16(b, off);
      const id2 = readUint16(b, off + 2);
      if (id1 > 0 && id1 === id2 && KNOWN_HERO_IDS.has(id1)) {
        const lv = readUint16(b, off + OFFSETS_932.LEVEL);
        if (lv >= 1 && lv <= 99) {
          // Check if there are multiple records matching stride 0x3A4
          let matches = 1;
          for (let step = 1; step <= 3; step++) {
            const nextOff = off + step * STRIDE_932;
            if (nextOff + 4 <= len) {
              const nid1 = readUint16(b, nextOff);
              const nid2 = readUint16(b, nextOff + 2);
              if (nid1 > 0 && nid1 === nid2) matches++;
            }
          }
          if (matches >= 2) {
            this.formatType = '932';
            this.tableStartOffset = off;
            this.stride = STRIDE_932;
            return;
          }
        }
      }
    }

    // 2. Try Format B: 327 bytes (stride 0x147)
    const defaultOffset327 = 0x156DD;
    if (defaultOffset327 + STRIDE_327 <= len) {
      const id1 = readUint16(b, defaultOffset327 + OFFSETS_327.ID);
      const id2 = readUint16(b, defaultOffset327 + OFFSETS_327.ID_MIRROR);
      if (id1 > 0 && id1 === id2) {
        this.formatType = '327';
        this.tableStartOffset = defaultOffset327;
        this.stride = STRIDE_327;
        return;
      }
    }

    // Dynamic scan fallback for 327 bytes
    for (let off = 0; off <= len - (STRIDE_327 * 2); off++) {
      const id1 = readUint16(b, off + OFFSETS_327.ID);
      const id2 = readUint16(b, off + OFFSETS_327.ID_MIRROR);
      if (id1 > 0 && id1 === id2 && KNOWN_HERO_IDS.has(id1)) {
        const nid1 = readUint16(b, off + STRIDE_327 + OFFSETS_327.ID);
        const nid2 = readUint16(b, off + STRIDE_327 + OFFSETS_327.ID_MIRROR);
        if (nid1 > 0 && nid1 === nid2) {
          this.formatType = '327';
          this.tableStartOffset = off;
          this.stride = STRIDE_327;
          return;
        }
      }
    }
  }

  parseCharacters() {
    this.characters = [];
    this.detectAndParse();

    if (!this.stride || this.tableStartOffset === 0) {
      return;
    }

    const b = this.decodedBytes;
    const len = b.length;
    let curOff = this.tableStartOffset;
    let idx = 0;

    const isFormat932 = this.formatType === '932';
    const mirrorOffset = isFormat932 ? 2 : OFFSETS_327.ID_MIRROR;

    while (curOff + this.stride <= len) {
      const charId = readUint16(b, curOff);
      const mirrorId = readUint16(b, curOff + mirrorOffset);

      if (charId > 0 && charId === mirrorId) {
        const charRec = new CharacterRecord(b, curOff, idx, this.formatType);
        this.characters.push(charRec);
      } else {
        // In 932 format, some slots might be empty or skipped, check if next slot exists
        if (isFormat932 && curOff + this.stride * 2 <= len) {
          const nextId = readUint16(b, curOff + this.stride);
          const nextMirror = readUint16(b, curOff + this.stride + 2);
          if (nextId > 0 && nextId === nextMirror) {
            curOff += this.stride;
            continue;
          }
        }
        break;
      }

      curOff += this.stride;
      idx++;
    }
  }

  commitAll() {
    for (const char of this.characters) {
      char.save();
    }
    this.syncAllInstances();
    if (this.inventoryStore && this.inventoryStore.available) {
      this.inventoryStore.ensureEquippedItems(this.characters);
    }
  }

  syncAllInstances() {
    const b = this.decodedBytes;
    const len = b.length;
    if (this.formatType !== '932') return;

    const heroMap = new Map();
    for (const char of this.characters) {
      heroMap.set(char.id, char);
    }

    // Scan through the entire save file for any duplicate 932-byte records of these heroes
    for (let off = 0; off <= len - STRIDE_932; off++) {
      const id1 = readUint16(b, off);
      const id2 = readUint16(b, off + 2);
      if (id1 > 0 && id1 === id2 && heroMap.has(id1)) {
        const char = heroMap.get(id1);
        if (off !== char.startOffset) {
          const lv = readUint16(b, off + OFFSETS_932.LEVEL);
          if (lv >= 1 && lv <= 99) {
            // Synchronize equipment
            writeUint16(b, off + OFFSETS_932.EQUIP_WP, char.equipWp);
            writeUint16(b, off + OFFSETS_932.EQUIP_AR, char.equipAr);
            writeUint16(b, off + OFFSETS_932.EQUIP_NECK, char.equipNeck);
            writeUint16(b, off + OFFSETS_932.EQUIP_RING, char.equipRing);
            writeUint16(b, off + OFFSETS_932.EQUIP_BELT, char.equipBelt);
            writeUint16(b, off + OFFSETS_932.EQUIP_SHOE, char.equipShoe);

            // Synchronize stats
            writeUint16(b, off + OFFSETS_932.LEVEL, char.level);
            writeUint32(b, off + OFFSETS_932.EXP, char.exp);
            writeUint16(b, off + OFFSETS_932.LP, char.lp);
            writeUint16(b, off + OFFSETS_932.TP, char.tpCur);
            writeUint16(b, off + OFFSETS_932.ATK, char.atk);
            writeUint16(b, off + OFFSETS_932.DEP, char.dep);
            writeUint16(b, off + OFFSETS_932.DEX, char.dex);
            writeUint16(b, off + OFFSETS_932.PSY, char.psy);
            writeUint16(b, off + OFFSETS_932.CTP, char.ctp);
            writeUint16(b, off + OFFSETS_932.JOB, char.job);
            writeUint16(b, off + OFFSETS_932.STYLE, char.style);
            writeUint16(b, off + OFFSETS_932.CORPS, char.corps);
            writeUint16(b, off + OFFSETS_932.AT_TYPE, char.atType);
          }
        }
      }
    }
  }
}
