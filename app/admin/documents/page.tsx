'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faChartLine, faDownload, faEye, faFile, faGear, faKey, faLock,
  faPlus, faPowerOff, faRightFromBracket, faRotate, faShieldHalved, faTrash,
  faUpload, faUsers, faXmark,
} from '@fortawesome/free-solid-svg-icons';

type Stats = { documentsTotal:number; documentsActive:number; usersTotal:number; usersActive:number; sessionsActive:number; views30d:number; downloads30d:number; failed30d:number };
type Doc = { id:string; category:string; title_tr:string; title_en:string; title_de:string; description_tr:string; description_en:string; description_de:string; storage_path:string; mime_type:string; byte_size:number|null; is_active:boolean; created_at:string; permission_count:number; views:number; downloads:number };
type AccessUser = { id:string; display_name:string; is_active:boolean; expires_at:string|null; created_at:string; last_login_at:string|null; permission_count:number };
type Permission = { userId:string; documentId:string; canView:boolean; canDownload:boolean };
type Activity = { day:string; views:number; downloads:number; logins:number; failed:number };
type Log = { id:number; action:string; language:string|null; occurred_at:string; access_user_id:string|null; document_id:string|null; display_name:string|null; title_de:string|null; title_tr:string|null };
type Dashboard = { stats:Stats; documents:Doc[]; users:AccessUser[]; permissions:Permission[]; logs:Log[]; activity:Activity[] };
type Tab = 'dashboard'|'documents'|'access'|'activity'|'settings';

const empty: Dashboard = {
  stats:{ documentsTotal:0,documentsActive:0,usersTotal:0,usersActive:0,sessionsActive:0,views30d:0,downloads30d:0,failed30d:0 },
  documents:[],users:[],permissions:[],logs:[],activity:[],
};

async function api(action:string, payload:Record<string,unknown> = {}) {
  const response = await fetch('/api/admin-documents', {
    method:'POST', headers:{'Content-Type':'application/json'}, cache:'no-store',
    body:JSON.stringify({ action, ...payload }),
  });
  const body = await response.json().catch(() => ({ ok:false, code:'INVALID_RESPONSE' }));
  if (!response.ok || !body?.ok) throw new Error(body?.code || 'REQUEST_FAILED');
  return body;
}

function fmtDate(value:string|null|undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('tr-TR',{ dateStyle:'medium',timeStyle:'short' }).format(new Date(value));
}
function fmtBytes(value:number|null) {
  if (!value) return '—';
  if (value < 1024*1024) return `${Math.max(1,Math.round(value/1024))} KB`;
  return `${(value/(1024*1024)).toFixed(1)} MB`;
}

