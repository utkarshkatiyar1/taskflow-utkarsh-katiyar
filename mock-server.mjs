/**
 * TaskFlow Mock API Server
 * Run with: node mock-server.mjs
 * Serves a full REST API at http://localhost:4000
 * Data is persisted to mock-db.json so it survives restarts.
 */

import http from 'http';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'mock-db.json');

// ─── Seed data (used only when no mock-db.json exists) ────────────────────────

const SEED = {
  users: [
    { id: 'seed-user-1', name: 'Test User',    email: 'test@example.com',  _password: 'password123', created_at: '2026-01-01T00:00:00Z' },
    { id: 'seed-user-2', name: 'Priya Sharma', email: 'priya@example.com', _password: 'password123', created_at: '2026-01-02T00:00:00Z' },
    { id: 'seed-user-3', name: 'Arjun Mehta',  email: 'arjun@example.com', _password: 'password123', created_at: '2026-01-03T00:00:00Z' },
  ],
  projects: [
    { id: 'seed-project-1', name: 'Website Redesign', description: 'Q2 redesign — new homepage, nav, and mobile layout.', owner_id: 'seed-user-1', created_at: '2026-01-10T00:00:00Z' },
    { id: 'seed-project-2', name: 'Mobile App v2',    description: 'iOS and Android refresh for the spring release.',    owner_id: 'seed-user-1', created_at: '2026-02-01T00:00:00Z' },
  ],
  tasks: [
    { id: 'seed-task-1', title: 'Design new homepage hero',        description: 'Create wireframes and high-fidelity mockups for the hero section.',        status: 'todo',        priority: 'high',   project_id: 'seed-project-1', assignee_id: 'seed-user-1', due_date: '2026-05-01',  created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
    { id: 'seed-task-2', title: 'Implement responsive navigation',  description: 'Mobile-first nav with hamburger menu and smooth transitions.',               status: 'in_progress', priority: 'medium', project_id: 'seed-project-1', assignee_id: 'seed-user-2', due_date: null,          created_at: '2026-01-16T00:00:00Z', updated_at: '2026-01-18T00:00:00Z' },
    { id: 'seed-task-3', title: 'Update all npm dependencies',      description: 'Upgrade packages to latest stable versions and resolve any breaking changes.', status: 'done',        priority: 'low',    project_id: 'seed-project-1', assignee_id: 'seed-user-1', due_date: '2026-01-20', created_at: '2026-01-17T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 'seed-task-4', title: 'Set up push notifications',        description: 'Integrate Firebase Cloud Messaging for iOS and Android.',                    status: 'todo',        priority: 'high',   project_id: 'seed-project-2', assignee_id: 'seed-user-1', due_date: '2026-05-15', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-10T00:00:00Z' },
    { id: 'seed-task-5', title: 'Write unit tests for auth flow',   description: null,                                                                          status: 'in_progress', priority: 'medium', project_id: 'seed-project-2', assignee_id: 'seed-user-3', due_date: null,          created_at: '2026-02-12T00:00:00Z', updated_at: '2026-02-12T00:00:00Z' },
  ],
};

// ─── Persistent DB ────────────────────────────────────────────────────────────

function loadDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    // Validate shape
    if (parsed.users && parsed.projects && parsed.tasks) return parsed;
  } catch {
    // File doesn't exist or is corrupt — start fresh from seed
  }
  return JSON.parse(JSON.stringify(SEED)); // deep clone
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('⚠ Could not persist db:', e.message);
  }
}

const db = loadDb();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createToken = (userId) => Buffer.from(userId).toString('base64url');

const getUserFromToken = (authHeader) => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const userId = Buffer.from(authHeader.slice(7), 'base64url').toString('utf8');
    return db.users.find((u) => u.id === userId) ?? null;
  } catch {
    return null;
  }
};

const uuid = () => crypto.randomUUID();
const now  = () => new Date().toISOString();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function reply(res, status, data) {
  const body = status === 204 ? '' : JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(body);
}

async function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
    });
  });
}

function safeUser(u) {
  const { _password: _, ...rest } = u;
  return rest;
}

