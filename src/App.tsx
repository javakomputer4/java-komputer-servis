import { useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowUpRight, BarChart3, Bell, Boxes, BriefcaseBusiness,
  CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardList,
  Command, CreditCard, FileBarChart, FileText, HardDrive, LayoutDashboard, LogOut,
  Menu, Monitor, Package, Plus, Search, Settings, ShieldCheck, ShoppingBag, ShoppingCart,
  Smartphone, Truck, Users, Wallet, Wrench, X, Printer, Laptop, UserCog, RefreshCw
} from 'lucide-react'

type IconType = typeof LayoutDashboard
type NavItem = { label: string; icon: IconType; group: string }
const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, group: 'UTAMA' },
  { label: 'Kasir', icon: ShoppingCart, group: 'OPERASIONAL' },
  { label: 'Service Center', icon: Wrench, group: 'OPERASIONAL' },
  { label: 'Inventaris', icon: Boxes, group: 'OPERASIONAL' },
  { label: 'Pembelian', icon: ShoppingBag, group: 'OPERASIONAL' },
  { label: 'Pelanggan', icon: Users, group: 'DATA MASTER' },
  { label: 'Supplier', icon: Truck, group: 'DATA MASTER' },
  { label: 'Keuangan', icon: Wallet, group: 'BISNIS' },
  { label: 'Laporan', icon: FileBarChart, group: 'BISNIS' },
  { label: 'Pengguna & Hak Akses', icon: UserCog, group: 'SISTEM' },
  { label: 'Backup & Sinkronisasi', icon: RefreshCw, group: 'SISTEM' },
  { label: 'Pengaturan', icon: Settings, group: 'SISTEM' },
]
const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
const activityItems = [
  { initials: 'AR', name: 'Andi Rahman', action: 'Transaksi penjualan', detail: 'Keyboard Logitech K120', time: '10:42', amount: '+ Rp 125.000', color: 'bg-sky-500/15 text-sky-300' },
  { initials: 'SW', name: 'Siti Wulandari', action: 'Service masuk', detail: 'Laptop ASUS X441 • Mati total', time: '10:18', amount: 'SERV-0024', color: 'bg-violet-500/15 text-violet-300' },
  { initials: 'BP', name: 'Budi Prasetyo', action: 'Pembelian stok', detail: 'SSD SATA 256GB • 5 unit', time: '09:56', amount: '− Rp 1.450.000', color: 'bg-amber-500/15 text-amber-300' },
  { initials: 'DN', name: 'Dina Nurhaliza', action: 'Transaksi penjualan', detail: 'Mouse wireless + Flashdisk', time: '09:31', amount: '+ Rp 185.000', color: 'bg-emerald-500/15 text-emerald-300' },
]
const stats = [
  { label: 'Omzet Hari Ini', value: 'Rp 3.850.000', change: '+12,8%', note: 'dibanding kemarin', icon: CircleDollarSign, trend: 'up' },
  { label: 'Transaksi Hari Ini', value: '24', change: '+8,3%', note: 'dibanding kemarin', icon: CreditCard, trend: 'up' },
  { label: 'Servis Aktif', value: '12', change: '4 selesai', note: 'menunggu pengambilan', icon: Wrench, trend: 'neutral' },
  { label: 'Stok Menipis', value: '7 item', change: 'Perlu restock', note: 'di bawah stok minimum', icon: Package, trend: 'warning' },
]

