const STORAGE_KEY = 'java_komputer_services_v1';
const SETTINGS_KEY = 'java_komputer_settings_v1';

const defaultSettings = {
  storeName: 'JAVA KOMPUTER',
  storeSub: 'Servis Komputer, Laptop, Handphone, Printer & Elektronik',
  storeAddress: 'Ayah, Kebumen, Jawa Tengah',
  storePhone: '0859-0318-1959',
  storeNote: 'Garansi berlaku jika segel belum rusak. Untuk klaim garansi wajib membawa nota.'
};

let services = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {
    id: 'SRV-001',
    noFaktur: '00609',
    tanggal: new Date().toISOString().split('T')[0],
    nama: 'Budi Santoso',
    noHp: '081234567890',
    alamat: 'Ayah, Kebumen',
    perangkat: { merek: 'Asus', tipe: 'X441UA', kategori: 'Laptop' },
    kelengkapan: 'Unit + Charger',
    keluhan: 'Keyboard tidak berfungsi -> Replace Keyboard',
    garansi: '1 Bulan',
    status: 'Selesai',
    total: 280000
  }
];

let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || defaultSettings;

// Inisialisasi
window.addEventListener('DOMContentLoaded', () => {
  applySettingsUI();
  resetForm();
  renderAll();
  updateNetworkStatus();
  registerSW();
});

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function updateNetworkStatus() {
  const badge = document.getElementById('networkBadge');
  if (navigator.onLine) {
    badge.className = 'badge badge-online';
    badge.textContent = '● Online (Siap)';
  } else {
    badge.className = 'badge badge-offline';
    badge.textContent = '● Offline (Mode Lokal)';
  }
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  renderAll();
}

function formatRupiah(num) {
  return 'Rp ' + (Number(num) || 0).toLocaleString('id-ID');
}

function normalizePhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('62')) digits = '0' + digits.slice(2);
  return digits;
}

// Navigasi Tab
function switchTab(tabId, btnEl) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  if (btnEl) btnEl.classList.add('active');
}

// Render Semua Tampilan
function renderAll() {
  updateStats();
  renderServices();
  renderCustomers();
  updateCustomerDatalist();
}

function updateStats() {
  document.getElementById('statTotal').textContent = services.length;
  const proses = services.filter(s => ['Antrean', 'Proses', 'Menunggu Part'].includes(s.status)).length;
  const selesai = services.filter(s => s.status === 'Selesai').length;
  const omzet = services.reduce((acc, s) => acc + (Number(s.total) || 0), 0);

  document.getElementById('statProses').textContent = proses;
  document.getElementById('statSelesai').textContent = selesai;
  document.getElementById('statOmzet').textContent = formatRupiah(omzet);
}

