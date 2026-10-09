/**
 * charDetailView.js
 * Renders the right-side detail editor panel for the currently selected character.
 */

import { getLookupName, getCategoryOptions } from '../core/dataManager.js';
import { buildWeaponOptionsHtml } from '../data/weaponCategories.js';
import { updateCharacterStats } from '../features/charEditor.js';
import { applyMaxStats, applyMaxLevel, applyUltimateGear } from '../features/cheatPresets.js';
import { showToast } from './notification.js';

export class CharDetailView {
  constructor(containerEl, onChangeCallback) {
    this.containerEl = containerEl;
    this.onChangeCallback = onChangeCallback;
    this.currentChar = null;
  }

  setCharacter(char) {
    this.currentChar = char;
    this.render();
  }

  buildSelectOptions(category, selectedId) {
    const list = getCategoryOptions(category);
    let optionsHtml = '';

    let matched = false;
    for (const item of list) {
      const isSel = item.id === selectedId;
      if (isSel) matched = true;
      optionsHtml += `<option value="${item.id}" ${isSel ? 'selected' : ''}>[${item.id}] ${item.name}</option>`;
    }

    if (!matched && selectedId !== undefined) {
      optionsHtml = `<option value="${selectedId}" selected>[${selectedId}] 알 수 없음</option>` + optionsHtml;
    }

    return optionsHtml;
  }

