const state = {
  route: "hub",
  files: [],
  results: [],
  config: { aiUrl: "http://100.76.213.30:3000" }
};

const content = document.getElementById("content");
const crumb = document.getElementById("crumb");
const sidebar = document.getElementById("sidebar");
const toast = document.getElementById("toast");

const routes = {
  hub: "Hub",
  accpress: "Auto Accpress",
  history: "ประวัติการทำงาน",
  settings: "ระบบ"
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function setRoute(route) {
  state.route = route;
  crumb.textContent = routes[route] || "Hub";
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.route === route));
  sidebar.classList.remove("open");
  render();
}

document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => setRoute(b.dataset.route)));
document.getElementById("hamburger").addEventListener("click", () => sidebar.classList.toggle("open"));

function render() {
  if (state.route === "hub") renderHub();
  else if (state.route === "accpress") renderAccpress();
  else if (state.route === "history") renderHistory();
  else renderSettings();
}

function renderHub() {
  content.innerHTML = `
    <section class="hero">
      <div>
        <div class="eyebrow">SIAMTAK INTERNAL WORKSPACE</div>
        <h1>ศูนย์กลางการทำงานของพนักงาน</h1>
        <p>เลือกเครื่องมือที่ต้องการใช้งานจากที่เดียว ระบบถูกออกแบบให้ขยายเป็นงานย่อยเพิ่มเติมได้ในอนาคต โดยเชื่อมต่อกับระบบภายใน เช่น n8n, PostgreSQL และ Siamtak AI</p>
      </div>
      <div class="hero-note">
        <small>สถานะระบบ</small>
        <strong>พร้อมใช้งานบน Internal Network</strong>
      </div>
    </section>

    <div class="section-title"><h2>เลือกงานที่ต้องการ</h2><span class="eyebrow">WORK MODULES</span></div>
    <section class="grid">
      <article class="card work-card" onclick="setRoute('accpress')">
        <div class="work-icon">▣</div>
        <h2>Auto Accpress</h2>
        <p>อ่านข้อมูลจากใบแจ้งหนี้ / ใบวางบิล ด้วย AI และส่งต่อกระบวนการผ่าน n8n</p>
        <span class="card-arrow">เริ่มใช้งาน →</span>
      </article>
      <article class="card work-card" onclick="showToast('โมดูลนี้เตรียมพื้นที่ไว้สำหรับงานในอนาคต')">
        <div class="work-icon">⇄</div>
        <h2>งานเอกสารอื่นๆ</h2>
        <p>พื้นที่สำหรับเพิ่มระบบย่อย เช่น แปลงเอกสาร ตรวจข้อมูล หรือสร้างรายงาน</p>
        <span class="card-arrow">เร็วๆ นี้ →</span>
      </article>
      <article class="card work-card" onclick="showToast('กำลังเตรียมโมดูลเพิ่มเติม')">
        <div class="work-icon">＋</div>
        <h2>เพิ่ม Workspace App</h2>
        <p>สถาปัตยกรรมรองรับการเพิ่มเครื่องมือใหม่โดยไม่ต้องเปลี่ยน Hub หลัก</p>
        <span class="card-arrow">วางแผนต่อ →</span>
      </article>
    </section>

    <div class="section-title"><h2>Workspace ทำอะไรได้บ้าง</h2></div>
    <section class="info-grid">
      <div class="card">
        <div class="steps">
          <div class="step"><b>01</b><strong> เลือกงาน</strong><p>เลือกเครื่องมือจาก Hub</p></div>
          <div class="step"><b>02</b><strong> Upload</strong><p>ส่ง PDF / PNG / JPG</p></div>
          <div class="step"><b>03</b><strong> รับผลลัพธ์</strong><p>ดาวน์โหลดไฟล์กลับมา</p></div>
        </div>
      </div>
      <div class="card">
        <small>ต้องการ AI โดยตรง?</small>
        <h2 style="margin:8px 0">Siamtak AI</h2>
        <p>เปิด AI ที่อยู่บนเครือข่ายเดียวกัน</p>
        <a class="primary" style="display:inline-block;text-decoration:none" href="${state.config.aiUrl}" target="_blank">เปิด Siamtak AI ↗</a>
      </div>
    </section>
  `;
}

