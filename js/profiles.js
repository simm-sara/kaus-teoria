// Perfis: quem está estudando. Cada perfil tem a sua trilha e o seu progresso.

const META_KEY = 'musikaus:perfis';
const CURRENT_KEY = 'musikaus:perfil-atual';

export const PROFILES = [
  // A chave antiga é mantida para não perder o progresso já salvo de violão e baixo.
  { id: 'cordas', track: 'cordas', storageKey: 'kaus-teoria:v1', defaultName: 'Violão e baixo' },
  { id: 'gaita', track: 'gaita', storageKey: 'musikaus:gaita:v1', defaultName: 'Stella' },
];

function readMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

export function nameOf(p) {
  const m = readMeta();
  return (m[p.id] && m[p.id].name) || p.defaultName;
}

export function rename(id, name) {
  const m = readMeta();
  m[id] = { ...(m[id] || {}), name: name.trim().slice(0, 30) };
  try {
    localStorage.setItem(META_KEY, JSON.stringify(m));
  } catch (e) {
    /* sem armazenamento */
  }
}

export const find = (id) => PROFILES.find((p) => p.id === id);

export function currentId() {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch (e) {
    return null;
  }
}

export function setCurrent(id) {
  try {
    localStorage.setItem(CURRENT_KEY, id);
  } catch (e) {
    /* sem armazenamento */
  }
}

// Lê o progresso de um perfil sem ativá-lo (para a tela inicial).
export function peek(p) {
  try {
    return JSON.parse(localStorage.getItem(p.storageKey) || 'null');
  } catch (e) {
    return null;
  }
}
