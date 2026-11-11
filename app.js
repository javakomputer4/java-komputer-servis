const STORAGE_KEY = 'java_komputer_services_v2';
const SETTINGS_KEY = 'java_komputer_settings_v2';

const defaultSettings = {
  storeName: 'JAVA KOMPUTER',
  storeAddress1: 'Jl. Pantai Ayah, Candirenggo Rt 01/02, Ayah',
  storeAddress2: 'Kebumen, Jawa Tengah. Pos. 54473',
  storePhone: '0859 0318 1959',
  storeCity: 'Kebumen',
  bankInfo: 'Transfer BCA\nRek. 7675 13 0914',
  ownerName: 'Syamsul Anam',
  storeNote: 'Barang tidak di ambil dalam waktu 1 bulan\nsetelah selesai pengerjaan bukan tanggung jawab kami.'
};

let services = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {
    id: 'SRV-00608',
    noFaktur: '00608',
    tanggal: '2026-11-10',
    perusahaan: 'PT',
    nama: 'Ibu Hida',
    noHp: '+62 822-3028-8896',
    alamat: 'Mangunweni',
    perangkat: { merek: 'Lenovo', tipe: 'Lenovo Ideapad 320', kategori: 'Laptop' },
    kelengkapan: 'Unit + Charger',
    keluhan: '* Replace Keyboard',
    metodeBayar: 'Cash',
    garansi: '1 Bulan',
    status: 'Diambil',
    qty: 1,
    subtotal: 280000,
    diskon: 0,
    total: 280000
  }
];

let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || defaultSettings;

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

// Format Rupiah sesuai contoh faktur: Rp280,000
function formatFakturRp(num) {
  const n = Number(num) || 0;
  return 'Rp' + n.toLocaleString('en-US');
}

function formatRupiah(num) {
  return 'Rp ' + (Number(num) || 0).toLocaleString('id-ID');
}

function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-';
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const thn = parts[0];
  const bln = bulan[parseInt(parts[1], 10) - 1] || parts[1];
  const tgl = parseInt(parts[2], 10);
  return `${tgl} ${bln} ${thn}`;
}

function normalizePhone(phone) {
  if (!phone || phone.trim() === '+62') return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('62')) digits = '0' + digits.slice(2);
  return digits;
}

function cleanDeviceName(rawText) {
  let clean = String(rawText || '').trim();
  // Hapus kata kategori di awal supaya tidak double seperti "Laptop Laptop ASUS"
  clean = clean.replace(/^(laptop|notebook|laprop|laaptop|printer|print|hp|handphone|komputer|computer|pc|tv)\s+/i, '');
  return clean || rawText;
}

function calcTotal() {
  const sub = Number(document.getElementById('subtotal').value) || 0;
  const disk = Number(document.getElementById('diskon').value) || 0;
  document.getElementById('total').value = Math.max(0, sub - disk);
}

