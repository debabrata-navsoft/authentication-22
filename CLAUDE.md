# CLAUDE.md

Full-stack authentication app: login, signup, logout, forgot password, reset password.

## Structure

- `backend/` — Node.js + Express 5 + MongoDB (Mongoose 9), ES modules (`"type": "module"`)
- `frontend/` — Angular app with SSR (still mostly scaffolding; `core/services/auth.service.ts` is empty)

## Backend

### Commands (run in `backend/`)

- `npm run dev` — start with nodemon
- `npm start` — start with node
- Copy `.env.example` to `.env` and fill in values before starting (`.env` is git-ignored)

### Layout

- `server.js` — app setup, CORS (`CLIENT_URL`), mounts `/api/auth`, 404 + error handlers
- `config/db.js` — Mongo connection (`MONGO_URI`)
- `models/user.model.js` — User schema; password hashing in a `pre("save")` hook, `comparePassword`, `createPasswordResetToken`
- `controllers/auth.controller.js` — route handlers
- `routes/auth.route.js` — route definitions
- `middleware/auth.middleware.js` — `protect`: checks the `Authorization: Bearer <jwt>` header
- `middleware/error.middleware.js` — `notFound`, `errorHandler` (handles Mongoose validation + duplicate key)
- `utils/` — `generateToken` (JWT), `sendEmail` (nodemailer SMTP)

File naming: `<name>.<kind>.js` (e.g. `auth.controller.js`, `user.model.js`).

### API (`/api/auth`)

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/signup` | – | `name, email, phone, password, confirmPassword` |
| POST | `/login` | – | `email, password` |
| POST | `/logout` | Bearer | – |
| GET | `/me` | Bearer | – |
| POST | `/forgot-password` | – | `email` |
| POST | `/reset-password/:token` | – | `password, confirmPassword` |

`phone` is unique and must be 10–15 digits with an optional leading `+`. Signup and login return `{ message, token, user }`. Errors are always `{ message }`.

### Auth design notes

- JWTs are stateless, but the payload includes `tokenVersion`. `protect` rejects a token whose version doesn't match the user's. Logout and password reset increment `tokenVersion`, which invalidates **all** of that user's existing tokens.
- Reset tokens: a random 32-byte hex token is emailed as `${CLIENT_URL}/reset-password/<token>`. Only its SHA-256 hash is stored, and it expires after 15 minutes.
- `forgot-password` returns the same message whether or not the email exists, so it doesn't reveal which emails are registered.
- Sensitive fields (`password`, `tokenVersion`, reset fields) are `select: false` and removed in `toJSON`.
- Express 5 forwards errors thrown in async handlers to the error middleware, so controllers don't need try/catch.
- Mongoose 9: `pre` hooks are `async` functions without `next`.