export default function AdminDocumentsPage() {
  const [ready,setReady] = useState(false);
  const [loggedIn,setLoggedIn] = useState(false);
  const [displayName,setDisplayName] = useState('Yalçın Mutlu');
  const [tab,setTab] = useState<Tab>('dashboard');
  const [data,setData] = useState<Dashboard>(empty);
  const [busy,setBusy] = useState(false);
  const [loginError,setLoginError] = useState('');
  const [toast,setToast] = useState<{text:string;error?:boolean}|null>(null);
  const [uploadOpen,setUploadOpen] = useState(false);
  const [userOpen,setUserOpen] = useState(false);
  const [mobileOpen,setMobileOpen] = useState(false);
  const [query,setQuery] = useState('');
  const [selectedUser,setSelectedUser] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const session = await api('session');
        setDisplayName(session.displayName || 'Yalçın Mutlu');
        setLoggedIn(true);
        const dash = await api('dashboard');
        setData(dash.data || empty);
      } catch { setLoggedIn(false); }
      finally { setReady(true); }
    })();
  },[]);

  useEffect(() => {
    if (!selectedUser && data.users[0]?.id) setSelectedUser(data.users[0].id);
  },[data.users,selectedUser]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null),3200);
    return () => window.clearTimeout(t);
  },[toast]);

  async function refresh(silent=false) {
    if (!silent) setBusy(true);
    try { const dash=await api('dashboard'); setData(dash.data || empty); }
    catch { setLoggedIn(false); }
    finally { if(!silent) setBusy(false); }
  }

  async function login(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setLoginError('');
    const form=new FormData(event.currentTarget);
    try {
      const result=await api('login',{password:String(form.get('password')||'')});
      setDisplayName(result.displayName || 'Yalçın Mutlu'); setLoggedIn(true);
      const dash=await api('dashboard'); setData(dash.data || empty);
    } catch { setLoginError('Şifre doğru değil veya yönetim servisine ulaşılamadı.'); }
    finally { setBusy(false); }
  }

  async function logout() {
    try { await api('logout'); } catch {}
    setLoggedIn(false); setData(empty); setTab('dashboard');
  }

  const docs = useMemo(() => {
    const q=query.trim().toLocaleLowerCase('tr-TR');
    if(!q) return data.documents;
    return data.documents.filter(d => `${d.title_tr} ${d.title_de} ${d.category}`.toLocaleLowerCase('tr-TR').includes(q));
  },[data.documents,query]);
  const users = useMemo(() => {
    const q=query.trim().toLocaleLowerCase('tr-TR');
    if(!q) return data.users;
    return data.users.filter(u => u.display_name.toLocaleLowerCase('tr-TR').includes(q));
  },[data.users,query]);
  const currentUser=data.users.find(u=>u.id===selectedUser) || null;
  const maxActivity=Math.max(1,...data.activity.map(a=>Number(a.views)+Number(a.downloads)));

  if (!ready) return <main className="admin-root admin-login-shell"><div className="admin-login-card"><div className="admin-login-mark"><FontAwesomeIcon icon={faShieldHalved}/></div><h1>Yönetim paneli</h1><p>Güvenli oturum kontrol ediliyor…</p></div></main>;
  if (!loggedIn) return (
    <main className="admin-root admin-login-shell">
      <form className="admin-login-card" onSubmit={login}>
        <div className="admin-login-mark"><FontAwesomeIcon icon={faLock}/></div>
        <h1>Belge Yönetimi</h1>
        <p>Dosyalar, erişim şifreleri, izinler ve kullanım istatistikleri için özel yönetim alanı.</p>
        <div className="admin-field"><label htmlFor="admin-password">Yönetici şifresi</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus/></div>
        <button className="admin-primary" disabled={busy}>{busy?'Giriş yapılıyor…':'Güvenli giriş'}</button>
        {loginError ? <div className="admin-error">{loginError}</div> : null}
      </form>
    </main>
  );

  const titles:Record<Tab,[string,string]> = {
    dashboard:['Genel Bakış','Belgeler ve erişim hareketlerinin anlık özeti'],
    documents:['Belgeler','Özel dosyaları yükle, görüntüle ve yayından kaldır'],
    access:['Erişim Yönetimi','Ziyaretçi şifreleri ve belge izinlarını yönet'],
    activity:['Erişim Kayıtları','Görüntüleme, indirme ve giriş hareketlerini incele'],
    settings:['Güvenlik Ayarları','Yönetici şifresini ve oturum güvenliğini yönet'],
  };

  return (
    <main className="admin-root">
      <div className="admin-app">
        <aside className={`admin-sidebar ${mobileOpen?'open':''}`}>
          <div className="admin-brand"><div className="admin-brand-mark"><FontAwesomeIcon icon={faShieldHalved}/></div><div><strong>Yalçın Mutlu</strong><span>Secure Documents</span></div></div>
          <nav className="admin-nav">
            <NavButton active={tab==='dashboard'} icon={faChartLine} onClick={()=>go('dashboard')}>Genel Bakış</NavButton>
            <NavButton active={tab==='documents'} icon={faFile} onClick={()=>go('documents')}>Belgeler</NavButton>
            <NavButton active={tab==='access'} icon={faUsers} onClick={()=>go('access')}>Erişim Yönetimi</NavButton>
            <NavButton active={tab==='activity'} icon={faRotate} onClick={()=>go('activity')}>Erişim Kayıtları</NavButton>
            <NavButton active={tab==='settings'} icon={faGear} onClick={()=>go('settings')}>Güvenlik</NavButton>
          </nav>
          <div className="admin-sidebar-footer">
            <div className="admin-user-chip"><strong>{displayName}</strong><span>Yönetici oturumu · 8 saat</span></div>
            <button className="admin-ghost" onClick={logout}><FontAwesomeIcon icon={faRightFromBracket}/> Çıkış yap</button>
          </div>
        </aside>

        <section className="admin-main">
          <header className="admin-topbar">
            <div><button className="admin-mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)}><FontAwesomeIcon icon={mobileOpen?faXmark:faBars}/></button><div><h1>{titles[tab][0]}</h1><p>{titles[tab][1]}</p></div></div>
            <div className="admin-top-actions"><button className="admin-secondary" disabled={busy} onClick={()=>refresh()}><FontAwesomeIcon icon={faRotate}/> Yenile</button>{tab==='documents'?<button className="admin-primary" onClick={()=>setUploadOpen(true)}><FontAwesomeIcon icon={faUpload}/> Belge yükle</button>:null}{tab==='access'?<button className="admin-primary" onClick={()=>setUserOpen(true)}><FontAwesomeIcon icon={faPlus}/> Erişim oluştur</button>:null}</div>
          </header>

          <div className="admin-content">
            {tab==='dashboard' ? <DashboardView data={data} maxActivity={maxActivity} setTab={setTab}/> : null}
            {tab==='documents' ? <DocumentsView docs={docs} query={query} setQuery={setQuery} onUpload={()=>setUploadOpen(true)} onRefresh={refresh} notify={notify}/> : null}
            {tab==='access' ? <AccessView users={users} allDocs={data.documents} permissions={data.permissions} selectedUser={selectedUser} setSelectedUser={setSelectedUser} currentUser={currentUser} query={query} setQuery={setQuery} onNew={()=>setUserOpen(true)} onRefresh={refresh} notify={notify}/> : null}
            {tab==='activity' ? <ActivityView logs={data.logs}/> : null}
            {tab==='settings' ? <SettingsView onChanged={()=>{notify('Yönetici şifresi değiştirildi.'); refresh(true);}}/> : null}
          </div>
        </section>
      </div>
      {uploadOpen ? <UploadModal onClose={()=>setUploadOpen(false)} onDone={()=>{setUploadOpen(false);notify('Belge güvenli depoya yüklendi.');refresh();}}/> : null}
      {userOpen ? <UserModal onClose={()=>setUserOpen(false)} onDone={()=>{setUserOpen(false);notify('Yeni erişim şifresi oluşturuldu.');refresh();}}/> : null}
      {toast ? <div className={`admin-toast ${toast.error?'error':''}`}>{toast.text}</div> : null}
    </main>
  );

  function go(next:Tab){ setTab(next); setMobileOpen(false); setQuery(''); }
  function notify(text:string,error=false){ setToast({text,error}); }
}