// Navigasi Tab
function switchTab(tabId, btnEl) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  if (btnEl) btnEl.classList.add('active');
}

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
    const text = `${s.noFaktur} ${s.perusahaan || ''} ${s.nama} ${s.noHp} ${s.perangkat.merek} ${s.perangkat.tipe} ${s.keluhan}`.toLowerCase();
    return matchStatus && text.includes(q);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;padding:24px;">Tidak ada data servis ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const statusClass = 'st-' + s.status.split(' ')[0];
    const cleanTipe = cleanDeviceName(s.perangkat.tipe);
    return `
      <tr>
        <td><strong>#${s.noFaktur}</strong><br><small style="color:#64748b">${s.tanggal}</small></td>
        <td>
          ${s.perusahaan ? `<small style="color:#475569;font-weight:600">${s.perusahaan}</small><br>` : ''}
          <strong>${s.nama}</strong><br>
          <small>${s.noHp || '-'}</small><br>
          <small style="color:#64748b">${s.alamat || ''}</small>
        </td>
        <td>
          <span class="status-pill st-Antrean">${s.perangkat.kategori}</span><br>
          <strong>${cleanTipe}</strong><br>
          <small style="color:#64748b">${s.kelengkapan || ''}</small>
        </td>
        <td style="max-width:260px;white-space:pre-line">${s.keluhan}</td>
        <td>
          <span class="status-pill ${statusClass}">${s.status}</span><br>
          <small style="font-weight:600;color:#0f172a">${s.metodeBayar || 'Cash'}</small><br>
          <small style="color:#64748b">${s.garansi}</small>
        </td>
        <td><strong>${formatRupiah(s.total)}</strong></td>
        <td>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            <button class="btn btn-primary btn-sm" title="Cetak Faktur Resmi" onclick="printFaktur('${s.id}')">📄 Faktur</button>
            <button class="btn btn-warning btn-sm" title="Cetak Tanda Terima Thermal" onclick="printTandaTerima('${s.id}')">🧾 T. Terima</button>
            <button class="btn btn-success btn-sm" title="Kirim WhatsApp" onclick="sendWA('${s.id}')">💬 WA</button>
            <button class="btn btn-outline btn-sm" title="Edit" onclick="editService('${s.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" title="Hapus" onclick="deleteService('${s.id}')">🗑️</button>
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
  const merek = document.getElementById('merek').value.trim();
  const tipeRaw = document.getElementById('tipe').value.trim();
  const displayTipe = tipeRaw.toLowerCase().startsWith(merek.toLowerCase()) ? tipeRaw : `${merek} ${tipeRaw}`;

  const item = {
    id: editId || 'SRV-' + Date.now(),
    noFaktur: document.getElementById('noFaktur').value.trim(),
    tanggal: document.getElementById('tanggal').value,
    perusahaan: document.getElementById('perusahaan').value.trim(),
    nama: document.getElementById('nama').value.trim(),
    noHp: document.getElementById('noHp').value.trim(),
    alamat: document.getElementById('alamat').value.trim(),
    perangkat: {
      kategori: document.getElementById('kategori').value,
      merek: merek,
      tipe: displayTipe
    },
    kelengkapan: document.getElementById('kelengkapan').value.trim(),
    keluhan: document.getElementById('keluhan').value.trim(),
    status: document.getElementById('status').value,
    metodeBayar: document.getElementById('metodeBayar').value,
    garansi: document.getElementById('garansi').value,
    qty: Number(document.getElementById('qty').value) || 1,
    subtotal: Number(document.getElementById('subtotal').value) || 0,
    diskon: Number(document.getElementById('diskon').value) || 0,
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
  document.getElementById('perusahaan').value = s.perusahaan || '';
  document.getElementById('nama').value = s.nama;
  document.getElementById('noHp').value = s.noHp;
  document.getElementById('alamat').value = s.alamat;
  document.getElementById('kategori').value = s.perangkat.kategori;
  document.getElementById('merek').value = s.perangkat.merek;
  document.getElementById('tipe').value = cleanDeviceName(s.perangkat.tipe);
  document.getElementById('kelengkapan').value = s.kelengkapan || '';
  document.getElementById('keluhan').value = s.keluhan;
  document.getElementById('status').value = s.status;
  document.getElementById('metodeBayar').value = s.metodeBayar || 'Cash';
  document.getElementById('garansi').value = s.garansi;
  document.getElementById('qty').value = s.qty || 1;
  document.getElementById('subtotal').value = s.subtotal !== undefined ? s.subtotal : s.total;
  document.getElementById('diskon').value = s.diskon || 0;
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
  document.getElementById('qty').value = 1;
  document.getElementById('subtotal').value = 0;
  document.getElementById('diskon').value = 0;
  document.getElementById('total').value = 0;
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
    if (!document.getElementById('perusahaan').value) document.getElementById('perusahaan').value = found.perusahaan || '';
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
    if (!map[key]) map[key] = { perusahaan: s.perusahaan, nama: s.nama, noHp: s.noHp, alamat: s.alamat, count: 0, total: 0 };
    map[key].count++;
    map[key].total += Number(s.total) || 0;
  });

  const list = Object.values(map).filter(c => `${c.perusahaan || ''} ${c.nama} ${c.noHp} ${c.alamat}`.toLowerCase().includes(q));
  document.getElementById('customerTableBody').innerHTML = list.map(c => `
    <tr>
      <td>${c.perusahaan ? `<small style="color:#64748b">${c.perusahaan}</small><br>` : ''}<strong>${c.nama}</strong></td>
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
  const cleanTipe = cleanDeviceName(s.perangkat.tipe);
  const msg = `Halo *${s.nama}*,
Informasi servis dari *${settings.storeName}*:

` +
    `• No. Faktur: *${s.noFaktur}*
` +
    `• Perangkat: ${cleanTipe}
` +
    `• Keterangan:
${s.keluhan}
` +
    `• Status: *${s.status}*
` +
    `• Total Biaya: *${formatFakturRp(s.total)}*

Terima kasih.`;
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ================= 1. CETAK FAKTUR RESMI (PERSIS GAMBAR CONTOH) =================
function printFaktur(id) {
  const s = services.find(item => item.id === id);
  if (!s) return;

  const cleanTipe = cleanDeviceName(s.perangkat.tipe);
  const sub = s.subtotal !== undefined ? s.subtotal : s.total;
  const disk = Number(s.diskon) || 0;
  const tot = Number(s.total) || 0;
  const qty = s.qty || 1;

  // Format rincian item menjadi baris-baris rapi di bawah nama perangkat
  const detailLines = String(s.keluhan || '')
    .split(/\n|\|/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.startsWith('*') ? line : '* ' + line)
    .join('<br>');

  const bankHtml = String(settings.bankInfo || '').replace(/\n/g, '<br>');
  const noteHtml = String(settings.storeNote || '').replace(/\n/g, '<br>');

  const printArea = document.getElementById('printArea');
  printArea.innerHTML = `
    <div class="faktur-box">
      <div class="faktur-header">
        <div class="faktur-brand-title">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M4 6C11 6 16 11 16 18C9 18 4 13 4 6Z" fill="#334155"/>
            <path d="M32 6C25 6 20 11 20 18C27 18 32 13 32 6Z" fill="#0f172a"/>
            <path d="M4 22C11 22 16 27 16 34C9 34 4 29 4 22Z" fill="#64748b"/>
            <circle cx="26" cy="28" r="6" fill="#334155"/>
          </svg>
          <h1>${settings.storeName}</h1>
        </div>
        <div class="faktur-title-right">FAKTUR</div>
      </div>

      <div class="faktur-sub-header">
        <div class="faktur-store-info">
          ${settings.storeAddress1}<br>
          ${settings.storeAddress2}<br>
          HP. ${settings.storePhone}
        </div>
        <table class="faktur-meta-table">
          <tr>
            <td>${settings.storeCity}</td>
            <td>,</td>
            <td class="faktur-meta-val">${formatTanggalIndo(s.tanggal)}</td>
          </tr>
          <tr>
            <td>No Faktur</td>
            <td>:</td>
            <td class="faktur-meta-val">${s.noFaktur}</td>
          </tr>
          <tr>
            <td>Trf/Cash</td>
            <td>:</td>
            <td class="faktur-meta-val">${s.metodeBayar || 'Cash'}</td>
          </tr>
        </table>
      </div>

      <div class="faktur-cust-row">
        <div class="faktur-cust-left">
          ${s.perusahaan ? `${s.perusahaan}<br>` : ''}
          ${s.nama}<br>
          Telp. ${s.noHp || '-'}
        </div>
        <table class="faktur-meta-table">
          <tr>
            <td>Alamat</td>
            <td>:</td>
            <td class="faktur-meta-val">${s.alamat || '-'}</td>
          </tr>
        </table>
      </div>

      <table class="faktur-items-table">
        <thead>
          <tr>
            <th class="col-no">No</th>
            <th class="col-nama">Nama Barang</th>
            <th class="col-qty">Quantity</th>
            <th class="col-harga">Harga Satuan</th>
            <th class="col-jumlah">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-no">1</td>
            <td class="col-nama">
              <strong>${cleanTipe}</strong><br>
              ${detailLines}
            </td>
            <td class="col-qty">${qty}</td>
            <td class="col-harga">${formatFakturRp(sub)}</td>
            <td class="col-jumlah">${formatFakturRp(sub)}</td>
          </tr>
          <tr class="faktur-filler-row">
            <td class="col-no"></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="faktur-summary-row">
        <div class="faktur-note">
          <strong>Note</strong>
          <div>${noteHtml}</div>
        </div>
        <table class="faktur-totals-table">
          <tr>
            <td class="faktur-totals-label">Sub Total :</td>
            <td class="faktur-totals-val">${formatFakturRp(sub)}</td>
          </tr>
          <tr>
            <td class="faktur-totals-label">Disk :</td>
            <td class="faktur-totals-val">${disk > 0 ? formatFakturRp(disk) : ''}</td>
          </tr>
          <tr>
            <td class="faktur-totals-label">Total :</td>
            <td class="faktur-totals-val">${formatFakturRp(tot)}</td>
          </tr>
        </table>
      </div>

      <div class="faktur-footer-sign">
        <div>
          Tanda Terima
          <div class="sign-space"></div>
          (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
        </div>
        <div>
          ${bankHtml}<br>
          ${settings.ownerName}
        </div>
        <div>
          Hormat Kami
          <div class="sign-space"></div>
          ( ${settings.ownerName} )
        </div>
      </div>
    </div>
  `;
  window.print();
}

