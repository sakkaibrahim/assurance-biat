# XAMPP Setup

This project uses FastAPI for the backend and React for the frontend.
XAMPP can serve the built React app, but it cannot run FastAPI itself.

## What XAMPP is used for here

- Serve the React production build through Apache.
- Handle SPA routing with `.htaccess`.
- Keep the Python backend running separately with Uvicorn.

## Local setup

1. Build the frontend:

```bash
cd frontend
npm install
npm run build
```

2. Copy `frontend/dist` to your XAMPP `htdocs` folder, or point a virtual host to `frontend/dist`.

3. Start the backend separately:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Apache virtual host example

See [httpd-vhosts.conf.example](httpd-vhosts.conf.example).
