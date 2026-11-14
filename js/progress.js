// Regras de progresso: níveis por instrumento, desbloqueio e o "próximo" elemento.

import { ELEMENTS, NON_EXP, inPeriod, usesInstrument, byId } from './content.js';
import * as store from './store.js';

export const STATE_LABEL = { dom: 'dominado', cur: 'próximo', open: 'disponível', lock: 'bloqueado' };
export const LEVEL_WORDS = ['nada ainda', 'vista', 'praticada', 'dominada'];

const raw = (id) => store.get().els[id] || { v: 0, b: 0 };

// Nível exibido conforme o instrumento selecionado.
export function level(e, inst = store.settings().inst) {
  const r = raw(e.id);
  if (e.kind === 'v') return r.v;
  if (e.kind === 'b') return r.b;
  if (!usesInstrument(e)) return Math.max(r.v, r.b);
  if (inst === 'violao') return r.v;
  if (inst === 'baixo') return r.b;
  return Math.min(r.v, r.b);
}

// Melhor nível em qualquer instrumento (para desbloquear).
export function best(e) {
  const r = raw(e.id);
  if (e.kind === 'v') return r.v;
  if (e.kind === 'b') return r.b;
  return Math.max(r.v, r.b);
}

export function unlocked(e) {
  if (store.settings().free) return true;
  if (best(e) >= 2) return true;
  if (e.kind === 'x') return inPeriod(e.period).filter((x) => x.kind !== 'x').every((x) => best(x) >= 2);
  const i = NON_EXP.indexOf(e);
  if (i <= 0) return true;
  return best(NON_EXP[i - 1]) >= 2;
}

export function current() {
  for (const e of ELEMENTS) {
    if (e.kind === 'x') continue;
    if (unlocked(e) && best(e) < 2) return e;
  }
  for (const e of ELEMENTS) if (e.kind === 'x' && unlocked(e) && best(e) < 3) return e;
  return null;
}

export function status(e) {
  const cur = current();
  if (cur && cur.id === e.id) return 'cur';
  if (!unlocked(e)) return 'lock';
  if (level(e) >= 3) return 'dom';
  return 'open';
}

export function dominatedCount() {
  return NON_EXP.filter((e) => level(e) >= 3).length;
}

// Quais níveis sobem numa sessão desse elemento, no modo escolhido.
export function trainedKeys(e, inst = store.settings().inst) {
  if (e.kind === 'v') return ['v'];
  if (e.kind === 'b') return ['b'];
  if (!usesInstrument(e)) return ['v', 'b'];
  if (inst === 'violao') return ['v'];
  if (inst === 'baixo') return ['b'];
  return ['v', 'b'];
}

// Instrumento de cada pergunta numa sessão.
export function instrumentFor(e, i, inst = store.settings().inst) {
  if (e.kind === 'v') return 'violao';
  if (e.kind === 'b' || e.kind === 'p') return 'baixo';
  if (inst === 'violao' || inst === 'baixo') return inst;
  return i % 2 === 0 ? 'violao' : 'baixo';
}

export function periodOpen(n) {
  return inPeriod(n).some((e) => unlocked(e));
}

export const find = (id) => byId[id];