// ================= 2. CETAK TANDA TERIMA SERVIS (STANDAR THERMAL) =================
function printTandaTerima(id) {
  const s = services.find(item => item.id === id);
  if (!s) return;

  const cleanTipe = cleanDeviceName(s.perangkat.tipe);
  const printArea = document.getElementById('printArea');

  printArea.innerHTML = `
    <div class="thermal-box">
      <div class="th-center">
        <div class="th-bold" style="font-size:13px">${settings.storeName}</div>
        <div>${settings.storeAddress1}</div>
        <div>HP/WA: ${settings.storePhone}</div>
      </div>
      <div class="th-line"></div>
      <div class="th-center th-bold">TANDA TERIMA SERVIS</div>
      <div class="th-line"></div>
      <div>No. Tiket : #${s.noFaktur}</div>
      <div>Tanggal   : ${s.tanggal}</div>
      <div>Pelanggan : ${s.nama}</div>
      ${s.perusahaan ? `<div>Instansi  : ${s.perusahaan}</div>` : ''}
      <div>No. HP    : ${s.noHp || '-'}</div>
      <div class="th-line"></div>
      <div class="th-bold">DATA UNIT:</div>
      <div>Kategori  : ${s.perangkat.kategori}</div>
      <div>Unit/Tipe : ${cleanTipe}</div>
      <div>Kelengkpn : ${s.kelengkapan || '-'}</div>
      <div class="th-line"></div>
      <div class="th-bold">KELUHAN / KETERANGAN:</div>
      <div style="white-space:pre-line">${s.keluhan}</div>
      <div class="th-line"></div>
      <div class="th-row">
        <span>Estimasi Biaya:</span>
        <span class="th-bold">${s.total > 0 ? formatFakturRp(s.total) : 'Konfirmasi'}</span>
      </div>
      <div>Status: ${s.status}</div>
      <div class="th-line"></div>
      <div style="font-size:9.5px;text-align:justify">
        * Simpan struk ini sebagai bukti pengambilan unit.<br>
        * Barang tidak diambil > 1 bulan setelah konfirmasi selesai di luar tanggung jawab kami.
      </div>
      <div class="th-sign">
        <div>
          Pelanggan,<br><br><br>
          ( ${s.nama.slice(0, 12)} )
        </div>
        <div>
          Penerima,<br><br><br>
          ( Admin )
        </div>
      </div>
    </div>
  `;
  window.print();
}

