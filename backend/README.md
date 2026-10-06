# Student Portfolio Builder — Backend

Express + Node.js + JWT + MongoDB (Mongoose) boilerplate.

## Quick start

```bash
cd backend
cp .env.example .env   # edit secrets + MONGO_URI
npm install
npm run dev
```

Server: `http://localhost:5000`
Health: `GET /api/health`

## Scripts

- `npm run dev` — nodemon `src/server.js`
- `npm start` — node `src/server.js`

## Auth API

| Method | Endpoint              | Auth | Body |
|--------|-----------------------|------|------|
| POST   | `/api/auth/register`  | No   | `{ name, email, password }` |
| POST   | `/api/auth/login`     | No   | `{ email, password }` |
| GET    | `/api/auth/me`        | Yes (Bearer) | — |
| POST   | `/api/auth/refresh`   | Refresh cookie | — |
| POST   | `/api/auth/logout`    | No   | — |
| GET    | `/api/users/profile`  | Yes (Bearer) | — |

Protected requests: `Authorization: Bearer <accessToken>`.

Refresh flow uses `httpOnly` cookie `refreshToken` (also accepts `refreshToken` in body).

## Structure

```
src/
  server.js          # DB connect + listen
  app.js             # express setup, cors, helmet, morgan, rate-limit, routes
  config/ env.js db.js
  models/ User.js
  controllers/ auth.controller.js
  routes/ auth.routes.js user.routes.js
  middleware/ auth.middleware.js validate.middleware.js error.middleware.js
  utils/ jwt.js asyncHandler.js ApiError.js
```

## Env vars

See `.env.example`. Set strong `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` in production.
