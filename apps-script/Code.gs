/**
 * Penyimpanan foto Morning Meeting — Google Apps Script (Web App)
 * Foto disimpan di folder Google Drive pemilik skrip. Dashboard (GitHub Pages) memanggil skrip ini.
 *
 * LANGKAH: lihat apps-script/PANDUAN.md
 */

const FOLDER_NAME = 'MorningMeeting_Foto';   // nama folder di Drive Anda
const PIN         = 'GANTI-PIN-INI';         // <-- ganti! PIN ini dimasukkan tiap pengguna di dashboard (sekali per browser)
const KEEP_DAYS   = 30;                      // foto lebih lama dari ini otomatis dibuang ke Sampah

function folder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function inFolder_(file) {
  const fid = folder_().getId(), ps = file.getParents();
  while (ps.hasNext()) if (ps.next().getId() === fid) return true;
  return false;
}

// Jalankan fungsi ini SEKALI dari editor (tombol ▶ Run) untuk memberi izin akses Drive & membuat folder.
function setup() { Logger.log('Folder siap: ' + folder_().getUrl()); }

function doGet() { return out_({ ok: true, info: 'Foto Morning Meeting — gunakan dari dashboard' }); }

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'Permintaan tidak valid' }); }
  if (b.pin !== PIN) return out_({ ok: false, error: 'PIN salah' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const dir = folder_();

    if (b.action === 'list') {
      const items = [], cutoff = Date.now() - KEEP_DAYS * 86400000, files = dir.getFiles();
      while (files.hasNext()) {
        const f = files.next(), t = f.getDateCreated().getTime();
        if (t < cutoff) { f.setTrashed(true); continue; }
        items.push({ id: f.getId(), slot: f.getDescription() || '', t: t });
      }
      items.sort((a, c) => a.t - c.t);
      return out_({ ok: true, items: items });
    }

    if (b.action === 'get') {
      const f = DriveApp.getFileById(b.id);
      if (!inFolder_(f)) return out_({ ok: false, error: 'Bukan file foto' });
      return out_({ ok: true, data: 'data:image/jpeg;base64,' + Utilities.base64Encode(f.getBlob().getBytes()) });
    }

    if (b.action === 'add' || b.action === 'replace') {
      const m = /^data:image\/[a-z+]+;base64,(.+)$/.exec(b.data || '');
      if (!m || !b.slot) return out_({ ok: false, error: 'Data foto tidak valid' });
      const blob = Utilities.newBlob(Utilities.base64Decode(m[1]), 'image/jpeg', 'foto-' + Date.now() + '.jpg');
      const f = dir.createFile(blob);
      f.setDescription(String(b.slot));
      if (b.action === 'replace' && b.id) {
        const old = DriveApp.getFileById(b.id);
        if (inFolder_(old)) old.setTrashed(true);
      }
      return out_({ ok: true, id: f.getId() });
    }

    if (b.action === 'delete') {
      const f = DriveApp.getFileById(b.id);
      if (!inFolder_(f)) return out_({ ok: false, error: 'Bukan file foto' });
      f.setTrashed(true);
      return out_({ ok: true });
    }

    return out_({ ok: false, error: 'Aksi tidak dikenal' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
