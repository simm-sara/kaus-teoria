// Progresso salvo no navegador (localStorage), com exportar e importar.

const KEY = 'kaus-teoria:v1';
const REVIEW_DAYS = [1, 3, 7, 14, 30, 60];

const empty = () => ({
  version: 1,
  els: {},
  xp: 0,
  streak: { count: 0, last: null },
  log: [],
  settings: { inst: 'ambos', volume: 0.7, free: false },
  exp: {},
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch (e) {
    /* sem armazenamento: segue com progresso vazio */
  }
  return empty();
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    /* ignora: navegador sem armazenamento */
  }
  listeners.forEach((fn) => fn(state));
}

export const onChange = (fn) => listeners.add(fn);
export const get = () => state;
export const settings = () => state.settings;

export function setSetting(k, v) {
  state.settings[k] = v;
  save();
}

export const today = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
};
const addDays = (iso, n) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return today(d);
};
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);

export function el(id) {
  if (!state.els[id]) state.els[id] = { v: 0, b: 0, box: 0, due: null };
  return state.els[id];
}

export function markSeen(id) {
  const e = el(id);
  let changed = false;
  if (e.v < 1) { e.v = 1; changed = true; }
  if (e.b < 1) { e.b = 1; changed = true; }
  if (changed) save();
}

function touchStreak() {
  const t = today();
  const s = state.streak;
  if (s.last === t) return;
  if (s.last && daysBetween(s.last, t) === 1) s.count += 1;
  else s.count = 1;
  s.last = t;
}

export function streak() {
  const s = state.streak;
  if (!s.last) return 0;
  const gap = daysBetween(s.last, today());
  return gap <= 1 ? s.count : 0;
}

// Resultado de uma sessão de exercícios de um elemento.
// which: quais instrumentos sobem de nível ('v', 'b' ou ambos).
export function recordSession(id, which, correct, total, { skipTest = false } = {}) {
  const e = el(id);
  const ratio = total ? correct / total : 0;
  const before = { v: e.v, b: e.b };
  for (const k of which) {
    if (skipTest) {
      if (ratio >= 0.9) e[k] = 3;
    } else if (ratio >= 0.9 && e[k] >= 2) e[k] = 3;
    else if (ratio >= 0.7) e[k] = Math.max(e[k], 2);
    else e[k] = Math.max(e[k], 1);
  }
  if (Math.max(e.v, e.b) >= 2 && !e.due) {
    e.box = 0;
    e.due = addDays(today(), REVIEW_DAYS[0]);
  }
  state.xp += correct * 10 + (ratio === 1 ? 20 : 0);
  touchStreak();
  state.log.push({ d: today(), id, c: correct, t: total });
  if (state.log.length > 400) state.log = state.log.slice(-400);
  save();
  return { before, after: { v: e.v, b: e.b }, ratio };
}

// Revisão espaçada: acertou sobe de caixa, errou volta para o começo.
export function recordReview(results) {
  let correct = 0;
  for (const [id, ok] of Object.entries(results)) {
    const e = el(id);
    if (ok.c >= ok.t) e.box = Math.min(e.box + 1, REVIEW_DAYS.length - 1);
    else e.box = 0;
    e.due = addDays(today(), REVIEW_DAYS[e.box]);
    correct += ok.c;
  }
  state.xp += correct * 10;
  touchStreak();
  state.log.push({ d: today(), id: 'treino', c: correct, t: Object.values(results).reduce((s, r) => s + r.t, 0) });
  save();
}

export function dueElements() {
  const t = today();
  return Object.entries(state.els)
    .filter(([, e]) => e.due && e.due <= t)
    .sort((a, b) => (a[1].due < b[1].due ? -1 : 1))
    .map(([id]) => id);
}

export function practicedElements() {
  return Object.entries(state.els).filter(([, e]) => Math.max(e.v, e.b) >= 2).map(([id]) => id);
}

export function completeExperiment(id, data) {
  state.exp[id] = { ...(state.exp[id] || {}), ...data, done: true, at: today() };
  const e = el(id);
  e.v = 3;
  e.b = 3;
  state.xp += 100;
  touchStreak();
  save();
}

export function saveExperiment(id, data) {
  state.exp[id] = { ...(state.exp[id] || {}), ...data };
  save();
}

export const experiment = (id) => state.exp[id] || {};

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || !data.els) throw new Error('Arquivo não reconhecido');
  state = { ...empty(), ...data };
  save();
}

export function reset() {
  state = empty();
  save();
}

export function sessionsToday() {
  const t = today();
  return state.log.filter((l) => l.d === t).length;
}
