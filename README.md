# TaskFlow — Frontend Take-Home

> React 18 + TypeScript · Vite · Redux Toolkit · dnd-kit · Tailwind CSS

A Jira-inspired task management UI built for the Greening India Foundation frontend take-home. Polished, production-ready, and designed to feel like a real SaaS product.

---

## 1. Overview

**TaskFlow** lets users register, log in, create projects, and manage tasks on a drag-and-drop Kanban board. Built as a **frontend-only** submission targeting the mock API at `http://localhost:4000`.

| Layer | Choice | Why |
|---|---|---|
| Bundler | Vite 5 | Fast HMR, native ESM, excellent TS support |
| UI framework | React 18 + TypeScript (strict) | Type safety end-to-end |
| Routing | React Router v6 | Outlet-based layouts, declarative protected routes |
| State | Redux Toolkit | Predictable slice pattern, built-in thunk, great DevTools |
| Drag & drop | dnd-kit | Accessible, pointer-sensor DnD with overlay support |
| Styling | Tailwind CSS (no component library) | Full control over every pixel, no overrides needed |
| HTTP | Axios | Interceptors for token injection and global 401 redirect |
| Dates | date-fns | Tree-shakeable, lightweight |

---

## 2. Architecture Decisions

### Component structure
Split by **domain** (`tasks/`, `projects/`, `layout/`, `ui/`), not by type (containers vs presentational). This mirrors how engineers work on features. All components stay under ~200 lines — larger concerns are split (e.g. `KanbanBoard` → `KanbanColumn` → `TaskCard`).

### State management
One Redux slice per domain: `authSlice`, `projectSlice`, `taskSlice`, `uiSlice`. API data lives in the store, not local component state. Pages fetch on mount; components read from the store. Toast notifications in `uiSlice` avoid prop-drilling a notification system.

### Optimistic UI for drag
Drag-and-drop status changes update Redux immediately, then fire `PATCH /tasks/:id`. On failure, the previous status is restored and an error toast shown.

### Auth persistence
JWT + user object stored in `localStorage`, loaded into Redux on startup — survives page refresh with no loading flash.

### Intentional omissions (time-boxed)
- WebSockets / real-time (no backend contract)
- Pagination (not in mock spec)
- Unit tests
- Multi-user assignee roster (no `/members` endpoint in spec)

---

## 3. Running Locally

### Repo structure

```
taskflow-[name]/
├── frontend/          ← React app (Vite + TypeScript)
│   ├── src/
│   ├── Dockerfile
│   └── ...
├── mock-server.mjs    ← Node.js mock API (no dependencies)
├── docker-compose.yml ← Spins up both services
├── .env.example       ← Copy to .env before running
└── README.md
```

---

### Option A — Docker (recommended, zero manual steps)

Requires Docker Desktop. No Node installation needed.

```bash
git clone https://github.com/your-name/taskflow-[name]
cd taskflow-[name]

cp .env.example .env          # defaults are fine as-is

docker compose up --build
```

- Frontend → [http://localhost:3000](http://localhost:3000)
- Mock API → [http://localhost:4000](http://localhost:4000)

To reset seed data, stop the containers and delete `mock-db.json`, then `docker compose up` again.

---

### Option B — Local dev (Node required)

```bash
git clone https://github.com/your-name/taskflow-[name]
cd taskflow-[name]

# Terminal 1 — start mock API
node mock-server.mjs
# API at http://localhost:4000

# Terminal 2 — start frontend dev server
cd frontend
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:4000
npm install
npm run dev
# App at http://localhost:3000
```

---

## 4. Running Migrations

Not applicable — this is a **frontend-only** submission. There is no database or migration tooling. The mock API server (`mock-server.mjs`) seeds its in-memory data store on first run automatically.

To reset the mock data, delete `mock-db.json` (created in the project root on first run) and restart the server.

---

## 5. Test Credentials

```
Email:    test@example.com
Password: password123
```

---

## 6. Project Structure

```
taskflow-[name]/
├── frontend/
│   ├── src/
│   │   ├─ api/           # Axios client + per-domain modules (auth, projects, tasks, users)
│   │   ├─ components/
│   │   │   ├─ ui/        # Button, Input, Textarea, Select, Modal, Badge, Toast, Skeleton, EmptyState, Avatar
│   │   │   ├─ layout/    # Navbar, AppLayout
│   │   │   ├─ tasks/     # KanbanBoard, KanbanColumn, TaskCard, TaskModal, TaskFilters
│   │   │   └─ projects/  # ProjectCard, ProjectModal
│   │   ├─ hooks/         # useAuth, useToast, useAppDispatch
│   │   ├─ pages/         # LoginPage, RegisterPage, ProjectsPage, ProjectDetailPage
│   │   ├─ routes/        # Router config, ProtectedRoute, PublicOnlyRoute
│   │   ├─ store/         # Redux slices: auth, project, task, ui
│   │   ├─ types/         # Shared TypeScript interfaces
│   │   └─ utils/         # date helpers, localStorage helpers
│   ├─ Dockerfile         # Multi-stage: node build → nginx runtime
│   └─ nginx.conf         # SPA routing + gzip + security headers
├── mock-server.mjs        # Node.js mock REST API (no dependencies, seeds mock-db.json)
├── docker-compose.yml     # Orchestrates frontend + mock-api
├── .env.example           # Copy to .env — all vars documented with defaults
└── README.md
```

---

## 7. API Reference

Base URL: `http://localhost:4000` — matches the mock spec in the assignment brief.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register → `{ token, user }` |
| POST | `/auth/login` | Login → `{ token, user }` |
| GET | `/projects` | List projects |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Project detail + embedded tasks |
| PATCH | `/projects/:id` | Update name/description |
| DELETE | `/projects/:id` | Delete project |
| GET | `/projects/:id/tasks` | List tasks (`?status=` `?assignee=`) |
| POST | `/projects/:id/tasks` | Create task |
| PATCH | `/tasks/:id` | Update status, priority, assignee, due date |
| DELETE | `/tasks/:id` | Delete task |

All protected endpoints require `Authorization: Bearer <token>`. 401 responses auto-redirect to `/login`.

---

## 8. Features

- **Auth**: Login / Register with client-side validation + API error display
- **Projects list**: Responsive grid, empty state, create-project modal
- **Kanban board**: Drag-and-drop across Todo / In Progress / Done columns
- **Optimistic drag**: Status updates instantly on drop; reverts on API error
- **Task modal**: Create & edit — title, description, priority, status, due date, self-assign
- **Assignee filter**: Filter tasks by All / Me / Unassigned
- **Loading skeletons**: Shimmer placeholders while data loads (no blank screens)
- **Dark mode**: Navbar toggle, persisted across sessions
- **Toasts**: Success/error notifications for every create/update/delete
- **Responsive**: Kanban scrolls horizontally on mobile (375px); full board on desktop (1280px)

---

## 9. What I'd Do With More Time

- **Tests**: React Testing Library for components, store thunk tests
- **Pagination**: Infinite scroll on projects list and task columns
- **Real-time**: WebSocket for live task updates across users
- **Assignee roster**: `GET /projects/:id/members` endpoint to assign tasks to teammates
- **Global search**: Debounced task/project search
- **Keyboard shortcuts**: `N` to create, `E` to edit focused task, `Esc` to close
- **Within-column reorder**: Sort tasks by drag within a column, persisted to the API
