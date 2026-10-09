/**
 * inventoryStore.js
 * Party inventory (소지품) reader/writer for Genesis 3 Part 2 save files.
 *
 * Layout (decoded bytes, verified with in-game unequip diff G3P_II02 -> G3P_II03):
 *   +0x000 DWORD count   (number of used slots, max 256)
 *   +0x004 DWORD gold    (party funds, read-only here until verified)
 *   +0x008 256 x { DWORD itemId, DWORD qty }   (unused slots are zero-filled)
 *   Total block size: 8 + 256 * 8 = 2056 bytes (fixed -> file size never changes)
 *
 * Copies:
 *   0x63F4 : campaign copy (present in every save)
 *   0xADAF : live copy in extended (91,598 byte) saves. The game updates this one
 *            when an item is unequipped, so it is treated as the primary copy.
 *
 * Classic script (no ES module) so it works on file:// together with bundle.js.
 */
(function () {
  'use strict';

  const LIST_BYTES = 2056;
  const MAX_SLOTS = 256;
  const MAX_QTY = 99;
  const CANDIDATE_OFFSETS = [0x63F4, 0x74A4, 0x8554, 0xADAF];

  function read32(b, o) {
    return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
  }

  function write32(b, o, v) {
    b[o] = v & 0xFF;
    b[o + 1] = (v >>> 8) & 0xFF;
    b[o + 2] = (v >>> 16) & 0xFF;
    b[o + 3] = (v >>> 24) & 0xFF;
  }

  function isValidList(b, off) {
    if (off + LIST_BYTES > b.length) return false;
    const count = read32(b, off);
    if (count > MAX_SLOTS) return false;
    for (let i = 0; i < count; i++) {
      const id = read32(b, off + 8 + i * 8);
      const qty = read32(b, off + 12 + i * 8);
      if (id === 0 || id > 0xFFFF || qty === 0 || qty > 0xFFFF) return false;
    }
    return true;
  }

  function readList(b, off) {
    const count = read32(b, off);
    const items = new Array(count);
    for (let i = 0; i < count; i++) {
      items[i] = { id: read32(b, off + 8 + i * 8), qty: read32(b, off + 12 + i * 8) };
    }
    return { offset: off, gold: read32(b, off + 4), items };
  }

  function writeList(b, list) {
    const off = list.offset;
    write32(b, off, list.items.length);
    write32(b, off + 4, list.gold);
    list.items.forEach((it, i) => {
      write32(b, off + 8 + i * 8, it.id);
      write32(b, off + 12 + i * 8, it.qty);
    });
    b.fill(0, off + 8 + list.items.length * 8, off + LIST_BYTES);
  }

  class InventoryStore {
    constructor(decodedBytes) {
      this.bytes = decodedBytes;
      this.copies = CANDIDATE_OFFSETS
        .filter((off) => isValidList(decodedBytes, off))
        .map((off) => readList(decodedBytes, off));
    }

    get available() { return this.copies.length > 0; }
    get primary() { return this.copies[this.copies.length - 1] || null; }
    get maxSlots() { return MAX_SLOTS; }
    get maxQty() { return MAX_QTY; }

    getItems() { return this.primary ? this.primary.items.map((it) => ({ ...it })) : []; }
    getGold() { return this.primary ? this.primary.gold : 0; }
    getQty(id) {
      const it = this.primary && this.primary.items.find((x) => x.id === id);
      return it ? it.qty : 0;
    }

    /** Apply a quantity delta for one item id to every copy (keeps stale copies consistent). */
    applyDelta(id, delta) {
      if (!this.available) throw new Error('소지품 데이터를 찾지 못했습니다.');
      if (!delta) return;
      for (const list of this.copies) {
        const idx = list.items.findIndex((x) => x.id === id);
        if (idx >= 0) {
          const next = Math.min(MAX_QTY, list.items[idx].qty + delta);
          if (next <= 0) list.items.splice(idx, 1);
          else list.items[idx].qty = next;
        } else if (delta > 0) {
          if (list.items.length >= MAX_SLOTS) throw new Error('소지품 칸이 가득 찼습니다 (256칸).');
          list.items.push({ id, qty: Math.min(MAX_QTY, delta) });
        }
        writeList(this.bytes, list);
      }
    }

    addItem(id, qty = 1) { this.applyDelta(id, qty); }
    setQty(id, qty) {
      const target = Math.max(0, Math.min(MAX_QTY, qty | 0));
      this.applyDelta(id, target - this.getQty(id));
    }
    removeItem(id) { this.applyDelta(id, -this.getQty(id)); }

    /** Ensure equipped items (specifically shoes/accessories/newly assigned gear) exist in inventory */
    ensureEquippedItems(characters) {
      if (!this.available || !characters) return;
      for (const c of characters) {
        // Synchronize shoes, rings, necklaces, belts to prevent unequip disappearance
        // Weapons and Armors: only add if already partially present or for main heroes
        const gears = [c.equipShoe, c.equipRing, c.equipNeck, c.equipBelt].filter(g => g && g > 0 && g !== 0xFFFF);
        for (const g of gears) {
          if (this.getQty(g) === 0) {
            try {
              this.addItem(g, 1);
            } catch (e) {
              console.warn('Inventory full or error adding gear:', g, e);
            }
          }
        }
      }
    }
  }

  window.G3Inventory = { InventoryStore, LIST_BYTES, CANDIDATE_OFFSETS };
})();
