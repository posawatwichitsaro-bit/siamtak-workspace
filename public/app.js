const app=document.getElementById("app");
let me=null,systems=[];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const iconOptions=["📄","📊","🔍","📁","🧾","📋","💼","📦","👥","🏢","📝","📈","📉","🗂️","⚙️","🔧","🛠️","🤖","💡","🔐","🛡️","📌","⭐","🚀","🌐","🖥️","💬","📬","💰","🏠"];

function toast(m,err=false){
  const x=document.createElement("div");
  x.className=`fixed right-5 top-5 z-[100] rounded-2xl px-4 py-3 shadow-2xl border text-sm font-medium ${err?"bg-red-600 border-red-500":"bg-slate-900 border-slate-800"} text-white`;
  x.textContent=m;document.body.appendChild(x);setTimeout(()=>x.remove(),2500)
}
async function api(u,o={}){const r=await fetch(u,o),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.message||"เกิดข้อผิดพลาด");return d}

async function init(){const d=await api("/api/me");if(!d.authenticated)return login();me=d.user;shell()}
function login(){
  app.innerHTML=`<style>.marble-login{background:radial-gradient(ellipse at 12% 9%,rgba(255,255,255,.9),transparent 28%),linear-gradient(116deg,transparent 0 34%,rgba(255,255,255,.65) 35% 35.6%,transparent 38%),linear-gradient(135deg,#e9ecec 0%,#d1d5d6 48%,#f5f6f6 100%)}.login-card{background:linear-gradient(135deg,rgba(255,255,255,.94),rgba(244,240,232,.88));border:1px solid rgba(102,92,80,.16);box-shadow:0 18px 46px rgba(45,42,38,.13),inset 0 1px rgba(255,255,255,.9)}.granite-surface,.stone-action{background:linear-gradient(125deg,#40464a,#161c21 55%,#4a4f51);box-shadow:0 9px 20px rgba(20,24,27,.28)}.stone-action:hover{filter:brightness(1.14);transform:translateY(-1px)}</style><main class="min-h-screen marble-login relative overflow-hidden grid place-items-center p-6">
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-stone-300/40 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] bg-amber-100/40 rounded-full blur-3xl"></div>
    <section class="login-card relative w-full max-w-md backdrop-blur-xl rounded-[2rem] p-8 md:p-10">
      <div class="flex items-center gap-4 mb-9">
        <div class="w-14 h-14 rounded-2xl granite-surface text-white grid place-items-center text-xl font-black shadow-lg">S</div>
        <div><h1 class="font-bold text-xl tracking-tight">Siamtak Workspace</h1><p class="text-sm text-slate-500">Central Hub</p></div>
      </div>
      <form id="login" class="space-y-4">
        <label class="block text-sm font-medium text-slate-600">ชื่อผู้ใช้<input name="username" value="admin" class="mt-1.5 w-full border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-slate-900/10"></label>
        <label class="block text-sm font-medium text-slate-600">รหัสผ่าน<input name="password" value="admin123" type="password" class="mt-1.5 w-full border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-slate-900/10"></label>
        <button class="stone-action w-full text-white rounded-xl py-3.5 font-semibold transition">เข้าสู่ Workspace</button>
      </form>
      <p class="text-xs text-slate-400 mt-5 text-center">Demo: admin/admin123 · user/user123</p>
    </section>
  </main>`;
  document.getElementById("login").onsubmit=async e=>{
    e.preventDefault();try{const d=await api("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});me=d.user;shell()}catch(e){toast(e.message,true)}
  }
}
function shell(){
  app.innerHTML=`<header class="h-[72px] tech-stone-header backdrop-blur-xl border-b border-white/15 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 text-stone-100">
    <div class="flex items-center gap-3">
      <button id="hamb" class="w-10 h-10 rounded-xl hover:bg-white/15 text-lg transition border border-transparent hover:border-white/20 shadow-sm" aria-label="menu">☰</button>
      <button onclick="hub()" class="font-black tracking-tight text-xl title-shadow">Siamtak Workspace <span class="text-[10px] ml-2 text-stone-300 tracking-[.25em]">SYSTEM HUB</span></button>
    </div>
    <div class="flex gap-2 items-center text-sm"><span class="hidden sm:block text-stone-300">${esc(me.name)}</span><span class="px-3 py-1.5 bg-white/10 border border-white/15 rounded-full font-medium text-stone-100 shadow-sm">${esc(me.role)}</span></div>
  </header>
  <aside id="drawer" class="stone-drawer fixed top-[72px] bottom-0 left-0 z-50 w-72 p-4 -translate-x-full transition-transform shadow-2xl text-white">
    <div class="px-3 py-3 mb-3 text-xs font-bold tracking-[.25em] text-stone-400">WORKSPACE</div>
    <nav class="space-y-1">
      <button class="nav" onclick="hub()">🏠 <span>Workspace Hub</span></button>
      <button class="nav" onclick="systemsPage()">🧩 <span>เครื่องมือ</span></button>
      <button class="nav" onclick="openAI()">🤖 <span>Siamtak AI</span></button>
      ${me.role==="Admin"?'<div class="px-3 pt-5 pb-2 text-xs font-bold tracking-[.25em] text-slate-400">ADMIN</div><button class="nav" onclick="adminPage()">⚙️ <span>จัดการระบบ</span></button>':""}
      <button class="nav text-red-600 mt-3" onclick="logout()">↪ <span>ออกจากระบบ</span></button>
    </nav>
  </aside>
  <div id="page"></div>
  <style>
body{background:#e2e4e5;color:#252a2f}
#page{min-height:calc(100vh - 72px);background:radial-gradient(ellipse at 8% 6%,rgba(255,255,255,.94),transparent 25%),radial-gradient(ellipse at 88% 78%,rgba(255,255,255,.76),transparent 31%),linear-gradient(112deg,transparent 0 22%,rgba(255,255,255,.76) 23% 23.5%,transparent 25% 55%,rgba(173,180,184,.16) 56% 56.5%,transparent 58%),linear-gradient(150deg,#edf0f1 0%,#d5d9db 47%,#eef0f1 100%)}
.marble-login{background:radial-gradient(ellipse at 12% 9%,rgba(255,255,255,.9),transparent 28%),linear-gradient(116deg,transparent 0 34%,rgba(255,255,255,.65) 35% 35.6%,transparent 38%),linear-gradient(135deg,#e9ecec 0%,#d1d5d6 48%,#f5f6f6 100%)}
.login-card,.system-card,.support-card{background:linear-gradient(135deg,rgba(255,255,255,.94),rgba(244,240,232,.88));border:1px solid rgba(102,92,80,.16);box-shadow:0 18px 46px rgba(45,42,38,.13),inset 0 1px rgba(255,255,255,.9)}
.granite-surface,.stone-action{background:linear-gradient(125deg,#40464a,#161c21 55%,#4a4f51);box-shadow:0 9px 20px rgba(20,24,27,.28)}
.stone-action:hover{filter:brightness(1.14);transform:translateY(-1px);box-shadow:0 13px 26px rgba(20,24,27,.34)}
.stone-hero,.tech-stone-header{
  background-color:#171d23;
  background-image:
    radial-gradient(ellipse at 9% 115%,rgba(255,255,255,.18) 0 2%,transparent 20%),
    radial-gradient(ellipse at 86% -20%,rgba(207,199,188,.20) 0 8%,transparent 31%),
    linear-gradient(122deg,transparent 0 17%,rgba(255,255,255,.11) 18% 18.6%,transparent 20% 47%,rgba(7,10,14,.42) 49% 50.2%,transparent 52%),
    linear-gradient(68deg,transparent 0 38%,rgba(221,215,207,.13) 39% 39.8%,transparent 42% 68%,rgba(0,0,0,.26) 70% 71%,transparent 73%),
    repeating-linear-gradient(113deg,rgba(255,255,255,.045) 0 1px,transparent 1px 15px),
    linear-gradient(115deg,#30363b 0%,#171d23 49%,#414548 100%);
  box-shadow:0 8px 24px rgba(10,12,15,.28);
}

.stone-hero{color:#f5f2ec}
.stone-hero h1,.stone-hero h2,.stone-hero h3,.stone-hero h4{color:#f8f5ef!important}
.stone-hero p{color:rgba(245,242,236,.76)!important}
.title-shadow,h1,h2,h3,h4{ text-shadow:0 2px 5px rgba(8,10,13,.32) }
.section-title{letter-spacing:-.035em;color:#2a3033}
.stone-drawer{background:linear-gradient(155deg,#343a3d 0%,#171d22 60%,#404346 100%);border-right:1px solid rgba(255,255,255,.12)}
.stone-drawer .nav{color:#eeeae2;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.06);box-shadow:0 5px 14px rgba(0,0,0,.16)}
.stone-drawer .nav:hover{background:rgba(255,255,255,.14);color:#fff;box-shadow:0 8px 18px rgba(0,0,0,.24)}
.system-card{position:relative;overflow:hidden;box-shadow:0 10px 25px rgba(45,42,38,.09);transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
.system-card::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(125deg,rgba(255,255,255,.38),transparent 38%,rgba(102,92,80,.05));opacity:.8}
.system-card:hover{transform:translateY(-4px);border-color:rgba(148,102,67,.42);box-shadow:0 18px 34px rgba(45,42,38,.18)}
.system-card h4{color:#252a2d}.system-card .system-icon{background:#eee9df;border-color:#ded5c8}.system-card:hover .system-icon{background:#f5e6d4;border-color:#d8ae86}
.support-card{box-shadow:0 9px 24px rgba(45,42,38,.10)}

.ai-bubble .ai-ring,.ai-bubble .ai-ring-2{position:absolute;inset:-5px;border:1px solid transparent;border-radius:9999px;pointer-events:none}
.ai-bubble:hover .ai-ring{border-color:rgba(220,38,38,.45);animation:aiPulse 1.4s ease-out infinite}
.ai-bubble:hover .ai-ring-2{border-color:rgba(220,38,38,.25);animation:aiPulse 1.4s .35s ease-out infinite}
.ai-bubble:hover .ai-core{animation:aiBlink .8s steps(2,end) infinite;box-shadow:0 0 22px rgba(220,38,38,.45)}
@keyframes aiPulse{0%{transform:scale(.9);opacity:0}25%{opacity:1}100%{transform:scale(1.35);opacity:0}}
@keyframes aiBlink{50%{filter:brightness(1.45)}}

.nav{display:flex;gap:.75rem;align-items:center;width:100%;text-align:left;padding:.8rem .75rem;border-radius:.85rem;font-size:.925rem;transition:.15s;color:#475569;box-shadow:0 3px 10px rgba(15,23,42,.10)}
.nav:hover{background:#f1f5f9;color:#0f172a;transform:translateX(2px);box-shadow:0 6px 15px rgba(15,23,42,.16)}
</style>`;
  const drawer=document.getElementById("drawer"), hamb=document.getElementById("hamb");
let menuTimer;
const openMenu=()=>{clearTimeout(menuTimer);drawer.classList.remove("-translate-x-full")};
const closeMenu=()=>{menuTimer=setTimeout(()=>drawer.classList.add("-translate-x-full"),180)};
hamb.onmouseenter=openMenu;
hamb.onclick=openMenu;
hamb.onmouseleave=closeMenu;
drawer.onmouseenter=openMenu;
drawer.onmouseleave=closeMenu;
  hub()
}
async function hub(){
  systems=await api("/api/systems");
  document.getElementById("page").innerHTML=`<main class="max-w-7xl mx-auto p-4 md:p-8 text-[16px] md:text-[17px]">
    <section class="relative overflow-hidden rounded-[2rem] stone-hero border border-white/15 shadow-xl p-7 md:p-10 mb-8">
      <div class="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-stone-200/20 to-transparent pointer-events-none"></div>
      <div class="absolute -right-16 -top-20 w-56 h-56 rounded-full border-[20px] border-white/35"></div>
      <div class="relative max-w-4xl">
        <div class="inline-flex items-center gap-2 text-sm font-extrabold tracking-[.20em] text-red-600 bg-white px-4 py-1.5 rounded-full border border-white/80 shadow-sm mb-5"><span class="w-2 h-2 rounded-full bg-red-600"></span> SIAMTAK WORKSPACE</div>
        <h2 class="text-5xl md:text-7xl font-black tracking-[-.04em] leading-[1.02]">ทำงานอะไรวันนี้?</h2>
        <p class="mt-4 text-base md:text-lg">เลือกเครื่องมือที่ต้องการใช้งาน หรือค้นหาจากช่องด้านล่าง</p>
        <div class="relative max-w-3xl mt-7">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">⌕</span>
          <input id="workSearch" autocomplete="off" placeholder="ค้นหาเครื่องมือหรือสิ่งที่ต้องการทำ..." class="w-full h-16 pl-12 pr-20 rounded-2xl border border-white/20 bg-white/95 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition text-sm md:text-base shadow-lg shadow-black/10">
          <kbd class="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold tracking-wider text-slate-400">SEARCH</kbd>
          <div id="searchResults" class="hidden absolute top-[calc(100%+8px)] left-0 right-0 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2"></div>
        </div>
      </div>
    </section>
    <section>
      <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-3"><span class="w-1 h-5 rounded-full bg-amber-700"></span><h3 class="section-title text-xl md:text-2xl font-black">เครื่องมือ</h3></div><span class="text-[10px] font-bold tracking-[.18em] text-slate-500">${systems.length} TOOLS</span></div>
      <div id="systemGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${systems.map(card).join("")}</div>
      <div id="emptySearch" class="hidden text-center py-14 border border-dashed border-slate-200 rounded-2xl bg-white"><div class="text-3xl">⌕</div><p class="font-semibold mt-3">ไม่พบเครื่องมือ</p><p class="text-sm text-slate-400 mt-1">ลองใช้คำค้นหาอื่น</p></div>
    </section>
    <section class="support-card mt-7 rounded-2xl px-5 py-4 flex gap-4 items-center"><div class="w-9 h-9 rounded-xl bg-stone-200 text-stone-700 grid place-items-center">💬</div><div><h3 class="font-bold text-sm">ติดต่อ Admin</h3><p class="text-xs text-slate-500 mt-0.5">หากต้องการเพิ่มเครื่องมือหรือพบปัญหาในการใช้งาน สามารถติดต่อ Admin</p></div></section>
  </main>${aiBubble()}`;
  const input=document.getElementById("workSearch"),results=document.getElementById("searchResults"),grid=document.getElementById("systemGrid"),empty=document.getElementById("emptySearch");
  const renderSearch=q=>{const term=q.trim().toLowerCase();if(!term){results.classList.add("hidden");grid.innerHTML=systems.map(card).join("");empty.classList.add("hidden");return} const matches=systems.filter(x=>(x.name+" "+x.description+" "+x.url).toLowerCase().includes(term)); grid.innerHTML=matches.map(card).join(""); empty.classList.toggle("hidden",matches.length>0); results.innerHTML=matches.slice(0,6).map(x=>`<button class="searchItem w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition" data-id="${esc(x.id)}"><span class="w-9 h-9 rounded-lg bg-slate-100 grid place-items-center text-lg">${esc(x.icon)}</span><span><b class="block text-sm">${esc(x.name)}</b><small class="text-slate-400">${esc(x.description)}</small></span><span class="ml-auto text-red-600">↗</span></button>`).join("")||`<div class="p-4 text-sm text-slate-400">ไม่พบเครื่องมือ</div>`; results.classList.remove("hidden"); results.querySelectorAll(".searchItem").forEach(b=>b.onclick=()=>{const x=systems.find(a=>a.id===b.dataset.id);results.classList.add("hidden");input.value=x.name;launch(x.url,x.type)})};
  input.oninput=e=>renderSearch(e.target.value); input.onkeydown=e=>{if(e.key==="Escape"){input.value="";renderSearch("")}};
}
function aiBubble(){return `<button onclick="openAI()" title="Siamtak AI" class="ai-bubble fixed right-6 bottom-6 z-40 group">
  <span class="ai-ring"></span><span class="ai-ring ai-ring-2"></span>
  <span class="relative flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-slate-950 text-white shadow-lg border border-slate-200 group-hover:border-red-300 transition">
    <span class="text-sm font-bold tracking-wide">Siamtak AI</span>
    <span class="ai-core w-11 h-11 rounded-full bg-red-600 grid place-items-center text-sm font-black tracking-[-.08em] text-white shadow-sm font-mono">AI</span>
  </span>
</button>`}
function card(s){return `<button onclick="launch('${esc(s.url)}','${esc(s.type)}')" class="system-card text-left rounded-xl px-4 py-3.5 group"><div class="relative flex items-center gap-3"><div class="system-icon w-12 h-12 shrink-0 rounded-lg border grid place-items-center text-2xl transition">${esc(s.icon)}</div><div class="min-w-0 flex-1"><h4 class="font-bold text-lg md:text-xl truncate">${esc(s.name)}</h4><p class="text-sm md:text-base text-slate-500 mt-0.5 truncate">${esc(s.description)}</p></div><span class="text-stone-400 group-hover:text-amber-700 transition text-lg">↗</span></div></button>`}
function launch(u,t){if(u==="/file-extraction")return extraction();if(u==="/document-checker")return checker();window.open(u,"_blank","noopener,noreferrer")}
async function openAI(){const c=await api("/api/config");window.open(c.siamtakAIUrl,"_blank","noopener,noreferrer")}
function extraction(){document.getElementById("page").innerHTML=`<main class="max-w-5xl mx-auto p-5 md:p-8"><button onclick="hub()" class="text-sm text-slate-500 hover:underline">← Workspace Hub</button><div class="mt-5 bg-white border rounded-3xl p-6 md:p-8"><div class="w-14 h-14 rounded-2xl bg-slate-100 grid place-items-center text-2xl">📊</div><h2 class="text-3xl font-bold mt-5">ดึงข้อมูลจากไฟล์</h2><p class="text-slate-500 mt-1">ระบบย่อยสำหรับ PDF, PNG และ JPG</p><div class="mt-7 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-slate-400 transition"><div class="text-4xl">📤</div><h3 class="font-semibold mt-3">เลือกไฟล์</h3><p class="text-sm text-slate-400 mt-1">รองรับ PDF, PNG, JPG / JPEG และหลายไฟล์</p><input id="files" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" class="mt-5 block w-full text-sm"></div><div id="fl" class="mt-5 space-y-2"></div><button id="go" disabled class="mt-5 w-full py-3.5 rounded-xl bg-slate-950 text-white font-semibold disabled:opacity-30">เริ่มประมวลผล</button></div></main>`;const i=document.getElementById("files"),l=document.getElementById("fl"),b=document.getElementById("go");i.onchange=()=>{l.innerHTML=[...i.files].map(f=>`<div class="border rounded-xl p-3 flex justify-between text-sm"><span>${esc(f.name)}</span><span class="text-slate-400">${(f.size/1024/1024).toFixed(2)} MB</span></div>`).join("");b.disabled=!i.files.length};b.onclick=()=>toast("เตรียมไฟล์สำหรับส่งต่อไปยัง n8n")}
function checker(){document.getElementById("page").innerHTML=`<main class="max-w-5xl mx-auto p-5 md:p-8"><button onclick="hub()" class="text-sm text-slate-500 hover:underline">← Workspace Hub</button><div class="bg-white border rounded-3xl p-8 mt-5"><div class="w-14 h-14 rounded-2xl bg-slate-100 grid place-items-center text-2xl">📄</div><h2 class="text-3xl font-bold mt-5">ระบบตรวจเอกสาร</h2><p class="text-slate-500 mt-2">ระบบย่อยที่พัฒนาแยกจาก Siamtak Workspace ได้</p></div></main>`}
async function systemsPage(){systems=await api("/api/systems");document.getElementById("page").innerHTML=`<main class="max-w-7xl mx-auto p-5 md:p-8"><button onclick="hub()" class="text-sm text-slate-500 hover:underline">← Workspace Hub</button><h2 class="text-3xl font-bold mt-5">เครื่องมือ</h2><p class="text-slate-500 mt-1">ระบบที่สามารถเข้าถึงได้จาก Workspace</p><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-7">${systems.map(card).join("")}</div></main>`}
async function adminPage(){const d=await api("/api/admin/systems");document.getElementById("page").innerHTML=`<main class="max-w-7xl mx-auto p-5 md:p-8"><div class="flex items-end justify-between"><div><p class="text-xs tracking-[.2em] font-bold text-slate-400">ADMIN</p><h2 class="text-3xl font-bold mt-1">จัดการระบบ</h2><p class="text-slate-500 mt-1">เพิ่มและจัดการระบบที่แสดงใน Hub</p></div><button onclick="modal()" class="px-4 py-2.5 bg-slate-950 text-white rounded-xl shadow-lg">+ เพิ่มระบบ</button></div><div class="bg-white border rounded-2xl mt-7 overflow-x-auto"><table class="w-full text-sm"><thead class="bg-slate-50"><tr><th class="text-left p-4">ระบบ</th><th class="p-4">ประเภท</th><th class="p-4">สิทธิ์</th><th class="p-4">สถานะ</th><th class="p-4">จัดการ</th></tr></thead><tbody>${d.map(s=>`<tr class="border-t hover:bg-slate-50/70"><td class="p-4"><b>${esc(s.icon)} ${esc(s.name)}</b><div class="text-xs text-slate-400">${esc(s.url)}</div></td><td class="p-4 text-center">${esc(s.type)}</td><td class="p-4 text-center">${esc(s.permission)}</td><td class="p-4 text-center"><span class="px-2.5 py-1 rounded-full ${s.enabled?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500"}">${s.enabled?"เปิด":"ปิด"}</span></td><td class="p-4 text-center whitespace-nowrap"><button onclick='modal(${JSON.stringify(s)})' class="px-3 py-1.5 bg-slate-100 rounded-lg">แก้ไข</button> <button onclick="del('${s.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg">ลบ</button></td></tr>`).join("")}</tbody></table></div></main>`}
function modal(s={}){const edit=!!s.id,m=document.createElement("div");m.className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm p-4 grid place-items-center";m.innerHTML=`<div class="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl max-h-[92vh] overflow-auto"><div class="flex justify-between items-center"><div><p class="text-xs font-bold tracking-widest text-slate-400">SYSTEM REGISTRY</p><h3 class="text-xl font-bold mt-1">${edit?"แก้ไขระบบ":"เพิ่มระบบ"}</h3></div><button id="x" class="w-9 h-9 rounded-xl hover:bg-slate-100">✕</button></div><form id="sf" class="space-y-4 mt-6"><label class="block text-sm font-medium">ชื่อระบบ<input name="name" required value="${esc(s.name)}" placeholder="ชื่อระบบ" class="mt-1.5 w-full border rounded-xl p-3"></label><label class="block text-sm font-medium">รายละเอียด<input name="description" value="${esc(s.description)}" placeholder="รายละเอียด" class="mt-1.5 w-full border rounded-xl p-3"></label><label class="block text-sm font-medium">URL / Route<input name="url" required value="${esc(s.url)}" placeholder="/system-name หรือ https://..." class="mt-1.5 w-full border rounded-xl p-3"></label>
<label class="block text-sm font-medium">ไอคอน
<div class="flex gap-2 mt-1.5"><input id="iconInput" name="icon" value="${esc(s.icon||"🧩")}" placeholder="พิมพ์ Emoji ได้ เช่น 📄" maxlength="4" class="flex-1 border rounded-xl p-3 text-xl"><button type="button" id="pickerBtn" class="px-4 border rounded-xl hover:bg-slate-50">เลือกไอคอน</button></div>
<div id="iconPicker" class="hidden mt-2 p-3 border rounded-2xl bg-slate-50 grid grid-cols-6 sm:grid-cols-10 gap-2">${iconOptions.map(i=>`<button type="button" class="iconChoice h-10 rounded-xl hover:bg-white hover:shadow text-xl">${i}</button>`).join("")}</div></label>
<div class="grid grid-cols-2 gap-3"><label class="text-sm font-medium">ประเภท<select name="type" class="mt-1.5 w-full border rounded-xl p-3"><option value="internal" ${s.type==="internal"?"selected":""}>Internal</option><option value="external" ${s.type==="external"?"selected":""}>External</option></select></label><label class="text-sm font-medium">สิทธิ์<select name="permission" class="mt-1.5 w-full border rounded-xl p-3"><option value="all" ${s.permission==="all"?"selected":""}>ทุกคน</option><option value="Admin" ${s.permission==="Admin"?"selected":""}>Admin</option><option value="User" ${s.permission==="User"?"selected":""}>User</option></select></label></div>
<label class="block text-sm font-medium">ลำดับ<input name="sortOrder" type="number" value="${s.sortOrder||1}" class="mt-1.5 w-full border rounded-xl p-3"></label><label class="flex gap-2 items-center text-sm"><input name="enabled" type="checkbox" ${s.enabled!==false?"checked":""}> เปิดใช้งาน</label><button class="w-full py-3.5 bg-slate-950 text-white rounded-xl font-semibold">${edit?"บันทึก":"เพิ่มระบบ"}</button></form></div>`;document.body.appendChild(m);m.querySelector("#x").onclick=()=>m.remove();const picker=m.querySelector("#iconPicker");m.querySelector("#pickerBtn").onclick=()=>picker.classList.toggle("hidden");m.querySelectorAll(".iconChoice").forEach(b=>b.onclick=()=>{m.querySelector("#iconInput").value=b.textContent;picker.classList.add("hidden")});m.querySelector("form").onsubmit=async e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));o.enabled=e.target.enabled.checked;o.sortOrder=Number(o.sortOrder||1);try{await api(edit?`/api/admin/systems/${s.id}`:"/api/admin/systems",{method:edit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});m.remove();adminPage();toast("บันทึกแล้ว")}catch(e){toast(e.message,true)}}}
async function del(id){if(!confirm("ต้องการลบระบบนี้หรือไม่?"))return;await api("/api/admin/systems/"+id,{method:"DELETE"});adminPage();toast("ลบระบบแล้ว")}
async function logout(){await api("/api/logout",{method:"POST"});me=null;login()}
init();
