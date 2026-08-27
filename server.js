const express = require("express");
const multer = require("multer");
const archiver = require("archiver");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "";
const N8N_TIMEOUT_MS = Number(process.env.N8N_TIMEOUT_MS || 120000);
const SIAMTAK_AI_URL = process.env.SIAMTAK_AI_URL || "http://100.76.213.30:3000";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 20, fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(file.mimetype) || [".pdf", ".png", ".jpg", ".jpeg"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("รองรับเฉพาะ PDF, PNG และ JPG/JPEG"));
    }
  }
});

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function safeName(name) {
  return path.basename(name).replace(/[^\wก-๙ .()_-]/g, "_");
}

async function callN8n(files) {
  const form = new FormData();
  for (const file of files) {
    form.append("files", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  }
  form.append("jobType", "accpress");
  form.append("jobName", "Invoice / Billing Extraction");
  form.append("source", "Siamtak Workspace");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: form,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`n8n ตอบกลับ HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return { type: "json", data: await response.json() };
    }

    return {
      type: "binary",
      buffer: Buffer.from(await response.arrayBuffer()),
      mimeType: contentType || "application/octet-stream",
      fileName: response.headers.get("x-file-name") || "processed-result"
    };
  } finally {
    clearTimeout(timer);
  }
}

function demoResult(files) {
  return files.map((f) => ({
    name: `${path.parse(safeName(f.originalname)).name}_processed.json`,
    mimeType: "application/json",
    content: JSON.stringify({
      status: "demo",
      message: "นี่คือผลลัพธ์ตัวอย่างของ Siamtak Workspace",
      document_type: "INVOICE",
      source_file: f.originalname,
      supplier: {
        name: "ตัวอย่าง บริษัทผู้ขาย",
        tax_id: "0000000000000"
      },
      customer: {
        name: "ตัวอย่าง บริษัทผู้ซื้อ"
      },
      items: [],
      totals: {
        subtotal: null,
        vat: null,
        grand_total: null
      }
    }, null, 2)
  }));
}

app.get("/api/config", (_req, res) => {
  res.json({
    appName: "Siamtak Workspace",
    aiUrl: SIAMTAK_AI_URL,
    n8nConfigured: Boolean(N8N_WEBHOOK_URL),
    databaseConfigured: Boolean(pool)
  });
});

app.get("/api/health", async (_req, res) => {
  let database = { configured: Boolean(pool), connected: false };
  if (pool) {
    try {
      await pool.query("SELECT 1");
      database.connected = true;
    } catch (e) {
      database.error = e.message;
    }
  }
  res.json({
    ok: true,
    service: "Siamtak Workspace",
    n8n: { configured: Boolean(N8N_WEBHOOK_URL) },
    database,
    time: new Date().toISOString()
  });
});

app.post("/api/jobs/accpress", upload.array("files", 20), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์" });
    }

    let result;
    if (N8N_WEBHOOK_URL) {
      result = await callN8n(req.files);
    } else {
      result = { type: "json", data: { files: demoResult(req.files), mode: "demo" } };
    }

    if (result.type === "binary") {
      return res.json({
        mode: "n8n",
        files: [{
          name: result.fileName,
          mimeType: result.mimeType,
          contentBase64: result.buffer.toString("base64")
        }]
      });
    }

    const payload = result.data;
    const files = Array.isArray(payload)
      ? payload
      : (payload.files || (payload.name && payload.contentBase64 ? [payload] : []));

    const normalized = files.map((f, i) => ({
      name: safeName(f.name || `processed_${i + 1}.json`),
      mimeType: f.mimeType || "application/octet-stream",
      contentBase64: f.contentBase64 || Buffer.from(f.content || "").toString("base64")
    }));

    if (!normalized.length) {
      return res.status(502).json({
        error: "ได้รับคำตอบจาก n8n แต่ไม่พบไฟล์ผลลัพธ์",
        raw: payload
      });
    }

    res.json({
      mode: N8N_WEBHOOK_URL ? "n8n" : "demo",
      files: normalized
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "ประมวลผลไม่สำเร็จ" });
  }
});

app.post("/api/download/zip", express.json({ limit: "50mb" }), (req, res) => {
  const files = req.body?.files || [];
  if (!files.length) return res.status(400).json({ error: "ไม่พบไฟล์สำหรับ ZIP" });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="siamtak-workspace-results.zip"');

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => {
    console.error(err);
    if (!res.headersSent) res.status(500);
  });
  archive.pipe(res);

  for (const file of files) {
    archive.append(Buffer.from(file.contentBase64, "base64"), {
      name: safeName(file.name || "result")
    });
  }
  archive.finalize();
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(400).json({ error: err.message || "เกิดข้อผิดพลาด" });
});

app.get("*splat", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`Siamtak Workspace running at http://${HOST}:${PORT}`);
  console.log(`LAN access: http://<SERVER-IP>:${PORT}`);
});
