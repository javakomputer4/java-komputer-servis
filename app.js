const KEY_ORDERS = 'jk_orders_v2';
const KEY_SETTINGS = 'jk_settings_v2';

const defaultSettings = {
  nama: 'JAVA KOMPUTER',
  hp: '0859 0318 1959',
  alamat: 'Jl. Pantai Ayah, Candirenggo Rt 01/02, Ayah, Kebumen, Jawa Tengah. Pos. 54473',
  kota: 'Kebumen',
  rekening: 'Transfer BCA Rek. 7675 13 0914 Syamsul Anam',
  owner: 'Syamsul Anam',
  note: 'Barang tidak di ambil dalam waktu 1 bulan setelah selesai pengerjaan bukan tanggung jawab kami.'
};

let orders = JSON.parse(localStorage.getItem(KEY_ORDERS)) || [];
let settings = JSON.parse(localStorage.getItem(KEY_SETTINGS)) || defaultSettings;

const STATUS_LIST = ['Diterima', 'Pemeriksaan', 'Menunggu Sparepart', 'Sedang Diperbaiki', 'Siap Diambil', 'Selesai/Diambil'];
const KATEGORI_LIST = [
  { name: 'Komputer', icon: '🖥️' },
  { name: 'Laptop', icon: '💻' },
  { name: 'Handphone', icon: '📱' },
  { name: 'Printer', icon: '🖨️' },
  { name: 'Lain-lain', icon: '🔌' }
];

window.addEventListener('DOMContentLoaded', () => {
  applySettings();
  updateDateHeader();
  renderAll();
  updateNetStatus();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
});

window.addEventListener('online', updateNetStatus);
window.addEventListener('offline', updateNetStatus);

function updateNetStatus() {
  const el = document.getElementById('networkBadge');
  if (navigator.onLine) {
    el.textContent = '● Online (Siap)';
    el.style.color = '#4ade80';
  } else {
    el.textContent = '● Offline (Mode Lokal)';
    el.style.color = '#f87171';
  }
}

function updateDateHeader() {
  const now = new Date();
  const tgl = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('pageSubtitle').textContent = `${settings.nama} - ${tgl}`;
}

function toggleTheme() {
  document.body.classList.toggle('theme-light');
}

function switchView(viewId, btnEl) {
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  document.getElementById('view-' + viewId).classList.add('active');
  if (btnEl) btnEl.classList.add('active');

  const titles = {
    dasbor: 'Dasbor Bengkel',
    daftar: 'Daftar Service & Transaksi',
    order: 'Order Service Baru',
    pelanggan: 'Database Pelanggan',
    backup: 'Import & Backup Data',
    pengaturan: 'Pengaturan Toko'
  };
  document.getElementById('pageTitle').textContent = titles[viewId] || 'Dasbor Bengkel';
}