function renderServices() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const st = document.getElementById('filterStatus').value;
  const tbody = document.getElementById('serviceTableBody');

  const filtered = services.filter(s => {
    const matchStatus = st === 'ALL' || s.status === st;
    const text = `${s.noFaktur} ${s.nama} ${s.noHp} ${s.perangkat.merek} ${s.perangkat.tipe} ${s.keluhan}`.toLowerCase();
    return matchStatus && text.includes(q);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;padding:24px;">Tidak ada data servis ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const statusClass = 'st-' + s.status.split(' ')[0];
    return `
      <tr>
        <td><strong>#${s.noFaktur}</strong><br><small style="color:#64748b">${s.tanggal}</small></td>
        <td><strong>${s.nama}</strong><br><small>${s.noHp || '-'}</small><br><small style="color:#64748b">${s.alamat || ''}</small></td>
        <td><span class="status-pill st-Antrean">${s.perangkat.kategori}</span><br><strong>${s.perangkat.merek} ${s.perangkat.tipe}</strong><br><small style="color:#64748b">${s.kelengkapan || ''}</small></td>
        <td style="max-width:260px">${s.keluhan}</td>
        <td><span class="status-pill ${statusClass}">${s.status}</span><br><small style="color:#64748b">${s.garansi}</small></td>
        <td><strong>${formatRupiah(s.total)}</strong></td>
        <td>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            <button class="btn btn-outline btn-sm" title="Print Thermal" onclick="printNota('${s.id}', 'thermal')">🖨️ 58mm</button>
            <button class="btn btn-outline btn-sm" title="Print Faktur A5" onclick="printNota('${s.id}', 'a5')">📄 A5</button>
            <button class="btn btn-success btn-sm" title="Kirim WA" onclick="sendWA('${s.id}')">💬 WA</button>
            <button class="btn btn-primary btn-sm" onclick="editService('${s.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteService('${s.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Simpan / Edit Servis
function saveService(e) {
  e.preventDefault();
  const editId = document.getElementById('editId').value;
  const item = {
    id: editId || 'SRV-' + Date.now(),
    noFaktur: document.getElementById('noFaktur').value.trim(),
    tanggal: document.getElementById('tanggal').value,
    nama: document.getElementById('nama').value.trim(),
    noHp: normalizePhone(document.getElementById('noHp').value),
    alamat: document.getElementById('alamat').value.trim(),
    perangkat: {
      kategori: document.getElementById('kategori').value,
      merek: document.getElementById('merek').value.trim(),
      tipe: document.getElementById('tipe').value.trim()
    },
    kelengkapan: document.getElementById('kelengkapan').value.trim(),
    keluhan: document.getElementById('keluhan').value.trim(),
    status: document.getElementById('status').value,
    garansi: document.getElementById('garansi').value,
    total: Number(document.getElementById('total').value) || 0
  };

  if (editId) {
    const idx = services.findIndex(s => s.id === editId);
    if (idx !== -1) services[idx] = item;
  } else {
    services.unshift(item);
  }

  persist();
  resetForm();
  switchTab('servis', document.querySelectorAll('.tab-btn')[0]);
}

function editService(id) {
  const s = services.find(item => item.id === id);
  if (!s) return;
  document.getElementById('formTitle').textContent = 'Edit Transaksi #' + s.noFaktur;
  document.getElementById('editId').value = s.id;
  document.getElementById('noFaktur').value = s.noFaktur;
  document.getElementById('tanggal').value = s.tanggal;
  document.getElementById('nama').value = s.nama;
  document.getElementById('noHp').value = s.noHp;
  document.getElementById('alamat').value = s.alamat;
  document.getElementById('kategori').value = s.perangkat.kategori;
  document.getElementById('merek').value = s.perangkat.merek;
  document.getElementById('tipe').value = s.perangkat.tipe;
  document.getElementById('kelengkapan').value = s.kelengkapan || '';
  document.getElementById('keluhan').value = s.keluhan;
  document.getElementById('status').value = s.status;
  document.getElementById('garansi').value = s.garansi;
  document.getElementById('total').value = s.total;
  switchTab('tambah', document.querySelectorAll('.tab-btn')[1]);
}

function deleteService(id) {
  if (!confirm('Hapus catatan servis ini?')) return;
  services = services.filter(s => s.id !== id);
  persist();
}

function resetForm() {
  document.getElementById('serviceForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('formTitle').textContent = 'Input Servis / Transaksi Baru';
  document.getElementById('tanggal').value = new Date().toISOString().split('T')[0];
  const nextNum = String(services.length + 609).padStart(5, '0');
  document.getElementById('noFaktur').value = nextNum;
}

// Autocomplete Pelanggan
function updateCustomerDatalist() {
  const uniqueNames = [...new Set(services.map(s => s.nama).filter(Boolean))];
  document.getElementById('customerList').innerHTML = uniqueNames.map(n => `<option value="${n}">`).join('');
}

function autofillCustomer() {
  const val = document.getElementById('nama').value.trim().toLowerCase();
  const found = services.find(s => s.nama.toLowerCase() === val);
  if (found) {
    if (!document.getElementById('noHp').value) document.getElementById('noHp').value = found.noHp || '';
    if (!document.getElementById('alamat').value) document.getElementById('alamat').value = found.alamat || '';
  }
}

// Rekap Pelanggan
function renderCustomers() {
  const q = document.getElementById('searchCustomerInput').value.toLowerCase();
  const map = {};
  services.forEach(s => {
    const key = (s.nama + '_' + s.noHp).toLowerCase();
    if (!map[key]) map[key] = { nama: s.nama, noHp: s.noHp, alamat: s.alamat, count: 0, total: 0 };
    map[key].count++;
    map[key].total += Number(s.total) || 0;
  });

  const list = Object.values(map).filter(c => `${c.nama} ${c.noHp} ${c.alamat}`.toLowerCase().includes(q));
  document.getElementById('customerTableBody').innerHTML = list.map(c => `
    <tr>
      <td><strong>${c.nama}</strong></td>
      <td>${c.noHp || '-'}</td>
      <td>${c.alamat || '-'}</td>
      <td>${c.count}x</td>
      <td><strong>${formatRupiah(c.total)}</strong></td>
      <td><button class="btn btn-outline btn-sm" onclick="filterByCustomer('${c.nama}')">Lihat Riwayat</button></td>
    </tr>
  `).join('');
}

function filterByCustomer(nama) {
  document.getElementById('searchInput').value = nama;
  switchTab('servis', document.querySelectorAll('.tab-btn')[0]);
  renderServices();
}

// WhatsApp
function sendWA(id) {
  const s = services.find(item => item.id === id);
  if (!s) return;
  let hp = normalizePhone(s.noHp);
  if (!hp) {
    hp = prompt('Masukkan nomor WhatsApp pelanggan (contoh: 081234567890):');
    if (!hp) return;
    hp = normalizePhone(hp);
  }
  const waNum = hp.startsWith('0') ? '62' + hp.slice(1) : hp;
  const msg = `Halo *${s.nama}*,\nInformasi servis dari *${settings.storeName}*:\n\n` +
    `• No. Faktur: *#${s.noFaktur}*\n` +
    `• Perangkat: ${s.perangkat.merek} ${s.perangkat.tipe} (${s.perangkat.kategori})\n` +
    `• Keterangan: ${s.keluhan}\n` +
    `• Status: *${s.status}*\n` +
    `• Garansi: ${s.garansi}\n` +
    `• Total Biaya: *${formatRupiah(s.total)}*\n\nTerima kasih.`;
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Cetak Nota (Thermal & A5)
function printNota(id, mode) {
  const s = services.find(item => item.id === id);
  if (!s) return;
  const printArea = document.getElementById('printArea');

  if (mode === 'thermal') {
    printArea.innerHTML = `
      <div class="nota-thermal">
        <div class="nota-center">
          <strong>${settings.storeName}</strong><br>
          ${settings.storeAddress}<br>
          WA: ${settings.storePhone}
        </div>
        <div class="nota-line"></div>
        Faktur : #${s.noFaktur}<br>
        Tgl    : ${s.tanggal}<br>
        Nama   : ${s.nama}<br>
        HP     : ${s.noHp || '-'}<br>
        <div class="nota-line"></div>
        <strong>${s.perangkat.kategori}: ${s.perangkat.merek} ${s.perangkat.tipe}</strong><br>
        Kelengkapan: ${s.kelengkapan || '-'}<br>
        Detail:<br>${s.keluhan}<br>
        <div class="nota-line"></div>
        Status : ${s.status}<br>
        Garansi: ${s.garansi}<br>
        <strong>TOTAL  : ${formatRupiah(s.total)}</strong>
        <div class="nota-line"></div>
        <div class="nota-center" style="font-size:10px">${settings.storeNote}</div>
      </div>
    `;
  } else {
    printArea.innerHTML = `
      <div class="nota-a5">
        <div style="display:flex;justify-content:space-between;border-bottom:2px solid #000;padding-bottom:8px;">
          <div>
            <h2 style="margin:0">${settings.storeName}</h2>
            <small>${settings.storeSub}</small><br>
            <small>${settings.storeAddress} | Telp/WA: ${settings.storePhone}</small>
          </div>
          <div style="text-align:right">
            <strong>NOTA SERVIS / FAKTUR</strong><br>
            No: <strong>#${s.noFaktur}</strong><br>
            Tanggal: ${s.tanggal}
          </div>
        </div>
        <p style="margin:10px 0">
          <strong>Pelanggan:</strong> ${s.nama} (${s.noHp || '-'})<br>
          <strong>Alamat:</strong> ${s.alamat || '-'}
        </p>
        <table class="nota-table">
          <thead>
            <tr>
              <th>Perangkat & Kelengkapan</th>
              <th>Keluhan / Tindakan Pengerjaan</th>
              <th>Garansi</th>
              <th>Biaya</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${s.perangkat.kategori}</strong> - ${s.perangkat.merek} ${s.perangkat.tipe}<br><small>Kelengkapan: ${s.kelengkapan || '-'}</small></td>
              <td>${s.keluhan}</td>
              <td>${s.garansi}</td>
              <td><strong>${formatRupiah(s.total)}</strong></td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;margin-top:16px;">
          <div style="max-width:60%;font-size:11px;">
            <strong>Catatan:</strong><br>${settings.storeNote}
          </div>
          <div style="text-align:center">
            Hormat Kami,<br><br><br>
            <strong>(${settings.storeName})</strong>
          </div>
        </div>
      </div>
    `;
  }
  window.print();
}

// Import & Export JSON
function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      let importedCount = 0;

      if (data.customers && data.invoice_history) {
        const custMap = {};
        data.customers.forEach(c => custMap[c.ID_Pelanggan] = c);

        const converted = data.invoice_history.map(trx => {
          const c = custMap[trx.ID_Pelanggan] || {};
          const parts = String(trx.Deskripsi || '').split('|').map(p => p.replace(/^\*+\s*/, '').trim());
          const first = parts[0] || 'Perangkat';
          return {
            id: trx.ID_Transaksi || 'IMP-' + Math.random(),
            noFaktur: trx.Nomor_Faktur || '-',
            tanggal: trx.Tanggal || new Date().toISOString().split('T')[0],
            nama: c.Nama_Pelanggan || 'Pelanggan Umum',
            noHp: normalizePhone(c.Telepon),
            alamat: c.Alamat || '',
            perangkat: {
              kategori: detectCategory(first),
              merek: first.split(' ')[0] || 'Umum',
              tipe: first
            },
            kelengkapan: '',
            keluhan: parts.slice(1).join(' | ') || trx.Deskripsi,
            garansi: '1 Bulan',
            status: 'Diambil',
            total: Number(trx.Total) || 0
          };
        });
        services = [...converted, ...services];
        importedCount = converted.length;
      } else if (Array.isArray(data)) {
        const converted = data.map((d, idx) => ({
          id: (d._id && d._id.$oid) || 'MDB-' + Date.now() + idx,
          noFaktur: d.noFaktur || String(idx + 1).padStart(5, '0'),
          tanggal: d.tanggal || new Date().toISOString().split('T')[0],
          nama: d.nama || 'Pelanggan',
          noHp: normalizePhone(d.noHp),
          alamat: d.alamat || '',
          perangkat: d.perangkat || { merek: 'Umum', tipe: '-', kategori: 'Laptop' },
          kelengkapan: d.kelengkapan || '',
          keluhan: d.keluhan || '',
          garansi: d.garansi || '1 Bulan',
          status: d.status || 'Diambil',
          total: Number(d.total) || 0
        }));
        services = [...converted, ...services];
        importedCount = converted.length;
      }

      persist();
      alert(`Berhasil mengimpor ${importedCount} data transaksi!`);
    } catch (err) {
      alert('Format file JSON tidak valid: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function detectCategory(text) {
  const t = text.toLowerCase();
  if (t.includes('printer') || t.includes('epson') || t.includes('canon') || t.includes('brother')) return 'Printer';
  if (t.includes('hp') || t.includes('redmi') || t.includes('vivo') || t.includes('samsung') || t.includes('oppo') || t.includes('iphone') || t.includes('infinix') || t.includes('realme')) return 'Handphone';
  if (t.includes('pc') || t.includes('komputer') || t.includes('cpu')) return 'PC/Komputer';
  return 'Laptop';
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(services, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `backup_java_komputer_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function clearAllData() {
  if (!confirm('Yakin ingin menghapus seluruh data lokal di browser ini?')) return;
  services = [];
  persist();
}

// Pengaturan Toko
function openSettings() {
  document.getElementById('setStoreName').value = settings.storeName;
  document.getElementById('setStoreSub').value = settings.storeSub;
  document.getElementById('setStoreAddress').value = settings.storeAddress;
  document.getElementById('setStorePhone').value = settings.storePhone;
  document.getElementById('setStoreNote').value = settings.storeNote;
  document.getElementById('settingsModal').classList.add('open');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
}

function saveSettings() {
  settings = {
    storeName: document.getElementById('setStoreName').value,
    storeSub: document.getElementById('setStoreSub').value,
    storeAddress: document.getElementById('setStoreAddress').value,
    storePhone: document.getElementById('setStorePhone').value,
    storeNote: document.getElementById('setStoreNote').value
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applySettingsUI();
  closeSettings();
}

function applySettingsUI() {
  document.getElementById('headerStoreName').textContent = settings.storeName;
  document.getElementById('headerStoreSub').textContent = settings.storeSub;
}