function renderAccpress() {
  content.innerHTML = `
    <section class="page-head">
      <button class="back" onclick="setRoute('hub')">← กลับ Hub</button>
      <div class="eyebrow">DOCUMENT AUTOMATION</div>
      <h1>Auto Accpress</h1>
      <p>อัปโหลดใบแจ้งหนี้ / ใบวางบิล แล้วให้ workflow ที่เชื่อมกับ n8n ดำเนินการอ่านและสกัดข้อมูล</p>
    </section>
    <section class="card upload-card">
      <div class="dropzone" id="dropzone">
        <div>
          <div class="upload-symbol">⇧</div>
          <h2>ลากไฟล์มาวางที่นี่</h2>
          <p>หรือเลือกไฟล์จากเครื่อง · รองรับ PDF, PNG, JPG/JPEG · สูงสุด 25 MB ต่อไฟล์</p>
          <label class="primary" style="display:inline-block">เลือกไฟล์
            <input class="file-input" id="fileInput" type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" multiple>
          </label>
        </div>
      </div>
      <div id="fileList"></div>
      <div class="action-row">
        <button class="secondary" id="clearBtn">ล้างรายการ</button>
        <button class="primary" id="processBtn">เริ่มประมวลผล</button>
      </div>
      <div id="processing"></div>
      <div id="results"></div>
    </section>
  `;
  bindUpload();
}

function bindUpload() {
  const input = document.getElementById("fileInput");
  const drop = document.getElementById("dropzone");
  input.addEventListener("change", e => addFiles([...e.target.files]));
  ["dragenter","dragover"].forEach(evt => drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.add("drag"); }));
  ["dragleave","drop"].forEach(evt => drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.remove("drag"); }));
  drop.addEventListener("drop", e => addFiles([...e.dataTransfer.files]));
  document.getElementById("clearBtn").addEventListener("click", () => { state.files = []; renderFileList(); });
  document.getElementById("processBtn").addEventListener("click", processFiles);
  renderFileList();
}

function addFiles(files) {
  const allowed = [".pdf",".png",".jpg",".jpeg"];
  const valid = files.filter(f => allowed.includes("." + f.name.split(".").pop().toLowerCase()) && f.size <= 25 * 1024 * 1024);
  if (valid.length !== files.length) showToast("มีไฟล์บางรายการไม่ตรงประเภทหรือเกิน 25 MB");
  state.files = [...state.files, ...valid].slice(0, 20);
  renderFileList();
}

function renderFileList() {
  const box = document.getElementById("fileList");
  if (!box) return;
  if (!state.files.length) {
    box.innerHTML = `<div class="empty">ยังไม่มีไฟล์ที่เลือก</div>`;
    return;
  }
  box.innerHTML = `<div class="file-list">${state.files.map((f,i) => `
    <div class="file-row"><span>📄</span><span>${escapeHtml(f.name)}</span><span class="file-size">${formatBytes(f.size)}</span><button class="secondary" onclick="removeFile(${i})">ลบ</button></div>
  `).join("")}</div>`;
}
function removeFile(i) { state.files.splice(i,1); renderFileList(); }