function openNewOrder() {
  document.getElementById('orderForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('formHeading').textContent = 'Buat Order Service Baru';
  document.getElementById('tanggal').value = new Date().toISOString().split('T')[0];
  document.getElementById('fakturNo').value = String(orders.length + 609).padStart(5, '0');
  switchView('order', document.querySelectorAll('.menu-item')[2]);
}

function formatRp(num) {
  return 'Rp ' + (Number(num) || 0).toLocaleString('id-ID');
}

function formatRpFaktur(num) {
  return 'Rp' + (Number(num) || 0).toLocaleString('en-US');
}

function normalizePhone(hp) {
  if (!hp) return '';
  let d = String(hp).replace(/\D/g, '');
  if (d.startsWith('62')) d = '0' + d.slice(2);
  return d;
}

function saveData() {
  localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
  renderAll();
}

function renderAll() {
  renderDashboard();
  renderTable();
  renderCustomers();
  updateCustomerDatalist();
}

function renderDashboard() {
  const aktif = orders.filter(o => o.status !== 'Selesai/Diambil').length;
  const part = orders.filter(o => o.status === 'Menunggu Sparepart').length;
  const siap = orders.filter(o => o.status === 'Siap Diambil').length;
  const omzet = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  document.getElementById('kpiAktif').textContent = aktif;
  document.getElementById('kpiPart').textContent = part;
  document.getElementById('kpiSiap').textContent = siap;
  document.getElementById('kpiOmzet').textContent = formatRp(omzet);

  // Alur Status
  document.getElementById('statusFlowList').innerHTML = STATUS_LIST.map(st => {
    const count = orders.filter(o => o.status === st).length;
    return `<li><span>${st}</span><strong>${count}</strong></li>`;
  }).join('');

  // Unit Aktif per Kategori
  document.getElementById('categoryMiniGrid').innerHTML = KATEGORI_LIST.map(c => {
    const count = orders.filter(o => o.status !== 'Selesai/Diambil' && o.kategori === c.name).length;
    return `<div class="cat-box"><span>${c.icon}</span><strong>${count}</strong><small>${c.name}</small></div>`;
  }).join('');

  // Service Terbaru
  const recentBox = document.getElementById('recentServicesContainer');
  if (orders.length === 0) {
    recentBox.innerHTML = `
      <div class="empty-state">
        <h4>Belum ada order service.</h4>
        <p>Mulai dengan membuat order untuk pelanggan pertama.</p>
        <button class="btn btn-amber" onclick="openNewOrder()">+ Order Baru</button>
      </div>
    `;
  } else {
    recentBox.innerHTML = orders.slice(0, 6).map(o => `
      <div class="recent-item">
        <div>
          <strong>#${o.fakturNo} - ${o.nama}</strong> <small style="color:var(--text-muted)">(${o.perangkat})</small><br>
          <small style="color:var(--text-muted)">${o.deskripsi.replace(/\n/g, ' | ').slice(0, 75)}</small>
        </div>
        <div style="text-align:right">
          <span class="badge-st ${o.status === 'Siap Diambil' ? 'badge-siap' : ''}">${o.status}</span><br>
          <strong style="font-size:12px">${formatRp(o.total)}</strong>
        </div>
      </div>
    `).join('');
  }
}

function renderTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const fSt = document.getElementById('filterStatus').value;
  const fKat = document.getElementById('filterKategori').value;

  const list = orders.filter(o => {
    const okSt = fSt === 'ALL' || o.status === fSt;
    const okKat = fKat === 'ALL' || o.kategori === fKat;
    const text = `${o.fakturNo} ${o.nama} ${o.perusahaan} ${o.noHp} ${o.perangkat} ${o.deskripsi}`.toLowerCase();
    return okSt && okKat && text.includes(q);
  });

  const tbody = document.getElementById('serviceTableBody');
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">Tidak ada data service yang cocok.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(o => `
    <tr>
      <td><strong>#${o.fakturNo}</strong><br><small style="color:var(--text-muted)">${o.tanggal}</small></td>
      <td><strong>${o.nama}</strong><br><small style="color:var(--text-muted)">${o.perusahaan || ''} ${o.noHp ? '• ' + o.noHp : ''}</small><br><small style="color:var(--text-muted)">${o.alamat || ''}</small></td>
      <td><span class="badge-st">${o.kategori}</span><br><strong>${o.perangkat}</strong><br><small style="color:var(--text-muted)">${o.kelengkapan || ''}</small></td>
      <td style="max-width:250px;white-space:pre-line">${o.deskripsi}</td>
      <td><span class="badge-st ${o.status === 'Siap Diambil' ? 'badge-siap' : ''}">${o.status}</span><br><small style="color:var(--text-muted)">${o.pembayaran || 'Cash'}</small></td>
      <td><strong>${formatRp(o.total)}</strong></td>
      <td>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          <button class="btn btn-amber btn-sm" onclick="printFaktur('${o.id}')">📄 Faktur</button>
          <button class="btn btn-ghost btn-sm" onclick="printThermal('${o.id}')">🧾 T.Terima</button>
          <button class="btn btn-ghost btn-sm" onclick="sendWA('${o.id}')">💬 WA</button>
          <button class="btn btn-ghost btn-sm" onclick="editOrder('${o.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteOrder('${o.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function saveOrder(e) {
  e.preventDefault();
  const editId = document.getElementById('editId').value;
  const qty = Number(document.getElementById('qty').value) || 1;
  const harga = Number(document.getElementById('harga').value) || 0;
  const diskon = Number(document.getElementById('diskon').value) || 0;
  const subTotal = qty * harga;
  const total = Math.max(0, subTotal - diskon);

  const item = {
    id: editId || 'ORD-' + Date.now(),
    fakturNo: document.getElementById('fakturNo').value.trim(),
    tanggal: document.getElementById('tanggal').value,
    nama: document.getElementById('nama').value.trim(),
    perusahaan: document.getElementById('perusahaan').value.trim(),
    noHp: normalizePhone(document.getElementById('noHp').value),
    alamat: document.getElementById('alamat').value.trim(),
    kategori: document.getElementById('kategori').value,
    perangkat: document.getElementById('perangkatNama').value.trim(),
    kelengkapan: document.getElementById('kelengkapan').value.trim(),
    status: document.getElementById('status').value,
    pembayaran: document.getElementById('pembayaran').value,
    qty, harga, subTotal, diskon, total,
    deskripsi: document.getElementById('deskripsi').value.trim()
  };

  if (editId) {
    const idx = orders.findIndex(o => o.id === editId);
    if (idx !== -1) orders[idx] = item;
  } else {
    orders.unshift(item);
  }

  saveData();
  switchView('daftar', document.querySelectorAll('.menu-item')[1]);
}

