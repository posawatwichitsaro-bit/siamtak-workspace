# Siamtak Workspace — Web App Prototype

ศูนย์กลาง Web App สำหรับงานภายในบริษัท ตาม requirement ที่กำหนด

## Run บนเครื่อง
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
เปิด `http://localhost:8080`

## ให้เครื่องอื่นใน LAN เข้า
แอป bind ที่ `0.0.0.0:8080` อยู่แล้ว เช่น
`http://SERVER-IP:8080`

อย่าลืมเปิด Windows/Linux firewall port 8080 ตามนโยบาย IT

## ต่อ n8n จริง
ตั้ง environment variable:
`N8N_WEBHOOK_URL=http://<n8n-server>/webhook/<your-webhook>`

จุดเชื่อมต่อจริงอยู่ใน `POST /api/accpress/upload` และสามารถต่อ payload/file handling เข้ากับ workflow n8n ที่มีอยู่ได้

## Docker
```bash
docker build -t siamtak-workspace .
docker run --rm -p 8080:8080 siamtak-workspace
```

> Prototype นี้มี upload, job tracking และ download/ZIP จริงแล้ว ส่วน AI/OCR เป็น placeholder จนกว่าจะต่อ n8n workflow จริง