function NavButton({active,icon,onClick,children}:{active:boolean;icon:any;onClick:()=>void;children:React.ReactNode}) { return <button className={active?'active':''} onClick={onClick}><FontAwesomeIcon icon={icon}/>{children}</button>; }

function DashboardView({data,maxActivity,setTab}:{data:Dashboard;maxActivity:number;setTab:(tab:Tab)=>void}) {
  const s=data.stats;
  return <>
    <div className="admin-stats">
      <Stat label="Toplam belge" value={s.documentsTotal} sub={`${s.documentsActive} aktif`} icon={faFile}/>
      <Stat label="Aktif erişim" value={s.usersActive} sub={`${s.usersTotal} toplam kullanıcı`} icon={faUsers}/>
      <Stat label="30 gün görüntüleme" value={s.views30d} sub={`${s.downloads30d} indirme`} icon={faEye}/>
      <Stat label="Aktif oturum" value={s.sessionsActive} sub={`${s.failed30d} başarısız giriş`} icon={faShieldHalved}/>
    </div>
    <div className="admin-grid-2">
      <section className="admin-card"><div className="admin-card-head"><div><h2>Son 14 gün aktivitesi</h2><span>Görüntüleme ve indirme hareketleri</span></div><div className="admin-legend"><span>Görüntüleme</span><span>İndirme</span></div></div><div className="admin-card-body"><div className="admin-chart">{data.activity.map((a,i)=><div className="admin-chart-col" key={a.day}><div className="admin-chart-bars"><div className="admin-chart-bar" title={`${a.views} görüntüleme`} style={{height:`${Math.max(3,Number(a.views)/maxActivity*100)}%`}}/><div className="admin-chart-bar download" title={`${a.downloads} indirme`} style={{height:`${Math.max(3,Number(a.downloads)/maxActivity*100)}%`}}/></div><label>{i%2===0?new Date(a.day).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'}):''}</label></div>)}</div></div></section>
      <section className="admin-card"><div className="admin-card-head"><div><h2>Belge performansı</h2><span>En çok erişilen dosyalar</span></div><button className="admin-ghost" onClick={()=>setTab('documents')}>Tümü</button></div><div className="admin-card-body admin-mini-list">{[...data.documents].sort((a,b)=>(Number(b.views)+Number(b.downloads))-(Number(a.views)+Number(a.downloads))).slice(0,5).map(d=><div className="admin-mini-item" key={d.id}><div><strong>{d.title_tr}</strong><span>{d.category}</span></div><span>{d.views} görüntüleme · {d.downloads} indirme</span></div>)}{data.documents.length===0?<div className="admin-empty">Henüz belge yok.</div>:null}</div></section>
    </div>
  </>;
}
function Stat({label,value,sub,icon}:{label:string;value:number;sub:string;icon:any}) { return <div className="admin-stat"><div className="admin-stat-head"><span>{label}</span><span className="admin-stat-icon"><FontAwesomeIcon icon={icon}/></span></div><strong>{value}</strong><small>{sub}</small></div>; }

function DocumentsView({docs,query,setQuery,onUpload,onRefresh,notify}:{docs:Doc[];query:string;setQuery:(s:string)=>void;onUpload:()=>void;onRefresh:(silent?:boolean)=>Promise<void>;notify:(s:string,e?:boolean)=>void}) {
  async function toggle(doc:Doc){ try{await api('toggleDocument',{documentId:doc.id,active:!doc.is_active});notify(doc.is_active?'Belge pasif hale getirildi.':'Belge yeniden aktifleştirildi.');await onRefresh(true);}catch{notify('Belge durumu değiştirilemedi.',true);} }
  async function remove(doc:Doc){ if(!window.confirm(`“${doc.title_tr}” belgesini kalıcı olarak silmek istiyor musun?`))return;try{await api('deleteDocument',{documentId:doc.id});notify('Belge kalıcı olarak silindi.');await onRefresh(true);}catch{notify('Belge silinemedi.',true);} }
  async function preview(doc:Doc){ try{const r=await api('documentUrl',{documentId:doc.id});window.open(r.url,'_blank','noopener,noreferrer');}catch{notify('Belge açılamadı.',true);} }
  return <><div className="admin-toolbar"><div className="admin-toolbar-left"><input className="admin-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Belge ara…"/></div><button className="admin-primary" onClick={onUpload}><FontAwesomeIcon icon={faUpload}/> Yeni belge</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Belge</th><th>Kategori</th><th>Boyut</th><th>İzin</th><th>Kullanım</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>{docs.map(d=><tr key={d.id}><td className="admin-doc-title"><strong>{d.title_tr}</strong><span>{d.title_de}</span></td><td><span className="admin-badge">{d.category}</span></td><td>{fmtBytes(d.byte_size)}</td><td>{d.permission_count}</td><td>{d.views} / {d.downloads}</td><td><span className={`admin-badge ${d.is_active?'':'off'}`}>{d.is_active?'Aktif':'Pasif'}</span></td><td><div className="admin-actions"><button className="admin-icon-button" title="Görüntüle" onClick={()=>preview(d)}><FontAwesomeIcon icon={faEye}/></button><button className="admin-icon-button" title={d.is_active?'Pasif yap':'Aktif yap'} onClick={()=>toggle(d)}><FontAwesomeIcon icon={faPowerOff}/></button><button className="admin-icon-button danger" title="Sil" onClick={()=>remove(d)}><FontAwesomeIcon icon={faTrash}/></button></div></td></tr>)}{docs.length===0?<tr><td colSpan={7}><div className="admin-empty">Aramana uygun belge bulunamadı.</div></td></tr>:null}</tbody></table></div></>;
}

function AccessView({users,allDocs,permissions,selectedUser,setSelectedUser,currentUser,query,setQuery,onNew,onRefresh,notify}:{users:AccessUser[];allDocs:Doc[];permissions:Permission[];selectedUser:string;setSelectedUser:(s:string)=>void;currentUser:AccessUser|null;query:string;setQuery:(s:string)=>void;onNew:()=>void;onRefresh:(silent?:boolean)=>Promise<void>;notify:(s:string,e?:boolean)=>void}) {
  async function toggleUser(u:AccessUser){try{await api('toggleUser',{userId:u.id,active:!u.is_active});notify(u.is_active?'Erişim kapatıldı.':'Erişim yeniden açıldı.');await onRefresh(true);}catch{notify('Kullanıcı durumu değiştirilemedi.',true);}}
  async function resetPassword(u:AccessUser){const p=window.prompt(`${u.display_name} için yeni şifre (en az 10 karakter):`);if(!p)return;try{await api('resetUserPassword',{userId:u.id,password:p});notify('Erişim şifresi yenilendi.');}catch{notify('Şifre yenilenemedi.',true);}}
  async function permission(doc:Doc,canView:boolean,canDownload:boolean){if(!currentUser)return;try{await api('setPermission',{userId:currentUser.id,documentId:doc.id,canView,canDownload:canView&&canDownload});await onRefresh(true);}catch{notify('İzin güncellenemedi.',true);}}
  return <><div className="admin-toolbar"><div className="admin-toolbar-left"><input className="admin-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Erişim kullanıcısı ara…"/></div><button className="admin-primary" onClick={onNew}><FontAwesomeIcon icon={faPlus}/> Yeni erişim</button></div><div className="admin-permission-grid"><section className="admin-card"><div className="admin-card-head"><div><h2>Erişim kullanıcıları</h2><span>{users.length} kayıt</span></div></div><div className="admin-card-body admin-user-list">{users.map(u=><button className={selectedUser===u.id?'active':''} key={u.id} onClick={()=>setSelectedUser(u.id)}><div><strong>{u.display_name}</strong><span>{u.is_active?'Aktif':'Pasif'} · {u.permission_count} belge</span></div><span>{u.expires_at?new Date(u.expires_at).toLocaleDateString('tr-TR'):'Süresiz'}</span></button>)}{users.length===0?<div className="admin-empty">Henüz erişim kullanıcısı yok.</div>:null}</div></section><section className="admin-card"><div className="admin-card-head"><div><h2>{currentUser?.display_name || 'Belge izinleri'}</h2><span>{currentUser?`Son giriş: ${fmtDate(currentUser.last_login_at)}`:'Önce kullanıcı seç'}</span></div>{currentUser?<div className="admin-actions"><button className="admin-icon-button" title="Şifreyi değiştir" onClick={()=>resetPassword(currentUser)}><FontAwesomeIcon icon={faKey}/></button><button className="admin-icon-button" title={currentUser.is_active?'Erişimi kapat':'Erişimi aç'} onClick={()=>toggleUser(currentUser)}><FontAwesomeIcon icon={faPowerOff}/></button></div>:null}</div><div className="admin-card-body admin-permission-docs">{currentUser?allDocs.map(d=>{const p=permissions.find(x=>x.userId===currentUser.id&&x.documentId===d.id);return <div className="admin-permission-row" key={d.id}><strong>{d.title_tr}</strong><label className="admin-check"><input type="checkbox" checked={Boolean(p?.canView)} onChange={e=>permission(d,e.target.checked,Boolean(p?.canDownload))}/> Görüntüle</label><label className="admin-check"><input type="checkbox" disabled={!p?.canView} checked={Boolean(p?.canDownload)} onChange={e=>permission(d,true,e.target.checked)}/> İndir</label></div>}):<div className="admin-empty">Bir kullanıcı seç.</div>}</div></section></div></>;
}

function ActivityView({logs}:{logs:Log[]}) { return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Zaman</th><th>İşlem</th><th>Kullanıcı</th><th>Belge</th><th>Dil</th></tr></thead><tbody>{logs.map(l=><tr key={l.id}><td>{fmtDate(l.occurred_at)}</td><td><span className={`admin-log-action ${l.action}`}>{labelAction(l.action)}</span></td><td>{l.display_name||'—'}</td><td className="admin-doc-title"><strong>{l.title_tr||l.title_de||'—'}</strong></td><td>{(l.language||'—').toUpperCase()}</td></tr>)}{logs.length===0?<tr><td colSpan={5}><div className="admin-empty">Henüz erişim kaydı yok.</div></td></tr>:null}</tbody></table></div>; }
function labelAction(a:string){return ({view:'Görüntüleme',download:'İndirme',login:'Giriş',login_failed:'Başarısız giriş',logout:'Çıkış',list:'Listeleme'} as Record<string,string>)[a]||a;}

function SettingsView({onChanged}:{onChanged:()=>void}) {
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const f=new FormData(e.currentTarget);const next=String(f.get('newPassword')||'');const confirm=String(f.get('confirmPassword')||'');if(next!==confirm){setError('Yeni şifreler aynı değil.');setBusy(false);return;}try{await api('changePassword',{currentPassword:String(f.get('currentPassword')||''),newPassword:next});e.currentTarget.reset();onChanged();}catch{setError('Şifre değiştirilemedi. Mevcut şifreyi ve minimum 12 karakter kuralını kontrol et.');}finally{setBusy(false);}}
  return <div className="admin-grid-2"><section className="admin-card"><div className="admin-card-head"><div><h2>Yönetici şifresini değiştir</h2><span>Diğer yönetici oturumları otomatik kapatılır</span></div></div><form className="admin-card-body" onSubmit={submit}><div className="admin-field"><label>Mevcut şifre</label><input name="currentPassword" type="password" required/></div><div className="admin-field"><label>Yeni şifre</label><input name="newPassword" type="password" minLength={12} required/></div><div className="admin-field"><label>Yeni şifre tekrar</label><input name="confirmPassword" type="password" minLength={12} required/></div>{error?<div className="admin-error" style={{color:'#9c2834',background:'#fff0f2'}}>{error}</div>:null}<button className="admin-primary" disabled={busy}><FontAwesomeIcon icon={faKey}/>{busy?'Kaydediliyor…':'Şifreyi güncelle'}</button></form></section><section className="admin-card"><div className="admin-card-head"><div><h2>Güvenlik modeli</h2><span>Panel erişim koruması</span></div></div><div className="admin-card-body admin-mini-list"><div className="admin-mini-item"><div><strong>HttpOnly yönetici oturumu</strong><span>Oturum anahtarı JavaScript tarafından okunamaz</span></div><span className="admin-badge">Aktif</span></div><div className="admin-mini-item"><div><strong>Özel depolama alanı</strong><span>Dosyalar herkese açık URL ile yayınlanmaz</span></div><span className="admin-badge">Aktif</span></div><div className="admin-mini-item"><div><strong>Kısa süreli belge bağlantıları</strong><span>Yönetici önizleme bağlantıları 120 saniye geçerli</span></div><span className="admin-badge">Aktif</span></div></div></section></div>;
}

function UploadModal({onClose,onDone}:{onClose:()=>void;onDone:()=>void}) {
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const form=new FormData(e.currentTarget);try{const r=await fetch('/api/admin-documents',{method:'POST',body:form});const b=await r.json().catch(()=>({}));if(!r.ok||!b.ok)throw new Error(b.code);onDone();}catch{setError('Dosya yüklenemedi. PDF/JPG/PNG/WebP ve maksimum 20 MB sınırını kontrol et.');}finally{setBusy(false);}}
  return <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={submit}><div className="admin-modal-head"><h2>Yeni belge yükle</h2><button type="button" className="admin-modal-close" onClick={onClose}><FontAwesomeIcon icon={faXmark}/></button></div><div className="admin-modal-body"><input type="hidden" name="action" value="upload"/><div className="admin-form-grid"><div className="admin-field full"><label>Dosya</label><input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required/></div><div className="admin-field"><label>Kategori</label><select name="category" defaultValue="certificate"><option value="cv">CV</option><option value="diploma">Diploma</option><option value="certificate">Sertifika</option><option value="reference">Referans</option><option value="other">Diğer</option></select></div><div className="admin-field"><label>Türkçe başlık</label><input name="titleTr" required/></div><div className="admin-field"><label>Almanca başlık</label><input name="titleDe" required/></div><div className="admin-field"><label>İngilizce başlık</label><input name="titleEn" required/></div><div className="admin-field full"><label>Türkçe açıklama</label><textarea name="descriptionTr"/></div><div className="admin-field"><label>Almanca açıklama</label><textarea name="descriptionDe"/></div><div className="admin-field"><label>İngilizce açıklama</label><textarea name="descriptionEn"/></div></div>{error?<div className="admin-error" style={{color:'#9c2834',background:'#fff0f2'}}>{error}</div>:null}<div className="admin-modal-actions"><button type="button" className="admin-ghost" onClick={onClose}>Vazgeç</button><button className="admin-primary" disabled={busy}><FontAwesomeIcon icon={faUpload}/>{busy?'Yükleniyor…':'Güvenli yükle'}</button></div></div></form></div>;
}

function UserModal({onClose,onDone}:{onClose:()=>void;onDone:()=>void}) {
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const f=new FormData(e.currentTarget);try{const date=String(f.get('expiresAt')||'');await api('createUser',{displayName:String(f.get('displayName')||''),password:String(f.get('password')||''),expiresAt:date?new Date(`${date}T23:59:59`).toISOString():null});onDone();}catch{setError('Erişim oluşturulamadı. Şifre en az 10 karakter olmalı.');}finally{setBusy(false);}}
  return <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={submit}><div className="admin-modal-head"><h2>Yeni ziyaretçi erişimi</h2><button type="button" className="admin-modal-close" onClick={onClose}><FontAwesomeIcon icon={faXmark}/></button></div><div className="admin-modal-body"><div className="admin-field"><label>Ad / açıklama</label><input name="displayName" placeholder="Örn. İnsan Kaynakları - ABC GmbH" required/></div><div className="admin-form-grid"><div className="admin-field"><label>Erişim şifresi</label><input name="password" type="password" minLength={10} required/></div><div className="admin-field"><label>Son geçerlilik tarihi</label><input name="expiresAt" type="date"/></div></div><p style={{color:'#738396',fontSize:'.78rem',lineHeight:1.6}}>Kullanıcı oluşturulduktan sonra “Erişim Yönetimi” bölümünden hangi belgeleri görüntüleyebileceğini ve indirebileceğini seçebilirsin.</p>{error?<div className="admin-error" style={{color:'#9c2834',background:'#fff0f2'}}>{error}</div>:null}<div className="admin-modal-actions"><button type="button" className="admin-ghost" onClick={onClose}>Vazgeç</button><button className="admin-primary" disabled={busy}><FontAwesomeIcon icon={faPlus}/>{busy?'Oluşturuluyor…':'Erişim oluştur'}</button></div></div></form></div>;
}