function editOrder(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  document.getElementById('editId').value = o.id;
  document.getElementById('formHeading').textContent = 'Edit Order #' + o.fakturNo;
  document.getElementById('fakturNo').value = o.fakturNo;
  document.getElementById('tanggal').value = o.tanggal;
  document.getElementById('nama').value = o.nama;
  document.getElementById('perusahaan').value = o.perusahaan || '';
  document.getElementById('noHp').value = o.noHp || '';
  document.getElementById('alamat').value = o.alamat || '';
  document.getElementById('kategori').value = o.kategori;
  document.getElementById('perangkatNama').value = o.perangkat;
  document.getElementById('kelengkapan').value = o.kelengkapan || '';
  document.getElementById('status').value = o.status;
  document.getElementById('pembayaran').value = o.pembayaran || 'Cash';
  document.getElementById('qty').value = o.qty || 1;
  document.getElementById('harga').value = o.harga || o.total || 0;
  document.getElementById('diskon').value = o.diskon || 0;
  document.getElementById('deskripsi').value = o.deskripsi;
  switchView('order', document.querySelectorAll('.menu-item')[2]);
}

function deleteOrder(id) {
  if (!confirm('Hapus order service ini?')) return;
  orders = orders.filter(o => o.id !== id);
  saveData();
}

