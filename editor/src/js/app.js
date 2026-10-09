/**
 * app.js
 * Application root and event orchestrator.
 */

import { initGameData } from './core/dataManager.js';
import { decodeSaveBuffer, encodeSaveBuffer } from './core/saveCodec.js';
import { SaveFile } from './core/saveParser.js';
import { setOriginalBackup, downloadModifiedSave, downloadOriginalBackup, hasBackup } from './features/backupService.js';
import { applyAllCharactersMax } from './features/cheatPresets.js';
import { CharListView } from './ui/charListView.js';
import { CharDetailView } from './ui/charDetailView.js';
import { showToast } from './ui/notification.js';

let currentSaveFile = null;
let currentFileName = 'G3P_II20.sav';

// UI references
const dropzoneEl = document.getElementById('dropzone');
const fileInputEl = document.getElementById('fileInput');
const mainLayoutEl = document.getElementById('mainLayout');
const sidebarCharListEl = document.getElementById('charListContainer');
const detailPanelEl = document.getElementById('charDetailContainer');
const searchInputEl = document.getElementById('searchChar');
const currentFileNameBadge = document.getElementById('currentFileName');

const btnAllMaxStats = document.getElementById('btnAllMaxStats');
const btnDownloadBackup = document.getElementById('btnDownloadBackup');
const btnSaveFile = document.getElementById('btnSaveFile');
const btnOpenAnother = document.getElementById('btnOpenAnother');

let charListView = null;
let charDetailView = null;

async function init() {
  await initGameData();

  charListView = new CharListView(sidebarCharListEl, (char) => {
    if (charDetailView) charDetailView.setCharacter(char);
  });

  charDetailView = new CharDetailView(detailPanelEl, () => {
    if (charListView) charListView.render();
  });

  bindGlobalEvents();
}

function bindGlobalEvents() {
  // Prevent default window drag-and-drop actions that could navigate away
  window.addEventListener('dragover', (e) => e.preventDefault(), false);
  window.addEventListener('drop', (e) => e.preventDefault(), false);

  // File input
  fileInputEl.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    fileInputEl.value = ''; // Reset so same file can be selected again
  });

  // Explicit select button
  const btnSelectFile = document.getElementById('btnSelectFile');
  if (btnSelectFile) {
    btnSelectFile.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInputEl.click();
    });
  }

  // Dropzone drag-and-drop
  dropzoneEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzoneEl.classList.add('dragover');
  });

  dropzoneEl.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropzoneEl.classList.remove('dragover');
  });

  dropzoneEl.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzoneEl.classList.remove('dragover');
    const file = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    if (file) handleFile(file);
  });

  dropzoneEl.addEventListener('click', (e) => {
    // Only trigger if not clicking buttons
    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
      fileInputEl.click();
    }
  });

  // Search filter
  searchInputEl.addEventListener('input', (e) => {
    if (charListView) charListView.setFilter(e.target.value);
  });

  // Open another file
  btnOpenAnother.addEventListener('click', () => {
    fileInputEl.click();
  });

  // Download backup
  btnDownloadBackup.addEventListener('click', async () => {
    try {
      const ok = await downloadOriginalBackup();
      if (ok !== false) {
        showToast('원본 백업(.bak) 다운로드 완료!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Save modified .sav
  btnSaveFile.addEventListener('click', async () => {
    if (!currentSaveFile) return;
    try {
      currentSaveFile.commitAll();
      const encoded = encodeSaveBuffer(currentSaveFile.decodedBytes);
      const ok = await downloadModifiedSave(encoded, currentFileName);
      if (ok !== false) {
        showToast(`수정된 세이브(${currentFileName}) 저장 완료!`, 'success');
      }
    } catch (err) {
      showToast(`저장 오류: ${err.message}`, 'error');
    }
  });

  // Cheat: Max all characters
  btnAllMaxStats.addEventListener('click', () => {
    if (!currentSaveFile) return;
    const count = applyAllCharactersMax(currentSaveFile);
    if (charListView) charListView.render();
    if (charDetailView && charDetailView.currentChar) {
      charDetailView.render();
    }
    showToast(`전체 캐릭터 (${count}명) 스탯 & 레벨 MAX 적용 완료!`, 'success');
  });

  // Load sample save 00
  const btnLoadSample00 = document.getElementById('btnLoadSample00');
  if (btnLoadSample00) {
    btnLoadSample00.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const res = await fetch('sample_saves/G3P_II00.sav');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        loadBuffer('G3P_II00.sav', buf);
      } catch (err) {
        showToast(`G3P_II00 샘플 로드 실패: ${err.message}`, 'error');
      }
    });
  }

  // Load sample save 20
  const btnLoadSample = document.getElementById('btnLoadSample');
  if (btnLoadSample) {
    btnLoadSample.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const res = await fetch('sample_saves/G3P_II20.sav');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        loadBuffer('G3P_II20.sav', buf);
      } catch (err) {
        showToast(`샘플 로드 실패: ${err.message}`, 'error');
      }
    });
  }
}

function loadBuffer(fileName, buffer) {
  try {
    currentFileName = fileName;
    const rawBytes = new Uint8Array(buffer);

    // Save original for backup
    setOriginalBackup(currentFileName, rawBytes);

    // Decode
    const decodedBytes = decodeSaveBuffer(buffer);

    // Parse
    currentSaveFile = new SaveFile(decodedBytes);

    if (currentSaveFile.characters.length === 0) {
      showToast('유효한 캐릭터 데이터를 찾지 못했습니다.', 'error');
      return;
    }

    // Update UI state
    currentFileNameBadge.textContent = currentFileName;
    dropzoneEl.style.display = 'none';
    mainLayoutEl.style.display = 'flex';

    btnDownloadBackup.disabled = !hasBackup();
    btnSaveFile.disabled = false;
    btnAllMaxStats.disabled = false;
    btnOpenAnother.disabled = false;
    btnOpenAnother.style.display = 'inline-flex';

    charListView.setCharacters(currentSaveFile.characters);

    showToast(`${currentFileName} 로드 성공! (캐릭터 ${currentSaveFile.characters.length}명)`, 'success');
  } catch (err) {
    console.error(err);
    showToast(`세이브 파일 처리 오류: ${err.message}`, 'error');
  }
}

function handleFile(file) {
  if (!file.name.toLowerCase().endsWith('.sav')) {
    showToast('창세기전 세이브 파일(.sav)만 열 수 있습니다.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    loadBuffer(file.name, e.target.result);
  };
  reader.readAsArrayBuffer(file);
}

// Start
window.addEventListener('DOMContentLoaded', init);
