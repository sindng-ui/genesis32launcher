/**
 * inventoryPanel.js
 * "🎒 소지품" panel. Renders into #charDetailContainer and edits the party inventory
 * through window.G3Inventory.InventoryStore. Depends on window.G3Editor (exposed by bundle.js).
 *
 * Why this exists: items equipped only via the character record have no inventory entry,
 * so the game drops them on unequip. Adding items to the inventory lets the game itself
 * handle equip/unequip, which keeps them after unequipping.
 */
(function () {
  'use strict';

  const ITEM_CATEGORIES = [
    { key: 'itemwp', label: '무기' },
    { key: 'itemar', label: '갑옷' },
    { key: 'itemshoe', label: '신발' },
    { key: 'itemring', label: '반지' },
    { key: 'itemneck', label: '목걸이' },
    { key: 'itembelt', label: '벨트' },
  ];

  let store = null;
  let itemIndex = null; // memoized Map<id, {name, label}>

  function editor() { return window.G3Editor; }

  function buildItemIndex() {
    if (itemIndex) return itemIndex;
    itemIndex = new Map();
    for (const cat of ITEM_CATEGORIES) {
      for (const opt of editor().getCategoryOptions(cat.key)) {
        if (opt.id > 0 && !itemIndex.has(opt.id)) itemIndex.set(opt.id, { name: opt.name, label: cat.label });
      }
    }
    return itemIndex;
  }

  function describe(id) {
    return buildItemIndex().get(id) || { name: `아이템 #${id}`, label: '소모품/기타' };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function itemOptions(catKey) {
    return editor().getCategoryOptions(catKey)
      .filter((o) => o.id > 0)
      .map((o) => `<option value="${o.id}">[${o.id}] ${escapeHtml(o.name)}</option>`)
      .join('');
  }

  function rowsHtml() {
    const items = store.getItems();
    if (items.length === 0) {
      return '<tr><td colspan="4" class="inv-empty">소지품이 비어 있습니다.</td></tr>';
    }
    return items.map((it) => {
      const d = describe(it.id);
      return `<tr>
        <td><span class="inv-cat">${d.label}</span></td>
        <td>[${it.id}] ${escapeHtml(d.name)}</td>
        <td><input type="number" class="form-input inv-qty" data-id="${it.id}" min="0" max="${store.maxQty}" value="${it.qty}" /></td>
        <td><button class="btn btn-secondary inv-del" data-id="${it.id}">삭제</button></td>
      </tr>`;
    }).join('');
  }

  function render() {
    const container = document.getElementById('charDetailContainer');
    if (!container || !store) return;
    if (!store.available) {
      container.innerHTML = '<div class="section-card">이 세이브에서 소지품 데이터를 찾지 못했습니다.</div>';
      return;
    }
    const used = store.getItems().length;
    const copyInfo = store.copies.map((c) => '0x' + c.offset.toString(16).toUpperCase()).join(', ');
    container.innerHTML = `
      <div class="char-hero-banner">
        <div class="char-hero-info">
          <div class="char-hero-name">🎒 소지품</div>
          <div class="char-hero-meta">
            <span>사용 칸 <strong>${used} / ${store.maxSlots}</strong></span>
            <span>자금 <strong>${store.getGold().toLocaleString()}</strong></span>
            <span>위치 <strong>${copyInfo}</strong></span>
          </div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">➕ 아이템 추가</div>
        <div class="inv-add-row">
          <select id="invCat" class="form-select">${ITEM_CATEGORIES.map((c) => `<option value="${c.key}">${c.label}</option>`).join('')}</select>
          <select id="invItem" class="form-select">${itemOptions(ITEM_CATEGORIES[0].key)}</select>
          <input id="invQty" type="number" class="form-input" min="1" max="${store.maxQty}" value="1" />
          <button id="invAdd" class="btn btn-primary">추가</button>
        </div>
        <div class="inv-hint">💡 장비는 여기서 소지품에 넣은 뒤 게임에서 직접 장착하세요. 그래야 해제해도 사라지지 않아요.</div>
      </div>
      <div class="section-card">
        <div class="section-title">📦 현재 소지품</div>
        <table class="inv-table">
          <thead><tr><th>분류</th><th>아이템</th><th>수량</th><th></th></tr></thead>
          <tbody>${rowsHtml()}</tbody>
        </table>
      </div>`;
    bindEvents(container);
  }

  function safely(fn, okMsg) {
    try {
      fn();
      render();
      if (okMsg) editor().showToast(okMsg, 'success');
    } catch (err) {
      editor().showToast(err.message, 'error');
    }
  }

  function bindEvents(container) {
    const cat = container.querySelector('#invCat');
    const item = container.querySelector('#invItem');
    cat.addEventListener('change', () => { item.innerHTML = itemOptions(cat.value); });

    container.querySelector('#invAdd').addEventListener('click', () => {
      const id = parseInt(item.value, 10);
      const qty = parseInt(container.querySelector('#invQty').value, 10) || 1;
      safely(() => store.addItem(id, qty), `${describe(id).name} ×${qty} 추가 완료!`);
    });

    // Event delegation for row controls
    const tbody = container.querySelector('.inv-table tbody');
    tbody.addEventListener('change', (e) => {
      if (!e.target.classList.contains('inv-qty')) return;
      const id = parseInt(e.target.dataset.id, 10);
      safely(() => store.setQty(id, parseInt(e.target.value, 10) || 0));
    });
    tbody.addEventListener('click', (e) => {
      if (!e.target.classList.contains('inv-del')) return;
      const id = parseInt(e.target.dataset.id, 10);
      safely(() => store.removeItem(id), `${describe(id).name} 삭제 완료`);
    });
  }

  function setup() {
    const btn = document.getElementById('btnInventory');
    if (btn) btn.addEventListener('click', render);

    document.addEventListener('g3:saveloaded', (e) => {
      const saveFile = e.detail && e.detail.saveFile;
      store = saveFile ? new window.G3Inventory.InventoryStore(saveFile.decodedBytes) : null;
      if (btn) btn.disabled = !store || !store.available;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