// CETAK FAKTUR PERSIS SEPERTI CONTOH GAMBAR ANDA
function printFaktur(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  const tglIndo = new Date(o.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const lines = o.deskripsi.split(/\n|\|/).map(l => l.trim()).filter(Boolean);
  const detailHtml = lines.map(l => `<div>${l.startsWith('*') ? l : '* ' + l}</div>`).join('');

  document.getElementById('printArea').innerHTML = `
    <div class="faktur-box">
      <div class="faktur-top">
        <div class="faktur-brand">
          <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
            <path d="M18 18C18 10 10 4 4 4C4 12 10 18 18 18Z" fill="#000"/>
            <path d="M18 18C18 10 26 4 32 4C32 12 26 18 18 18Z" fill="#444"/>
            <circle cx="18" cy="25" r="5" fill="#000"/>
          </svg>
          <h1>${settings.nama}</h1>
        </div>
        <div class="faktur-title">FAKTUR</div>
      </div>

      <div class="faktur-info-grid">
        <div style="max-width:55%">
          ${settings.alamat}<br>
          <strong>HP. ${settings.hp}</strong>
        </div>
        <table style="border-collapse:collapse;font-size:12px;">
          <tr><td><strong>${settings.kota} ,</strong></td><td></td><td style="padding-left:12px;font-weight:bold;">${tglIndo}</td></tr>
          <tr><td><strong>No Faktur</strong></td><td>:</td><td style="padding-left:12px;font-weight:bold;text-align:center">${o.fakturNo}</td></tr>
          <tr><td><strong>Trf/Cash</strong></td><td>:</td><td style="padding-left:12px;font-weight:bold;text-align:center">${o.pembayaran || 'Cash'}</td></tr>
        </table>
      </div>

      <div class="faktur-cust-row">
        <div style="border-left:1.5px solid #000;padding-left:8px;">
          <strong>${o.perusahaan || 'Pribadi'}</strong><br>
          <strong>${o.nama}</strong><br>
          <strong>Telp. ${o.noHp || '-'}</strong>
        </div>
        <div>
          <table style="border-collapse:collapse;font-size:12px;">
            <tr><td><strong>Alamat</strong></td><td style="padding:0 8px;">:</td><td><strong>${o.alamat || '-'}</strong></td></tr>
          </table>
        </div>
      </div>

      <table class="faktur-table">
        <thead>
          <tr>
            <th style="width:35px;border-right:1.5px solid #000;">No</th>
            <th>Nama Barang</th>
            <th style="width:80px;">Quantity</th>
            <th style="width:110px;">Harga Satuan</th>
            <th style="width:110px;">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-no"><strong>1</strong></td>
            <td>
              <strong>${o.perangkat}</strong>
              ${detailHtml}
            </td>
            <td class="col-qty">${o.qty || 1}</td>
            <td class="col-harga">${formatRpFaktur(o.harga || o.total)}</td>
            <td class="col-jml">${formatRpFaktur(o.subTotal || o.total)}</td>
          </tr>
          <tr>
            <td class="col-no faktur-spacer"></td>
            <td></td><td></td><td></td><td></td>
          </tr>
        </tbody>
      </table>

      <div class="faktur-bottom">
        <div style="max-width:60%;font-size:11px;">
          <strong>Note</strong> &nbsp; ${settings.note}
        </div>
        <table style="border-collapse:collapse;font-size:12px;min-width:210px;">
          <tr><td style="text-align:right;padding-right:10px;"><strong>Sub Total :</strong></td><td style="text-align:right"><strong>${formatRpFaktur(o.subTotal || o.total)}</strong></td></tr>
          <tr><td style="text-align:right;padding-right:10px;"><strong>Disk :</strong></td><td style="text-align:right">${o.diskon ? formatRpFaktur(o.diskon) : ''}</td></tr>
          <tr><td style="text-align:right;padding-right:10px;"><strong>Total :</strong></td><td style="text-align:right"><strong>${formatRpFaktur(o.total)}</strong></td></tr>
        </table>
      </div>

      <div class="faktur-signs">
        <div>
          <strong>Tanda Terima</strong><br><br><br>
          [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]
        </div>
        <div>
          <strong>${settings.rekening.split('Rek.')[0]}</strong><br>
          <strong>${settings.rekening.includes('Rek.') ? 'Rek.' + settings.rekening.split('Rek.')[1] : ''}</strong>
        </div>
        <div>
          <strong>Hormat Kami</strong><br><br><br>
          <strong>( ${settings.owner} )</strong>
        </div>
      </div>
    </div>
  `;
  window.print();
}

// CETAK TANDA TERIMA UKURAN STANDAR THERMAL
function printThermal(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  document.getElementById('printArea').innerHTML = `
    <div class="thermal-box">
      <div class="t-center">
        <strong>${settings.nama}</strong><br>
        ${settings.alamat}<br>
        HP/WA: ${settings.hp}
      </div>
      <div class="t-dash"></div>
      <div class="t-center"><strong>TANDA TERIMA SERVIS</strong></div>
      <div class="t-dash"></div>
      No Faktur : #${o.fakturNo}<br>
      Tanggal   : ${o.tanggal}<br>
      Pelanggan : ${o.nama}<br>
      No. HP    : ${o.noHp || '-'}<br>
      Alamat    : ${o.alamat || '-'}<br>
      <div class="t-dash"></div>
      Kategori  : ${o.kategori}<br>
      Unit      : <strong>${o.perangkat}</strong><br>
      Kelengkpn : ${o.kelengkapan || '-'}<br>
      Keluhan/Tindakan:<br>
      ${o.deskripsi.replace(/\n/g, '<br>')}<br>
      <div class="t-dash"></div>
      Status    : ${o.status}<br>
      Estimasi  : <strong>${formatRp(o.total)}</strong><br>
      <div class="t-dash"></div>
      <div style="font-size:9px">${settings.note}</div>
      <br>
      <div style="display:flex;justify-content:space-between;text-align:center;">
        <div>Pelanggan,<br><br>(............)</div>
        <div>Penerima,<br><br>(${settings.owner})</div>
      </div>
    </div>
  `;
  window.print();
}

function sendWA(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  let hp = normalizePhone(o.noHp);
  if (!hp) {
    hp = prompt('Masukkan nomor WA pelanggan:');
    if (!hp) return;
    hp = normalizePhone(hp);
  }
  const wa = hp.startsWith('0') ? '62' + hp.slice(1) : hp;
  const pesan = `Halo *${o.nama}*,
Info servis dari *${settings.nama}*:

• No Faktur: *#${o.fakturNo}*
• Unit: ${o.perangkat} (${o.kategori})
• Keterangan: ${o.deskripsi.replace(/\n/g, ', ')}
• Status: *${o.status}*
• Total: *${formatRp(o.total)}*

Terima kasih.`;
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(pesan)}`, '_blank');
}

// PELANGGAN & IMPORT JSON LAMA
function updateCustomerDatalist() {
  const names = [...new Set(orders.map(o => o.nama).filter(Boolean))];
  document.getElementById('custDatalist').innerHTML = names.map(n => `<option value="${n}">`).join('');
}

function autoFillCustomer() {
  const v = document.getElementById('nama').value.trim().toLowerCase();
  const f = orders.find(o => o.nama.toLowerCase() === v);
  if (f) {
    if (!document.getElementById('noHp').value) document.getElementById('noHp').value = f.noHp || '';
    if (!document.getElementById('alamat').value) document.getElementById('alamat').value = f.alamat || '';
    if (!document.getElementById('perusahaan').value) document.getElementById('perusahaan').value = f.perusahaan || '';
  }
}

function renderCustomers() {
  const q = document.getElementById('searchCust').value.toLowerCase();
  const map = {};
  orders.forEach(o => {
    const k = (o.nama + '_' + o.noHp).toLowerCase();
    if (!map[k]) map[k] = { nama: o.nama, perusahaan: o.perusahaan, noHp: o.noHp, alamat: o.alamat, count: 0, total: 0 };
    map[k].count++;
    map[k].total += Number(o.total) || 0;
  });
  const list = Object.values(map).filter(c => `${c.nama} ${c.perusahaan} ${c.noHp} ${c.alamat}`.toLowerCase().includes(q));
  document.getElementById('customerTableBody').innerHTML = list.map(c => `
    <tr>
      <td><strong>${c.nama}</strong></td>
      <td>${c.perusahaan || '-'}</td>
      <td>${c.noHp || '-'}</td>
      <td>${c.alamat || '-'}</td>
      <td>${c.count}x</td>
      <td><strong>${formatRp(c.total)}</strong></td>
      <td><button class="btn btn-ghost btn-sm" onclick="cariPelanggan('${c.nama}')">Lihat Riwayat</button></td>
    </tr>
  `).join('');
}

function cariPelanggan(nama) {
  document.getElementById('searchInput').value = nama;
  switchView('daftar', document.querySelectorAll('.menu-item')[1]);
  renderTable();
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const raw = JSON.parse(ev.target.result);
      let count = 0;
      if (raw.customers && raw.invoice_history) {
        const cMap = {};
        raw.customers.forEach(c => cMap[c.ID_Pelanggan] = c);
        const imported = raw.invoice_history.map(t => {
          const c = cMap[t.ID_Pelanggan] || {};
          const parts = String(t.Deskripsi || '').split('|').map(p => p.trim()).filter(Boolean);
          const rawDev = (parts[0] || 'Perangkat').replace(/^(laptop|notebook|printer|hp|handphone|komputer|pc|tv)\s+/i, '');
          return {
            id: t.ID_Transaksi || 'IMP-' + Math.random(),
            fakturNo: t.Nomor_Faktur || '-',
            tanggal: t.Tanggal || new Date().toISOString().split('T')[0],
            nama: c.Nama_Pelanggan || 'Pelanggan',
            perusahaan: c.Perusahaan || 'PT',
            noHp: normalizePhone(c.Telepon),
            alamat: c.Alamat || '',
            kategori: detectKat(parts[0] || ''),
            perangkat: rawDev,
            kelengkapan: '',
            status: 'Selesai/Diambil',
            pembayaran: 'Cash',
            qty: 1,
            harga: Number(t.Total) || 0,
            subTotal: Number(t.Total) || 0,
            diskon: 0,
            total: Number(t.Total) || 0,
            deskripsi: parts.slice(1).join('\n') || t.Deskripsi
          };
        });
        orders = [...imported, ...orders];
        count = imported.length;
      } else if (Array.isArray(raw)) {
        orders = [...raw, ...orders];
        count = raw.length;
      }
      saveData();
      alert(`Berhasil mengimpor ${count} data transaksi!`);
    } catch (err) {
      alert('Gagal membaca file JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function detectKat(txt) {
  const s = txt.toLowerCase();
  if (s.includes('printer') || s.includes('epson') || s.includes('canon') || s.includes('brother')) return 'Printer';
  if (s.includes('hp') || s.includes('redmi') || s.includes('vivo') || s.includes('samsung') || s.includes('oppo') || s.includes('iphone') || s.includes('infinix')) return 'Handphone';
  if (s.includes('pc') || s.includes('komputer') || s.includes('cpu')) return 'Komputer';
  if (s.includes('tv') || s.includes('blender') || s.includes('keong')) return 'Lain-lain';
  return 'Laptop';
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(orders, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `java_komputer_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function clearAll() {
  if (!confirm('Hapus semua data lokal?')) return;
  orders = [];
  saveData();
}

function applySettings() {
  document.getElementById('sideStoreName').textContent = settings.nama;
  document.getElementById('sidePhone').textContent = settings.hp;
  document.getElementById('sideAddress').textContent = settings.alamat;
  document.getElementById('setNama').value = settings.nama;
  document.getElementById('setHp').value = settings.hp;
  document.getElementById('setAlamat').value = settings.alamat;
  document.getElementById('setKota').value = settings.kota;
  document.getElementById('setRekening').value = settings.rekening;
  document.getElementById('setOwner').value = settings.owner;
  document.getElementById('setNote').value = settings.note;
}

function saveSettings() {
  settings = {
    nama: document.getElementById('setNama').value,
    hp: document.getElementById('setHp').value,
    alamat: document.getElementById('setAlamat').value,
    kota: document.getElementById('setKota').value,
    rekening: document.getElementById('setRekening').value,
    owner: document.getElementById('setOwner').value,
    note: document.getElementById('setNote').value
  };
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
  applySettings();
  updateDateHeader();
  alert('Pengaturan toko berhasil disimpan!');
}