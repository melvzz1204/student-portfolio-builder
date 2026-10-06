# Student Portfolio Builder — Frontend

Vite + React + React Router + Axios boilerplate, wired to the Express/JWT backend.

## Quick start

```bash
cd frontend
cp .env.example .env
npm install
npm run dev      # http://localhost:3000
```

Backend must run on `http://localhost:5000` (Vite proxies `/api` → there).
See `../backend/README.md`.

## Scripts

- `npm run dev` — Vite dev server (port 3000)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

## Structure

```
src/
  main.jsx                 # StrictMode + AuthProvider
  App.jsx                  # BrowserRouter + routes
  api/client.js            # axios instance, Bearer token + auto-refresh
  context/AuthContext.jsx  # user, login, register, logout
  components/Navbar.jsx, ProtectedRoute.jsx
  pages/Home.jsx Login.jsx Register.jsx Dashboard.jsx
```

## Auth flow

- `POST /api/auth/register` → stores `accessToken` in localStorage, refresh in httpOnly cookie
- `POST /api/auth/login` → same
- `GET /api/auth/me` → hydrates user on reload
- 401 responses try `POST /api/auth/refresh` once, then retry
- `/dashboard` is protected via `<ProtectedRoute />`

## Env

| Var | Default | Notes |
|-----|---------|-------|
| `VITE_API_URL` | `/api` | Dev uses Vite proxy; in prod set full backend URL e.g. `https://api.example.com/api` |
