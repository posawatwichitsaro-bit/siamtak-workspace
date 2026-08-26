
import os, uuid, json, zipfile, shutil
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_from_directory, send_file, abort

BASE = Path(__file__).resolve().parent
UPLOAD_DIR = BASE / "uploads"
RESULT_DIR = BASE / "results"
JOBS_FILE = BASE / "jobs.json"
ALLOWED = {".pdf", ".png", ".jpg", ".jpeg"}
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "").strip()

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024

def load_jobs():
    if not JOBS_FILE.exists():
        return []
    try:
        return json.loads(JOBS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []

def save_jobs(jobs):
    JOBS_FILE.write_text(json.dumps(jobs, ensure_ascii=False, indent=2), encoding="utf-8")

def add_job(files):
    job_id = uuid.uuid4().hex[:10].upper()
    job_dir = UPLOAD_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    names = []
    for f in files:
        ext = Path(f.filename).suffix.lower()
        if ext not in ALLOWED:
            continue
        safe_name = Path(f.filename).name
        f.save(job_dir / safe_name)
        names.append(safe_name)

    job = {
        "id": job_id,
        "tool": "Accpress",
        "status": "queued",
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "files": names,
        "result_files": [],
        "mode": "n8n" if N8N_WEBHOOK_URL else "prototype"
    }
    jobs = load_jobs()
    jobs.insert(0, job)
    save_jobs(jobs)
    return job

@app.get("/")
def hub():
    return render_template("index.html", page="hub")

@app.get("/tools")
def tools():
    return render_template("index.html", page="tools")

@app.get("/tools/accpress")
def accpress():
    return render_template("index.html", page="accpress")

@app.get("/tools/accpress/upload")
def upload_page():
    return render_template("index.html", page="upload")

@app.get("/tools/accpress/jobs")
def jobs_page():
    return render_template("index.html", page="jobs")

@app.get("/tools/accpress/result")
def result_page():
    return render_template("index.html", page="result")

@app.get("/about")
def about():
    return render_template("index.html", page="about")

@app.get("/contact")
def contact():
    return render_template("index.html", page="contact")

@app.post("/api/accpress/upload")
def api_upload():
    files = request.files.getlist("files")
    files = [f for f in files if f and f.filename]
    if not files:
        return jsonify(error="กรุณาเลือกไฟล์"), 400

    invalid = [f.filename for f in files if Path(f.filename).suffix.lower() not in ALLOWED]
    if invalid:
        return jsonify(error=f"มีไฟล์ที่ไม่รองรับ: {', '.join(invalid)}"), 400

    job = add_job(files)
    # Hook point for the real n8n workflow.
    # Set N8N_WEBHOOK_URL to forward job data to n8n in the production version.
    if N8N_WEBHOOK_URL:
        job["status"] = "processing"
        save_jobs(load_jobs())
    else:
        # Prototype behavior: create placeholder output files immediately.
        result_dir = RESULT_DIR / job["id"]
        result_dir.mkdir(parents=True, exist_ok=True)
        result_files = []
        for name in job["files"]:
            out = result_dir / (Path(name).stem + "_accpress.json")
            out.write_text(json.dumps({
                "document_type": "PENDING_N8N",
                "source_file": name,
                "message": "Prototype output. Connect N8N_WEBHOOK_URL to run the real Accpress pipeline."
            }, ensure_ascii=False, indent=2), encoding="utf-8")
            result_files.append(out.name)
        job["status"] = "completed"
        job["result_files"] = result_files
        jobs = load_jobs()
        jobs[0] = job
        save_jobs(jobs)

    return jsonify(job)

@app.get("/api/jobs")
def api_jobs():
    return jsonify(load_jobs())

@app.get("/api/jobs/<job_id>")
def api_job(job_id):
    job = next((j for j in load_jobs() if j["id"] == job_id), None)
    if not job:
        return jsonify(error="ไม่พบงาน"), 404
    return jsonify(job)

@app.get("/api/jobs/<job_id>/download")
def download_job(job_id):
    job = next((j for j in load_jobs() if j["id"] == job_id), None)
    if not job:
        abort(404)
    result_dir = RESULT_DIR / job_id
    files = [f for f in job.get("result_files", []) if (result_dir / f).exists()]
    if not files:
        abort(404)
    if len(files) == 1:
        return send_from_directory(result_dir, files[0], as_attachment=True)
    zip_path = RESULT_DIR / f"{job_id}_results.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for f in files:
            z.write(result_dir / f, arcname=f)
    return send_file(zip_path, as_attachment=True, download_name=f"siamtak_{job_id}_results.zip")

@app.get("/health")
def health():
    return jsonify(status="ok", n8n_connected=bool(N8N_WEBHOOK_URL))

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8080"))
    app.run(host=host, port=port, debug=False)
