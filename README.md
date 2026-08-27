# Siamtak Workspace

Internal web app hub for company employees.

## Features in this prototype

- Central Hub with expandable Hamburger menu
- Work modules architecture
- Invoice / billing document extraction module
- PDF / PNG / JPG upload
- Multi-file upload
- n8n webhook integration
- Demo mode when n8n is not configured
- Download one processed file or ZIP multiple files
- PostgreSQL connection support
- Health / system status endpoint
- LAN-ready server (`0.0.0.0`)
- Siamtak AI shortcut

## Run

```bash
npm install
copy .env.example .env
npm start
```

Linux/macOS:

```bash
cp .env.example .env
npm install
npm start
```

Open:

`http://SERVER_IP:8080`

## n8n contract

Set:

`N8N_WEBHOOK_URL=http://<n8n-server>/webhook/siamtak-accpress`

The app sends multipart/form-data with field:

`files`

and metadata fields:

`jobType=accpress`
`jobName=Invoice / Billing Extraction`

The n8n workflow can return:
- one file directly, or
- a ZIP file directly, or
- JSON containing a `files` array with `{name, contentBase64, mimeType}`.

The prototype also accepts JSON with a single `{name, contentBase64, mimeType}`.

For production, replace the demo fallback with the real n8n workflow and add authentication / authorization.