// ─── Router ───────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, 'http://localhost:4000');
  const path   = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // ── POST /auth/register ──────────────────────────────────────────────────
  if (method === 'POST' && path === '/auth/register') {
    const { name, email, password } = await readBody(req);
    const fields = {};
    if (!name?.trim())  fields.name     = 'required';
    if (!email?.trim()) fields.email    = 'required';
    if (!password)      fields.password = 'required';
    if (Object.keys(fields).length) return reply(res, 400, { error: 'validation failed', fields });

    const normalEmail = email.trim().toLowerCase();
    if (db.users.find((u) => u.email.toLowerCase() === normalEmail)) {
      return reply(res, 400, { error: 'validation failed', fields: { email: 'already in use' } });
    }
    const user = { id: uuid(), name: name.trim(), email: normalEmail, _password: password, created_at: now() };
    db.users.push(user);
    saveDb();
    return reply(res, 201, { token: createToken(user.id), user: safeUser(user) });
  }

  // ── POST /auth/login ─────────────────────────────────────────────────────
  if (method === 'POST' && path === '/auth/login') {
    const { email, password } = await readBody(req);
    const normalEmail = email?.trim().toLowerCase() ?? '';
    const user = db.users.find((u) => u.email.toLowerCase() === normalEmail && u._password === password);
    if (!user) return reply(res, 401, { error: 'invalid email or password' });
    return reply(res, 200, { token: createToken(user.id), user: safeUser(user) });
  }

  // ── Auth guard ───────────────────────────────────────────────────────────
  const currentUser = getUserFromToken(req.headers['authorization']);
  if (!currentUser) return reply(res, 401, { error: 'unauthorized' });

  // ── GET /users ───────────────────────────────────────────────────────────
  if (method === 'GET' && path === '/users') {
    return reply(res, 200, { users: db.users.map(safeUser) });
  }

  // ── GET /projects ────────────────────────────────────────────────────────
  if (method === 'GET' && path === '/projects') {
    const projects = db.projects.filter(
      (p) => p.owner_id === currentUser.id ||
             db.tasks.some((t) => t.project_id === p.id && t.assignee_id === currentUser.id),
    );
    return reply(res, 200, { projects });
  }

  // ── POST /projects ───────────────────────────────────────────────────────
  if (method === 'POST' && path === '/projects') {
    const { name, description } = await readBody(req);
    if (!name?.trim()) return reply(res, 400, { error: 'validation failed', fields: { name: 'required' } });
    const project = { id: uuid(), name: name.trim(), description: description?.trim() || null, owner_id: currentUser.id, created_at: now() };
    db.projects.push(project);
    saveDb();
    return reply(res, 201, project);
  }

  // ── /projects/:id ────────────────────────────────────────────────────────
  const projectMatch = path.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const project = db.projects.find((p) => p.id === projectMatch[1]);
    if (!project) return reply(res, 404, { error: 'not found' });

    if (method === 'GET') {
      return reply(res, 200, { ...project, tasks: db.tasks.filter((t) => t.project_id === project.id) });
    }
    if (method === 'PATCH') {
      if (project.owner_id !== currentUser.id) return reply(res, 403, { error: 'forbidden' });
      const { name, description } = await readBody(req);
      if (name !== undefined) project.name = name.trim();
      if (description !== undefined) project.description = description?.trim() || null;
      saveDb();
      return reply(res, 200, project);
    }
    if (method === 'DELETE') {
      if (project.owner_id !== currentUser.id) return reply(res, 403, { error: 'forbidden' });
      db.tasks    = db.tasks.filter((t) => t.project_id !== project.id);
      db.projects = db.projects.filter((p) => p.id !== project.id);
      saveDb();
      return reply(res, 204);
    }
  }

  // ── /projects/:id/tasks ──────────────────────────────────────────────────
  const projectTasksMatch = path.match(/^\/projects\/([^/]+)\/tasks$/);
  if (projectTasksMatch) {
    const project = db.projects.find((p) => p.id === projectTasksMatch[1]);
    if (!project) return reply(res, 404, { error: 'not found' });

    if (method === 'GET') {
      let tasks = db.tasks.filter((t) => t.project_id === project.id);
      const status   = url.searchParams.get('status');
      const assignee = url.searchParams.get('assignee');
      if (status)   tasks = tasks.filter((t) => t.status === status);
      if (assignee) tasks = tasks.filter((t) => t.assignee_id === assignee);
      return reply(res, 200, { tasks });
    }
    if (method === 'POST') {
      const { title, description, priority, assignee_id, due_date } = await readBody(req);
      if (!title?.trim()) return reply(res, 400, { error: 'validation failed', fields: { title: 'required' } });
      const ts   = now();
      const task = { id: uuid(), title: title.trim(), description: description?.trim() || null, status: 'todo', priority: priority || 'medium', project_id: project.id, assignee_id: assignee_id || null, due_date: due_date || null, created_at: ts, updated_at: ts };
      db.tasks.push(task);
      saveDb();
      return reply(res, 201, task);
    }
  }

  // ── /tasks/:id ───────────────────────────────────────────────────────────
  const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
  if (taskMatch) {
    const task = db.tasks.find((t) => t.id === taskMatch[1]);
    if (!task) return reply(res, 404, { error: 'not found' });

    if (method === 'PATCH') {
      const updates = await readBody(req);
      const allowed = ['title', 'description', 'status', 'priority', 'assignee_id', 'due_date'];
      for (const key of allowed) {
        if (key in updates) task[key] = updates[key];
      }
      task.updated_at = now();
      saveDb();
      return reply(res, 200, task);
    }
    if (method === 'DELETE') {
      db.tasks = db.tasks.filter((t) => t.id !== task.id);
      saveDb();
      return reply(res, 204);
    }
  }

  return reply(res, 404, { error: 'not found' });
});

server.listen(4000, () => {
  const fresh = !fs.existsSync(DB_FILE) || db === SEED;
  console.log('\n✅ TaskFlow Mock API  →  http://localhost:4000');
  console.log('─────────────────────────────────────────────');
  console.log('   Test accounts:');
  console.log('     test@example.com  / password123');
  console.log('     priya@example.com / password123');
  console.log('     arjun@example.com / password123');
  console.log(`   DB: ${fs.existsSync(DB_FILE) ? `loaded from mock-db.json (${db.users.length} users, ${db.projects.length} projects, ${db.tasks.length} tasks)` : 'fresh seed'}`);
  console.log('─────────────────────────────────────────────\n');
});