async function processFiles() {
  if (!state.files.length) return showToast("กรุณาเลือกไฟล์ก่อน");
  const processing = document.getElementById("processing");
  const results = document.getElementById("results");
  processing.innerHTML = `<div class="loading"><span class="spinner"></span><span>กำลังส่งเอกสารเข้า workflow…</span></div>`;
  results.innerHTML = "";

  const form = new FormData();
  state.files.forEach(f => form.append("files", f));

  try {
    const response = await fetch("/api/jobs/accpress", { method:"POST", body:form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "ประมวลผลไม่สำเร็จ");
    state.results = data.files || [];
    processing.innerHTML = `<div class="notice">ประมวลผลสำเร็จ · ${data.mode === "demo" ? "Demo mode (ยังไม่ได้ตั้งค่า n8n)" : "ผ่าน n8n workflow"}</div>`;
    renderResults();
  } catch (e) {
    processing.innerHTML = "";
    showToast(e.message);
  }
}

function renderResults() {
  const box = document.getElementById("results");
  if (!box || !state.results.length) return;
  box.innerHTML = `
    <div class="section-title"><h2>ผลลัพธ์</h2><span>${state.results.length} ไฟล์</span></div>
    <div class="result-list">
      ${state.results.map((f,i) => `<div class="result-row"><span>✓</span><div><strong>${escapeHtml(f.name)}</strong><small> · ${escapeHtml(f.mimeType || "file")}</small></div><button class="primary" onclick="downloadResult(${i})">ดาวน์โหลด</button></div>`).join("")}
    </div>
    ${state.results.length > 1 ? `<div class="action-row"><button class="primary" onclick="downloadZip()">ดาวน์โหลดทั้งหมด (.zip)</button></div>` : ""}
  `;
}

function downloadResult(i) {
  const f = state.results[i];
  const a = document.createElement("a");
  a.href = `data:${f.mimeType};base64,${f.contentBase64}`;
  a.download = f.name;
  a.click();
}
async function downloadZip() {
  const response = await fetch("/api/download/zip", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ files: state.results })
  });
  if (!response.ok) return showToast("สร้าง ZIP ไม่สำเร็จ");
  const blob = await response.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "siamtak-workspace-results.zip";
  a.click();
  URL.revokeObjectURL(a.href);
}

function renderHistory() {
  content.innerHTML = `
    <section class="page-head"><button class="back" onclick="setRoute('hub')">← กลับ Hub</button><div class="eyebrow">WORK HISTORY</div><h1>ประวัติการทำงาน</h1><p>พื้นที่เตรียมไว้สำหรับเก็บประวัติ job, สถานะ และผลลัพธ์เมื่อเชื่อม PostgreSQL</p></section>
    <div class="kpis">
      <div class="card kpi"><small>Jobs วันนี้</small><strong>—</strong><span>รอเชื่อม database</span></div>
      <div class="card kpi"><small>สำเร็จ</small><strong>—</strong><span>รอเชื่อม database</span></div>
      <div class="card kpi"><small>ผิดพลาด</small><strong>—</strong><span>รอเชื่อม database</span></div>
    </div>
    <div class="card" style="margin-top:16px"><div class="empty">ยังไม่ได้เปิดใช้งาน Job History</div></div>
  `;
}

async function renderSettings() {
  content.innerHTML = `<section class="page-head"><button class="back" onclick="setRoute('hub')">← กลับ Hub</button><div class="eyebrow">SYSTEM</div><h1>ระบบ</h1><p>สถานะการเชื่อมต่อของส่วนประกอบหลัก</p></section><div id="health" class="card"><div class="loading"><span class="spinner"></span>กำลังตรวจสอบ</div></div>`;
  try {
    const h = await fetch("/api/health").then(r => r.json());
    document.getElementById("health").innerHTML = `
      <div class="kpis">
        <div><small>Workspace</small><strong>Online</strong></div>
        <div><small>n8n</small><strong>${h.n8n.configured ? "Connected config" : "Not configured"}</strong></div>
        <div><small>PostgreSQL</small><strong>${h.database.connected ? "Connected" : (h.database.configured ? "Configured / offline" : "Not configured")}</strong></div>
      </div>
      <hr style="border:0;border-top:1px solid var(--line);margin:22px 0">
      <div class="notice">Server ถูกออกแบบให้ bind ที่ <b>0.0.0.0</b> จึงสามารถเปิดผ่าน IP ของ Server จากเครื่องอื่นใน LAN ได้</div>
    `;
  } catch {
    document.getElementById("health").innerHTML = `<div class="notice">ไม่สามารถอ่านสถานะระบบได้</div>`;
  }
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B","KB","MB","GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024,i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

async function init() {
  try {
    state.config = await fetch("/api/config").then(r => r.json());
    document.getElementById("aiLink").href = state.config.aiUrl;
  } catch {}
  render();
}
init();