function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('demo123')
  const [showPassword, setShowPassword] = useState(false)
  return <div className="min-h-screen bg-[#111315] flex items-center justify-center px-4 py-10 relative overflow-hidden">
    <div className="absolute -top-40 -right-24 h-96 w-96 rounded-full bg-[#e5b93f]/[0.07] blur-3xl" />
    <div className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-[#e5b93f]/[0.04] blur-3xl" />
    <div className="w-full max-w-[430px] relative">
      <div className="flex justify-center mb-8">
        <Brand large />
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-[#191c1f] p-7 sm:p-9 shadow-2xl shadow-black/30">
        <div className="mb-7"><p className="text-white text-2xl font-semibold tracking-tight">Selamat datang</p><p className="text-sm text-[#8b929a] mt-2">Masuk untuk mengelola operasional toko Anda.</p></div>
        <form onSubmit={e => { e.preventDefault(); onLogin() }} className="space-y-5">
          <label className="block"><span className="text-xs font-medium text-[#c6c9cd]">Username</span><input value={username} onChange={e => setUsername(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111315] px-4 py-3 text-sm outline-none transition focus:border-[#e5b93f]/70" placeholder="Masukkan username" /></label>
          <label className="block"><span className="text-xs font-medium text-[#c6c9cd]">Password</span><div className="relative mt-2"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111315] px-4 py-3 pr-16 text-sm outline-none transition focus:border-[#e5b93f]/70" placeholder="Masukkan password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#e5b93f]">{showPassword ? 'Sembunyikan' : 'Lihat'}</button></div></label>
          <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-[#9ba1a8]"><input type="checkbox" defaultChecked className="accent-[#e5b93f]" /> Ingat saya</label><button type="button" className="text-[#e5b93f] hover:text-[#f2cf70]">Lupa password?</button></div>
          <button className="w-full rounded-xl bg-[#e5b93f] py-3.5 text-sm font-semibold text-[#171717] transition hover:bg-[#f0ca5b] active:scale-[.99]">Masuk ke Dashboard <span className="ml-1">→</span></button>
        </form>
        <div className="mt-6 rounded-xl border border-[#e5b93f]/15 bg-[#e5b93f]/[0.05] p-3.5"><p className="text-[11px] font-semibold uppercase tracking-wider text-[#e5b93f]">Akun demo</p><p className="mt-1 text-xs text-[#aeb3b9]">Username: <b className="text-white">admin</b> · Password: <b className="text-white">demo123</b></p></div>
      </div>
      <p className="text-center text-[11px] text-[#646b72] mt-6">© 2026 JAVA KOMPUTER · Internal Management System</p>
    </div>
  </div>
}

function Brand({ large = false }: { large?: boolean }) {
  return <div className="flex items-center gap-3">
    <div className={`${large ? 'h-12 w-12 rounded-2xl' : 'h-9 w-9 rounded-xl'} flex items-center justify-center bg-[#e5b93f] text-[#171717] shadow-lg shadow-[#e5b93f]/10`}><Command size={large ? 25 : 19} strokeWidth={2.5} /></div>
    <div><p className={`${large ? 'text-xl' : 'text-sm'} font-bold tracking-[0.13em] text-white`}>JAVA KOMPUTER</p><p className={`${large ? 'text-xs' : 'text-[9px]'} mt-0.5 tracking-[0.2em] text-[#e5b93f]`}>STORE MANAGEMENT</p></div>
  </div>
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [active, setActive] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('Hari ini')
  const grouped = useMemo(() => ['UTAMA', 'OPERASIONAL', 'DATA MASTER', 'BISNIS', 'SISTEM'].map(group => ({ group, items: navItems.filter(n => n.group === group) })), [])
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />
  return <div className="min-h-screen bg-[#111315] text-[#f4f4f5]">
    {sidebarOpen && <button aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-white/[0.07] bg-[#171a1d] transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-5"><Brand /><button onClick={() => setSidebarOpen(false)} className="text-[#8b929a] lg:hidden"><X size={18}/></button></div>
      <div className="px-4 pt-5 pb-3"><div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#1d2125] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5b93f]/15 text-[#e5b93f]"><Monitor size={18}/></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">JAVA KOMPUTER</p><p className="mt-1 text-[10px] text-[#818991]">Cabang utama · Toko</p></div><ChevronDown size={14} className="text-[#737b83]"/></div></div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2">{grouped.map(section => <div key={section.group} className="mb-5"><p className="px-3 pb-2 pt-2 text-[9px] font-bold tracking-[0.17em] text-[#626a72]">{section.group}</p><div className="space-y-1">{section.items.map(item => { const Icon = item.icon; const selected = active === item.label; return <button key={item.label} onClick={() => { setActive(item.label); setSidebarOpen(false) }} className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] transition ${selected ? 'bg-[#e5b93f]/[0.12] font-semibold text-[#f0ca5b]' : 'text-[#9ba2a9] hover:bg-white/[0.04] hover:text-white'}`}><Icon size={16} strokeWidth={selected ? 2.2 : 1.8}/><span className="flex-1">{item.label}</span>{selected && <span className="h-1.5 w-1.5 rounded-full bg-[#e5b93f]"/>}</button> })}</div></div>)}</nav>
      <div className="border-t border-white/[0.07] p-3"><div className="flex items-center gap-3 rounded-xl p-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5b93f] text-xs font-bold text-[#171717]">AD</div><div className="min-w-0 flex-1"><p className="text-xs font-semibold">Administrator</p><p className="text-[10px] text-[#77808a]">Super Admin</p></div><button onClick={() => setLoggedIn(false)} title="Keluar" className="rounded-lg p-2 text-[#78818a] hover:bg-white/5 hover:text-white"><LogOut size={16}/></button></div></div>
    </aside>
    <main className="min-h-screen lg:pl-[258px]">
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#111315]/90 px-4 backdrop-blur-xl sm:px-7">
        <div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-[#a1a7ae] hover:bg-white/5 lg:hidden"><Menu size={19}/></button><div><div className="flex items-center gap-2 text-[11px] text-[#707981]"><span>JAVA KOMPUTER</span><ChevronRight size={12}/><span className="text-[#d6d8da]">{active}</span></div><h1 className="mt-1 text-base font-semibold tracking-tight">{active}</h1></div></div>
        <div className="flex items-center gap-2 sm:gap-4"><div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-[#191c1f] px-3 py-2 md:flex"><Search size={14} className="text-[#737b83]"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari apa saja..." className="w-36 bg-transparent text-xs outline-none placeholder:text-[#626a72]"/></div><button className="relative rounded-lg p-2 text-[#929aa2] hover:bg-white/5"><Bell size={18}/><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e5b93f]"/></button><div className="hidden h-8 w-px bg-white/10 sm:block"/><div className="hidden text-right sm:block"><p className="text-xs font-semibold">Administrator</p><p className="mt-0.5 text-[10px] text-[#777f87]">Super Admin</p></div><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5b93f] text-[10px] font-bold text-[#171717] sm:hidden">AD</div></div>
      </header>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-7">
        {active === 'Dashboard' ? <Dashboard period={period} setPeriod={setPeriod}/> : <ModulePlaceholder active={active}/>}
      </div>
      <footer className="mx-auto flex max-w-[1500px] flex-col gap-1 border-t border-white/[0.06] px-4 py-5 text-[10px] text-[#626a72] sm:flex-row sm:items-center sm:justify-between sm:px-7"><span>© 2026 JAVA KOMPUTER · Internal Management System</span><span>Versi 0.1.0 · Tahap 1 · Data demonstrasi</span></footer>
    </main>
  </div>
}

function Dashboard({ period, setPeriod }: { period: string; setPeriod: (v: string) => void }) {
  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs text-[#8b929a]">Rabu, 11 November 2026</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Ringkasan Toko <span className="text-[#e5b93f]">.</span></h2><p className="mt-1.5 text-xs text-[#777f87]">Pantau performa dan aktivitas JAVA KOMPUTER hari ini.</p></div><div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#191c1f] px-3 py-2 text-xs text-[#aeb4ba]"><CalendarDays size={14} className="text-[#e5b93f]"/><select value={period} onChange={e => setPeriod(e.target.value)} className="bg-transparent outline-none"><option className="bg-[#191c1f]">Hari ini</option><option className="bg-[#191c1f]">7 hari terakhir</option><option className="bg-[#191c1f]">Bulan ini</option></select></div><button className="flex items-center gap-2 rounded-lg bg-[#e5b93f] px-3.5 py-2.5 text-xs font-semibold text-[#171717] transition hover:bg-[#f0ca5b]"><Plus size={15}/> Transaksi Baru</button></div></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((s, i) => { const Icon = s.icon; return <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#191c1f] p-4 sm:p-5"><div className="flex items-center justify-between"><span className="text-xs text-[#929aa2]">{s.label}</span><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5b93f]/[0.10] text-[#e5b93f]"><Icon size={17}/></span></div><p className="mt-4 text-[23px] font-semibold tracking-tight text-white">{s.value}</p><div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">{s.trend === 'up' ? <ArrowUpRight size={13} className="text-emerald-400"/> : s.trend === 'warning' ? <Activity size={12} className="text-amber-400"/> : <ClipboardList size={12} className="text-sky-400"/>}<span className={s.trend === 'up' ? 'text-emerald-400' : s.trend === 'warning' ? 'text-amber-400' : 'text-sky-400'}>{s.change}</span><span className="text-[#68717a]">{s.note}</span></div></div> })}</div>
    <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
      <section className="rounded-xl border border-white/[0.07] bg-[#191c1f] p-5"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Ikhtisar Penjualan</h3><p className="mt-1 text-[10px] text-[#7e8790]">Performa penjualan dalam periode terpilih</p></div><button className="rounded-lg border border-white/[0.08] px-3 py-2 text-[10px] text-[#aab0b6] hover:bg-white/5">Lihat laporan <ArrowUpRight size={12} className="ml-1 inline"/></button></div><div className="mt-6 flex items-end gap-3"><p className="text-2xl font-semibold">{money(3850000)}</p><span className="mb-1 rounded-md bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-400">+12,8%</span></div><div className="mt-6 flex h-[150px] items-end gap-2 sm:gap-4">{[34,52,43,67,48,78,58,88,61,72,54,94].map((h,i)=><div key={i} className="group flex flex-1 flex-col items-center gap-2"><div className="relative w-full rounded-t-md bg-[#e5b93f]/20 transition hover:bg-[#e5b93f]/40" style={{height:`${h}%`}}><div className="absolute inset-x-0 bottom-0 rounded-t-md bg-gradient-to-t from-[#e5b93f] to-[#f0d47e]" style={{height:`${Math.max(20,h-22)}%`}}/></div><span className="text-[9px] text-[#68717a]">{['08','09','10','11','12','13','14','15','16','17','18','19'][i]}</span></div>)}</div><div className="mt-4 flex items-center gap-2 text-[10px] text-[#707981]"><span className="h-2 w-2 rounded-sm bg-[#e5b93f]"/> Penjualan per jam <span className="ml-auto">Data ilustrasi</span></div></section>
      <section className="rounded-xl border border-white/[0.07] bg-[#191c1f] p-5"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Ringkasan Service</h3><p className="mt-1 text-[10px] text-[#7e8790]">Status pekerjaan teknisi</p></div><Wrench size={17} className="text-[#e5b93f]"/></div><div className="mt-6 flex items-center gap-6"><div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full" style={{background:'conic-gradient(#e5b93f 0 42%, #5b91c9 42% 70%, #36a783 70% 88%, #343a40 88% 100%)'}}><div className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-[#191c1f]"><span className="text-2xl font-semibold">12</span><span className="text-[9px] text-[#7e8790]">Total servis</span></div></div><div className="min-w-0 flex-1 space-y-3">{[{name:'Dalam pengerjaan',n:5,c:'bg-[#e5b93f]'},{name:'Menunggu sparepart',n:3,c:'bg-[#5b91c9]'},{name:'Siap diambil',n:4,c:'bg-[#36a783]'}].map(x=><div key={x.name}><div className="flex justify-between text-[10px]"><span className="text-[#aeb4ba]">{x.name}</span><b>{x.n}</b></div><div className="mt-1.5 h-1 rounded-full bg-white/[0.07]"><div className={`${x.c} h-1 rounded-full`} style={{width:`${x.n/12*100}%`}}/></div></div>)}</div></div><button className="mt-6 w-full rounded-lg border border-white/[0.08] py-2.5 text-[10px] font-medium text-[#b7bdc3] hover:bg-white/[0.04]">Buka Service Center <ArrowUpRight size={12} className="ml-1 inline"/></button></section>
    </div>
    <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#191c1f]"><div className="flex flex-col justify-between gap-3 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center"><div><h3 className="text-sm font-semibold">Aktivitas Terbaru</h3><p className="mt-1 text-[10px] text-[#7e8790]">Aktivitas transaksi dan service terakhir</p></div><button className="text-[10px] font-medium text-[#e5b93f] hover:text-[#f0ca5b]">Lihat semua <ArrowUpRight size={12} className="ml-1 inline"/></button></div><div className="divide-y divide-white/[0.05]">{activityItems.map(a=><div key={a.name+a.time} className="flex items-center gap-3 px-5 py-3.5"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${a.color}`}>{a.initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-[#e5e7e9]">{a.name} <span className="font-normal text-[#78818a]">· {a.action}</span></p><p className="mt-1 truncate text-[10px] text-[#747d85]">{a.detail}</p></div><div className="hidden text-right sm:block"><p className={`text-[11px] font-medium ${a.amount.startsWith('+') ? 'text-emerald-400' : a.amount.startsWith('−') ? 'text-[#e5b93f]' : 'text-[#aeb4ba]'}`}>{a.amount}</p><p className="mt-1 text-[9px] text-[#69727a]">{a.time}</p></div><span className="text-[10px] text-[#69727a] sm:hidden">{a.time}</span></div>)}</div></section>
    <div className="grid gap-3 sm:grid-cols-3"><QuickCard icon={Laptop} title="Laptop & Komputer" desc="Penjualan dan perbaikan perangkat" count="8 servis aktif"/><QuickCard icon={Smartphone} title="Handphone" desc="Service dan sparepart ponsel" count="3 servis aktif"/><QuickCard icon={Printer} title="Printer" desc="Service printer dan perlengkapan" count="1 servis aktif"/></div>
    <p className="text-center text-[10px] text-[#555e66]">Semua angka dan aktivitas di atas adalah data demonstrasi, bukan data pelanggan sungguhan.</p>
  </div>
}

function QuickCard({ icon: Icon, title, desc, count }: { icon: IconType; title: string; desc: string; count: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#191c1f] p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e5b93f]/10 text-[#e5b93f]"><Icon size={18}/></div><div className="min-w-0"><p className="text-xs font-semibold">{title}</p><p className="mt-1 truncate text-[10px] text-[#77808a]">{desc}</p><p className="mt-2 text-[10px] text-[#e5b93f]">{count}</p></div></div>
}

function ModulePlaceholder({ active }: { active: string }) {
  const found = navItems.find(n => n.label === active)
  const Icon = found?.icon ?? BriefcaseBusiness
  return <div className="flex min-h-[65vh] items-center justify-center"><div className="max-w-md text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e5b93f]/20 bg-[#e5b93f]/[0.08] text-[#e5b93f]"><Icon size={28}/></div><p className="mt-5 text-lg font-semibold">{active}</p><p className="mt-2 text-sm leading-6 text-[#828b93]">Halaman {active} sudah tersedia di navigasi. Modul ini akan dikembangkan pada tahap berikutnya.</p><span className="mt-5 inline-flex rounded-full border border-[#e5b93f]/20 bg-[#e5b93f]/[0.06] px-3 py-1.5 text-[10px] font-medium text-[#e5b93f]">Dalam rencana pengembangan</span></div></div>
}
export default App