  render() {
    this.containerEl.innerHTML = '';

    if (!this.currentChar) {
      this.containerEl.innerHTML = `
        <div style="margin: auto; text-align: center; color: var(--text-muted);">
          좌측 목록에서 캐릭터를 선택해주세요.
        </div>`;
      return;
    }

    const c = this.currentChar;
    const charName = getLookupName('chrname', c.id);
    const jobName = getLookupName('chrjob', c.job);

    this.containerEl.innerHTML = `
      <!-- Hero Banner -->
      <div class="char-hero-banner">
        <div class="char-hero-info">
          <div class="char-hero-name">${charName}</div>
          <div class="char-hero-meta">
            <span>슬롯 <strong>#${c.index + 1}</strong></span>
            <span>ID <strong>${c.id}</strong></span>
            <span>직업 <strong>${jobName}</strong></span>
          </div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button id="btnCharMaxStats" class="btn btn-secondary">⚡ 스탯 MAX</button>
          <button id="btnCharMaxLevel" class="btn btn-secondary">⭐ 레벨 99</button>
          <button id="btnCharUltGear" class="btn btn-secondary">⚔ 최강 장비</button>
        </div>
      </div>

      <!-- Basic Stats -->
      <div class="section-card">
        <div class="section-title">📊 기본 능력치</div>
        <div class="grid-3">
          <div class="form-group">
            <label class="form-label">레벨 (LV)</label>
            <input id="inputLevel" type="number" min="1" max="99" class="form-input" value="${c.level}" />
          </div>
          <div class="form-group">
            <label class="form-label">경험치 (EXP)</label>
            <input id="inputExp" type="number" min="0" class="form-input" value="${c.exp}" />
          </div>
          <div class="form-group">
            <label class="form-label">공격력 (ATK)</label>
            <input id="inputAtk" type="number" min="0" max="65535" class="form-input" value="${c.atk || 0}" />
          </div>

          <div class="form-group">
            <label class="form-label">표시 HP (LP × 2)</label>
            <input id="inputHpCur" type="number" min="0" max="99999" class="form-input" value="${c.hpCur}" />
          </div>
          <div class="form-group">
            <label class="form-label">생명력 (LP 원본)</label>
            <input id="inputLp" type="number" min="1" max="65535" class="form-input" value="${c.lp || Math.round(c.hpCur / 2)}" />
          </div>
          <div class="form-group">
            <label class="form-label">행동력 (TP)</label>
            <input id="inputTpCur" type="number" min="0" max="999" class="form-input" value="${c.tpCur}" />
          </div>

          <div class="form-group">
            <label class="form-label">집중력 (CTP)</label>
            <input id="inputCtp" type="number" min="0" max="65535" class="form-input" value="${c.ctp || 0}" />
          </div>
          <div class="form-group">
            <label class="form-label">방어력 (DEP)</label>
            <input id="inputDep" type="number" min="0" max="65535" class="form-input" value="${c.dep || 0}" />
          </div>
          <div class="form-group">
            <label class="form-label">민첩성 (DEX)</label>
            <input id="inputDex" type="number" min="0" max="65535" class="form-input" value="${c.dex || 0}" />
          </div>

          <div class="form-group">
            <label class="form-label">정신력 (PSY)</label>
            <input id="inputPsy" type="number" min="0" max="65535" class="form-input" value="${c.psy || 0}" />
          </div>
        </div>
      </div>

      <!-- Equipment -->
      <div class="section-card">
        <div class="section-title">🛡 장비 아이템</div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">무기 (Weapon)</label>
            <select id="selectWp" class="form-select">${buildWeaponOptionsHtml(c.equipWp)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">갑옷 (Armor)</label>
            <select id="selectAr" class="form-select">${this.buildSelectOptions('itemar', c.equipAr)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">목걸이 (Necklace)</label>
            <select id="selectNeck" class="form-select">${this.buildSelectOptions('itemneck', c.equipNeck)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">반지 (Ring)</label>
            <select id="selectRing" class="form-select">${this.buildSelectOptions('itemring', c.equipRing)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">벨트 (Belt)</label>
            <select id="selectBelt" class="form-select">${this.buildSelectOptions('itembelt', c.equipBelt)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">신발 (Shoes)</label>
            <select id="selectShoe" class="form-select">${this.buildSelectOptions('itemshoe', c.equipShoe)}</select>
          </div>
        </div>
      </div>

      <!-- Class & Style Settings -->
      <div class="section-card">
        <div class="section-title">⚔ 클래스 및 스타일</div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">직업 (Job)</label>
            <select id="selectJob" class="form-select">${this.buildSelectOptions('chrjob', c.job)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">체질 / 스타일</label>
            <select id="selectStyle" class="form-select">${this.buildSelectOptions('styles', c.style)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">군단 (Corps)</label>
            <select id="selectCorps" class="form-select">${this.buildSelectOptions('CHRcorps', c.corps)}</select>
          </div>
          <div class="form-group">
            <label class="form-label">공격 타입 (Attack Type)</label>
            <select id="selectAtType" class="form-select">${this.buildSelectOptions('attype', c.atType)}</select>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const c = this.currentChar;
    if (!c) return;

    // Helper to fire updates
    const notify = (msg = null) => {
      if (this.onChangeCallback) this.onChangeCallback(c);
      if (msg) showToast(msg, 'success');
    };

    // Preset buttons
    const btnMaxStats = this.containerEl.querySelector('#btnCharMaxStats');
    if (btnMaxStats) {
      btnMaxStats.addEventListener('click', () => {
        applyMaxStats(c);
        this.render();
        notify('스탯 MAX 적용 완료!');
      });
    }

    const btnMaxLevel = this.containerEl.querySelector('#btnCharMaxLevel');
    if (btnMaxLevel) {
      btnMaxLevel.addEventListener('click', () => {
        applyMaxLevel(c);
        this.render();
        notify('레벨 99 적용 완료!');
      });
    }

    const btnUltGear = this.containerEl.querySelector('#btnCharUltGear');
    if (btnUltGear) {
      btnUltGear.addEventListener('click', () => {
        applyUltimateGear(c);
        this.render();
        notify('최강 장비 장착 완료!');
      });
    }

    // Input change events
    const bindInput = (id, prop, extraHandler = null) => {
      const el = this.containerEl.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener('change', () => {
        updateCharacterStats(c, { [prop]: el.value });
        if (extraHandler) extraHandler();
        notify();
      });
    };

    bindInput('inputLevel', 'level');
    bindInput('inputExp', 'exp');
    bindInput('inputAtk', 'atk');

    // HP & LP synchronization
    bindInput('inputHpCur', 'hpCur', () => {
      const lpEl = this.containerEl.querySelector('#inputLp');
      if (lpEl) lpEl.value = c.lp;
    });
    bindInput('inputLp', 'lp', () => {
      const hpEl = this.containerEl.querySelector('#inputHpCur');
      if (hpEl) hpEl.value = c.hpCur;
    });

    bindInput('inputTpCur', 'tpCur');
    bindInput('inputCtp', 'ctp');
    bindInput('inputDep', 'dep');
    bindInput('inputDex', 'dex');
    bindInput('inputPsy', 'psy');

    bindInput('selectWp', 'equipWp');
    bindInput('selectAr', 'equipAr');
    bindInput('selectShoe', 'equipShoe');
    bindInput('selectRing', 'equipRing');
    bindInput('selectNeck', 'equipNeck');
    bindInput('selectBelt', 'equipBelt');

    bindInput('selectJob', 'job');
    bindInput('selectStyle', 'style');
    bindInput('selectCorps', 'corps');
    bindInput('selectAtType', 'atType');
  }
}
