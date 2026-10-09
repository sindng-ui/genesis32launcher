/**
 * charListView.js
 * Renders and filters the left sidebar character list.
 */

import { getLookupName } from '../core/dataManager.js';

export class CharListView {
  constructor(containerEl, onSelectCallback) {
    this.containerEl = containerEl;
    this.onSelectCallback = onSelectCallback;
    this.characters = [];
    this.selectedIndex = 0;
    this.filterText = '';
  }

  setCharacters(characters) {
    this.characters = characters || [];
    this.selectedIndex = this.characters.length > 0 ? 0 : -1;
    this.render();
    if (this.selectedIndex >= 0 && this.onSelectCallback) {
      this.onSelectCallback(this.characters[this.selectedIndex]);
    }
  }

  setFilter(text) {
    this.filterText = (text || '').trim().toLowerCase();
    this.render();
  }

  render() {
    this.containerEl.innerHTML = '';

    if (this.characters.length === 0) {
      this.containerEl.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          캐릭터 데이터가 없습니다.
        </div>`;
      return;
    }

    const filtered = this.characters.filter(char => {
      if (!this.filterText) return true;
      const name = getLookupName('chrname', char.id).toLowerCase();
      const idStr = String(char.id);
      return name.includes(this.filterText) || idStr.includes(this.filterText);
    });

    if (filtered.length === 0) {
      this.containerEl.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          검색 결과가 없습니다.
        </div>`;
      return;
    }

    filtered.forEach(char => {
      const charName = getLookupName('chrname', char.id);
      const isSelected = char.index === this.selectedIndex;

      const itemEl = document.createElement('div');
      itemEl.className = `char-item ${isSelected ? 'active' : ''}`;
      itemEl.innerHTML = `
        <div class="char-item-left">
          <div class="char-item-name">${charName}</div>
          <div class="char-item-sub">HP ${char.hpCur}/${char.hpMax} · TP ${char.tpCur}</div>
        </div>
        <div class="char-item-badge">Lv.${char.level}</div>
      `;

      itemEl.addEventListener('click', () => {
        this.selectedIndex = char.index;
        this.render();
        if (this.onSelectCallback) {
          this.onSelectCallback(char);
        }
      });

      this.containerEl.appendChild(itemEl);
    });
  }
}
