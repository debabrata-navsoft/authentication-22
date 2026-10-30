# CLAUDE.md

Full-stack authentication app: login, signup, logout, forgot password, reset password.

## Structure

- `backend/` — Node.js + Express 5 + MongoDB (Mongoose 9), ES modules (`"type": "module"`)
- `frontend/` — Angular 22 app (standalone components, signals, Signal Forms), SSR setup but all routes use `RenderMode.Client`

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

## Frontend

### Commands (run in `frontend/`)

- `npm start` — dev server on http://localhost:4200 (backend must allow it via `CLIENT_URL`)
- `npm run build` — production build
- `npx ng test --watch=false` — unit tests (Vitest)
- Format with Prettier (`.prettierrc`: single quotes, width 100)

### Layout (`src/app/`)

- `../environments/environment.ts` — `apiUrl` (default `http://localhost:5000/api`)
- `core/services/auth.service.ts` — `@Service()`; API calls + session state as signals (`token`, `user`, `isLoggedIn`), persisted to `localStorage` (browser only)
- `core/interceptors/auth-interceptor.ts` — adds `Authorization: Bearer`; on 401 clears the session and redirects to `/login`
- `core/guards/auth-guard.ts` — `authGuard` (logged in only), `guestGuard` (logged out only)
- `shared/schemas/auth.schema.ts` — Signal Forms schemas for every form (`loginSchema`, `signupSchema`, `forgotPasswordSchema`, `resetPasswordSchema`); validation rules mirror the backend
- `shared/components/input-field/` — `<app-input-field [field]="form.x">` binds a `FieldTree<string>` via `[formField]`, shows the first error message once touched, show/hide toggle for passwords
- `shared/utils/http-error.ts` — `getErrorMessage()` extracts the backend's `{ message }`
- `pages/` — `login`, `signup`, `forgot-password`, `reset-password/:token` (token bound as a component input via `withComponentInputBinding`), `dashboard`

### Conventions

- Forms use Signal Forms (`@angular/forms/signals`): `form(modelSignal, schema)` + `submit(form, { action, onInvalid })`. Don't use Reactive Forms.
- Every validator in a schema sets a user-facing `message`; `InputField` displays it as-is.
- Icons: `@lucide/angular` (not `lucide-angular`, which doesn't support Angular 22). All icons are listed in `shared/data/icons.data.ts` (`APP_ICONS`) and registered once with `provideLucideIcons(...APP_ICONS)` in `app.config.ts`. Use them by kebab-case name: `<svg lucideIcon="log-in" size="18"></svg>`, importing only `LucideDynamicIcon` in the component; `InputField` takes a name too (`icon="mail"`). Add new icons to `APP_ICONS` first, or the app fails with "Unable to resolve icon". Specs that render icons need `provideLucideIcons(...APP_ICONS)` in their providers.
- Global styles and CSS variables (`--primary`, `--danger`, ...) live in `src/styles.css`; auth pages share the `.auth-page` / `.auth-card` / `.btn` / `.alert` classes.