// ================= IMPORT & EXPORT JSON =================
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
          const parts = String(trx.Deskripsi || '').split('|').map(p => p.trim()).filter(Boolean);
          const rawFirst = parts[0] || 'Perangkat';
          const cleanTipe = cleanDeviceName(rawFirst);

          const detailLines = parts.slice(1)
            .filter(p => !p.toLowerCase().includes('garansi berlaku') && !p.toLowerCase().includes('untuk klaim garansi'))
            .join('\n');

          return {
            id: trx.ID_Transaksi || 'IMP-' + Math.random(),
            noFaktur: trx.Nomor_Faktur || '-',
            tanggal: trx.Tanggal || new Date().toISOString().split('T')[0],
            perusahaan: (c.Perusahaan && c.Perusahaan !== 'PT.' && c.Perusahaan !== 'PT') ? c.Perusahaan : (c.Perusahaan || ''),
            nama: c.Nama_Pelanggan || 'Pelanggan Umum',
            noHp: c.Telepon && c.Telepon !== '+62' ? c.Telepon : '',
            alamat: c.Alamat && c.Alamat !== '-' ? c.Alamat : '',
            perangkat: {
              kategori: detectCategory(rawFirst),
              merek: cleanTipe.split(' ')[0] || 'Umum',
              tipe: cleanTipe
            },
            kelengkapan: '',
            keluhan: detailLines || trx.Deskripsi,
            metodeBayar: 'Cash',
            garansi: '1 Bulan',
            status: 'Diambil',
            qty: 1,
            subtotal: Number(trx.Total) || 0,
            diskon: 0,
            total: Number(trx.Total) || 0
          };
        });
        services = [...converted, ...services];
        importedCount = converted.length;
      } else if (Array.isArray(data)) {
        const converted = data.map((d, idx) => ({
          id: (d._id && d._id.$oid) || d.id || 'MDB-' + Date.now() + idx,
          noFaktur: d.noFaktur || String(idx + 1).padStart(5, '0'),
          tanggal: d.tanggal || new Date().toISOString().split('T')[0],
          perusahaan: d.perusahaan || '',
          nama: d.nama || 'Pelanggan',
          noHp: d.noHp || '',
          alamat: d.alamat || '',
          perangkat: {
            kategori: (d.perangkat && d.perangkat.kategori) || 'Laptop',
            merek: (d.perangkat && d.perangkat.merek) || 'Umum',
            tipe: cleanDeviceName((d.perangkat && d.perangkat.tipe) || '-')
          },
          kelengkapan: d.kelengkapan || '',
          keluhan: d.keluhan || '',
          metodeBayar: d.metodeBayar || 'Cash',
          garansi: d.garansi || '1 Bulan',
          status: d.status || 'Diambil',
          qty: d.qty || 1,
          subtotal: d.subtotal !== undefined ? d.subtotal : (Number(d.total) || 0),
          diskon: d.diskon || 0,
          total: Number(d.total) || 0
        }));
        services = [...converted, ...services];
        importedCount = converted.length;
      }

      persist();
      alert(`Berhasil mengimpor ${importedCount} data transaksi dengan format bersih!`);
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
  if (t.includes('tv')) return 'Elektronik Lainnya';
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
  document.getElementById('setStoreAddress1').value = settings.storeAddress1;
  document.getElementById('setStoreAddress2').value = settings.storeAddress2;
  document.getElementById('setStorePhone').value = settings.storePhone;
  document.getElementById('setStoreCity').value = settings.storeCity;
  document.getElementById('setBankInfo').value = settings.bankInfo;
  document.getElementById('setOwnerName').value = settings.ownerName;
  document.getElementById('setStoreNote').value = settings.storeNote;
  document.getElementById('settingsModal').classList.add('open');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
}

function saveSettings() {
  settings = {
    storeName: document.getElementById('setStoreName').value,
    storeAddress1: document.getElementById('setStoreAddress1').value,
    storeAddress2: document.getElementById('setStoreAddress2').value,
    storePhone: document.getElementById('setStorePhone').value,
    storeCity: document.getElementById('setStoreCity').value,
    bankInfo: document.getElementById('setBankInfo').value,
    ownerName: document.getElementById('setOwnerName').value,
    storeNote: document.getElementById('setStoreNote').value
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applySettingsUI();
  closeSettings();
}

function applySettingsUI() {
  document.getElementById('headerStoreName').textContent = settings.storeName;
  document.getElementById('headerStoreSub').textContent = `${settings.storeAddress1} | HP: ${settings.storePhone}`;
}