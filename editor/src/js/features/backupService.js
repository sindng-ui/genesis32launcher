/**
 * backupService.js
 * Handles automatic backups (.bak) and file export for save files.
 */

let originalBackup = null;
let originalFileName = 'G3P_II20.sav';

/**
 * Store original raw bytes for automatic backup
 * @param {string} fileName 
 * @param {Uint8Array} rawBytes 
 */
export function setOriginalBackup(fileName, rawBytes) {
  originalFileName = fileName || 'G3P_II20.sav';
  originalBackup = new Uint8Array(rawBytes);
}

/**
 * Check if backup exists
 */
export function hasBackup() {
  return originalBackup !== null;
}

/**
 * Trigger download of a byte array as a file with 3-tier fallback:
 * 1. File System Access API (showSaveFilePicker) for native direct-save
 * 2. Data URI for file:/// protocol without CORS/UUID issues
 * 3. Delayed Blob URL revocation
 * @param {Uint8Array} dataBytes 
 * @param {string} filename 
 * @returns {Promise<boolean>}
 */
export async function downloadFile(dataBytes, filename) {
  // 1. Modern File System Access API
  if (typeof window !== 'undefined' && window.showSaveFilePicker) {
    try {
      const isBak = filename.toLowerCase().endsWith('.bak');
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: isBak ? '창세기전 3 파트 2 세이브 백업 (*.bak)' : '창세기전 3 파트 2 세이브 파일 (*.sav)',
          accept: { 'application/octet-stream': [isBak ? '.bak' : '.sav'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(dataBytes);
      await writable.close();
      return true;
    } catch (err) {
      if (err.name === 'AbortError') {
        return false; // User cancelled
      }
      console.warn('showSaveFilePicker failed, trying Data URI', err);
    }
  }

  // 2. Data URI download (100% preserves filename on file:/// without Blob UUID issue)
  try {
    let binary = '';
    const len = dataBytes.byteLength;
    const chunkSize = 0x8000;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = dataBytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, chunk);
    }
    const base64 = btoa(binary);
    const dataUri = `data:application/octet-stream;base64,${base64}`;

    const a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 2000);
    return true;
  } catch (dataUriErr) {
    console.warn('Data URI failed, using delayed Blob', dataUriErr);
  }

  // 3. Fallback: Blob URL with delayed revocation (prevents race condition)
  const blob = new Blob([dataBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) a.parentNode.removeChild(a);
    URL.revokeObjectURL(url);
  }, 60000);
  return true;
}

/**
 * Download the modified save file
 * @param {Uint8Array} encodedSaveBytes 
 * @param {string} customName 
 */
export async function downloadModifiedSave(encodedSaveBytes, customName = null) {
  const name = customName || originalFileName;
  return await downloadFile(encodedSaveBytes, name);
}

/**
 * Download the original backup (.bak) file
 */
export async function downloadOriginalBackup() {
  if (!originalBackup) {
    throw new Error('No original backup available to download');
  }
  const bakName = originalFileName.replace(/\.sav$/i, '') + '.bak';
  return await downloadFile(originalBackup, bakName);
}
