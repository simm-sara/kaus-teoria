// Sessões de exercício: prática de um elemento, teste para pular e treino de revisão.

import { track } from '../track.js';
import { harpSVG } from '../ui/harp.js';
import { midiOf, noteName } from '../harp.js';
import * as P from '../progress.js';
import * as store from '../store.js';
import { pcAt, pcLabel, shuffle, INSTRUMENTS } from '../theory.js';
import { fretboardSVG } from '../ui/fretboard.js';
import { esc, playButton, playSpec, rhythmGrid, PLAY_ICON } from '../ui/blocks.js';

let S = null; // sessão atual

function newQuestion() {
  const i = S.i;
  const e = S.elements[i % S.elements.length];
  if (!S.queues[e.id] || !S.queues[e.id].length) S.queues[e.id] = shuffle(e.gens);
  const gen = S.queues[e.id].shift();
  S.instCounter[e.id] = (S.instCounter[e.id] ?? -1) + 1;
  const inst = P.instrumentFor(e, S.instCounter[e.id]);
  S.q = track().generate(gen, inst);
  S.q.el = e;
  S.answered = false;
  S.picked = null;
  S.selected = new Set();
  S.autoplayed = false;
}

export function start(mode, id) {
  let elements;
  let total = 8;
  if (mode === 'review') {
    const ids = store.dueElements();
    S = null;
    if (!ids.length) return false;
    elements = shuffle(ids.slice(0, 4).map(P.find).filter((e) => e && e.kind !== 'x'));
    if (!elements.length) return false;
    total = Math.min(10, Math.max(6, elements.length * 3));
  } else {
    const e = P.find(id);
    if (!e || e.kind === 'x') return false;
    elements = [e];
    total = mode === 'test' ? 10 : 8;
  }
  S = { mode, id, elements, total, i: 0, results: [], perEl: {}, queues: {}, instCounter: {}, done: false };
  newQuestion();
  return true;
}

export function reset() {
  S = null;
}

export const matches = (mode, id) => !!S && S.mode === mode && (mode === 'review' || S.id === id);

function dots() {
  return `<div class="dots" aria-label="Pergunta ${S.i + 1} de ${S.total}">${Array.from({ length: S.total }, (_, k) => {
    const cls = k < S.results.length ? (S.results[k] ? 'ok' : 'bad') : k === S.i ? 'now' : '';
    return `<i class="${cls}"></i>`;
  }).join('')}</div>`;
}

function fretHTML(q) {
  const marks = (q.marks || []).slice();
  let interactive = !S.answered;
  if (S.answered) {
    const validKeys = new Set(q.valid.map((p) => p.s + ':' + p.f));
    for (const p of q.valid) {
      if (!marks.some((m) => m.s === p.s && m.f === p.f)) marks.push({ ...p, label: pcLabel(pcAt(q.inst, p.s, p.f)).split('/')[0] });
    }
    const picks = q.mode === 'one' ? (S.picked ? [S.picked] : []) : [...S.selected].map((k) => ({ s: +k.split(':')[0], f: +k.split(':')[1] }));
    for (const p of picks) if (!validKeys.has(p.s + ':' + p.f)) marks.push({ ...p, wrong: true });
  }
  const region = q.mode === 'all' ? { fretMin: q.fretMin, fretMax: q.fretMax, strings: q.strings } : null;
  const svg = fretboardSVG({
    inst: q.inst, fretMax: Math.max(12, q.fretMax), marks, interactive, region,
    strings: q.mode === 'one' ? q.strings : null, fretMin: q.fretMin,
    selected: S.selected, title: 'Braço do ' + INSTRUMENTS[q.inst].name.toLowerCase() + ': clique nas casas para responder',
  });
  return `<div class="figure"><span class="label">${INSTRUMENTS[q.inst].name}</span><div class="fb-wrap" data-fret>${svg}</div></div>`;
}

const keyOf = (q, p) => (q.type === 'harp' ? p.h + ':' + p.d : p.s + ':' + p.f);
const fromKey = (q, k) => {
  const [a, b] = k.split(':');
  return q.type === 'harp' ? { h: +a, d: b } : { s: +a, f: +b };
};

function harpHTML(q) {
  const cells = (q.marks || []).slice();
  if (S.answered) {
    const valid = new Set(q.valid.map((p) => keyOf(q, p)));
    for (const p of q.valid) cells.push({ ...p, label: noteName(midiOf(p)) });
    const picks = q.mode === 'one' ? (S.picked ? [S.picked] : []) : [...S.selected].map((k) => fromKey(q, k));
    for (const p of picks) if (!valid.has(keyOf(q, p))) cells.push({ ...p, wrong: true });
  }
  const svg = harpSVG({ cells, interactive: !S.answered, holes: q.holes, selected: S.selected, title: 'Gaita: clique em soprar ou puxar no furo para responder' });
  return `<div class="figure"><span class="label">Gaita em Dó</span><div class="fb-wrap" data-harp>${svg}</div></div>`;
}

function questionHTML() {
  const q = S.q;
  const parts = [];
  if (q.show && q.show.harp) {
    parts.push(`<div class="figure"><span class="label">Gaita em Dó</span><div class="fb-wrap">${harpSVG({ cells: q.show.harp.cells, showNotes: q.show.harp.showNotes })}</div></div>`);
  }
  if (q.ref) {
    parts.push(`<div class="figure"><span class="label">${INSTRUMENTS[q.ref.inst].name} (referência)</span><div class="fb-wrap">${fretboardSVG({ inst: q.ref.inst, marks: q.ref.marks })}</div></div>`);
  }
  if (q.show && q.show.fret) {
    const f = q.show.fret;
    parts.push(`<div class="figure"><span class="label">${INSTRUMENTS[f.inst].name}</span><div class="fb-wrap">${fretboardSVG({ inst: f.inst, marks: f.marks })}</div></div>`);
  }
  if (q.audio) parts.push(`<div class="btn-row">${playButton(q.audio, 'Ouvir de novo')}<span class="caption" style="align-self:center">Espaço toca de novo</span></div>`);

  if (q.type === 'mc') {
    const opts = q.options.map((o, k) => {
      let cls = 'opt';
      if (S.answered) {
        if (k === q.answer) cls += ' right';
        else if (k === S.picked) cls += ' wrong';
      }
      const content = q.optionKind === 'rhythm' ? `<span style="flex:1">${rhythmGrid(o, { perBeat: 2, label: 'Opção ' + (k + 1) })}</span>` : `<span>${esc(o)}</span>`;
      return `<button type="button" class="${cls}" data-opt="${k}" ${S.answered ? 'disabled' : ''}><span class="k">${k + 1}</span>${content}</button>`;
    });
    parts.push(`<div class="options" role="group" aria-label="Opções">${opts.join('')}</div>`);
  } else {
    parts.push(q.type === 'harp' ? harpHTML(q) : fretHTML(q));
    if (q.mode === 'all' && !S.answered) {
      parts.push(`<div class="btn-row"><button type="button" class="btn" data-confirm>Confirmar <span class="kbd">Enter</span></button><span class="caption" style="align-self:center">${S.selected.size} marcada${S.selected.size === 1 ? '' : 's'}</span></div>`);
    }
  }

  if (S.answered) {
    const ok = S.results[S.results.length - 1];
    parts.push(`<div class="feedback" role="status">
      <span class="display verdict ${ok ? '' : 'bad'}">${ok ? 'Certo' : 'Não foi dessa vez'}</span>
      <p style="margin:0">${esc(q.explain)}</p>
      <div class="btn-row"><button type="button" class="btn" data-next autofocus>${S.i + 1 >= S.total ? 'Ver resultado' : 'Próxima'} <span class="kbd">Enter</span></button></div>
    </div>`);
  }
  return parts.join('');
}

function title() {
  if (S.mode === 'review') return 'Treino';
  const e = S.elements[0];
  return (S.mode === 'test' ? 'Teste · ' : '') + e.id + ' ' + e.name;
}

function resultHTML() {
  const c = S.results.filter(Boolean).length;
  const t = S.results.length;
  const pct = Math.round((c / t) * 100);
  let msg = '';
  let actions = '';
  if (S.mode === 'review') {
    msg = c === t ? 'Revisão completa sem erros. Os elementos voltam daqui a mais dias.' : 'O que você errou volta amanhã para o treino.';
    actions = `<a class="btn" href="#/">Voltar à trilha</a>`;
  } else {
    const e = S.elements[0];
    const r = S.outcome;
    const keys = Object.keys(r.after).filter((k) => r.after[k] > r.before[k]);
    const words = { v: 'violão', b: 'baixo' };
    if (keys.length) {
      msg = keys.map((k) => `${words[k]}: ${P.LEVEL_WORDS[r.before[k]]} → <b>${P.LEVEL_WORDS[r.after[k]]}</b>`).join(' · ');
    } else if (S.mode === 'test') {
      msg = 'Para pular é preciso 90% de acerto. Leia a lição e tente de novo, ou pratique normalmente.';
    } else {
      msg = pct >= 70 ? 'Nível mantido. Para dominar, faça uma sessão com 90% ou mais.' : 'Abaixo de 70%. Releia a lição e tente de novo.';
    }
    const nxt = P.current();
    actions = `<a class="btn" href="#/p/${e.id}" data-restart>Praticar de novo</a>
      ${nxt && nxt.id !== e.id ? `<a class="btn ghost" href="${nxt.kind === 'x' ? '#/x/' : '#/e/'}${nxt.id}">Próximo: ${nxt.id} ${esc(nxt.name)}</a>` : ''}
      <a class="btn ghost" href="#/">Trilha</a>`;
  }
  return `<div class="ex">
    <span class="label">${esc(title())}</span>
    <div class="display result-big">${c}/${t}</div>
    ${dots()}
    <p style="margin:0;font-size:15px">${msg}</p>
    <p class="caption" style="margin:0">+${c * 10 + (S.mode !== 'review' && c === t ? 20 : 0)} XP</p>
    <div class="btn-row">${actions}</div>
  </div>`;
}

export function render() {
  if (!S) return '';
  const body = S.done ? resultHTML() : `<div class="ex">
      <div class="ex-top"><span class="label">${esc(title())}</span>${dots()}<a href="#/" class="label">Sair</a></div>
      <p class="prompt">${esc(S.q.prompt)}</p>
      ${questionHTML()}
    </div>`;
  return `<main class="page narrow" id="conteudo">${body}</main>`;
}

function finish() {
  S.done = true;
  const c = S.results.filter(Boolean).length;
  const t = S.results.length;
  if (S.mode === 'review') {
    store.recordReview(S.perEl);
  } else {
    const e = S.elements[0];
    S.outcome = store.recordSession(e.id, P.trainedKeys(e), c, t, { skipTest: S.mode === 'test' });
  }
}

function record(ok) {
  S.results.push(ok);
  const id = S.q.el.id;
  S.perEl[id] = S.perEl[id] || { c: 0, t: 0 };
  S.perEl[id].t += 1;
  if (ok) S.perEl[id].c += 1;
  S.answered = true;
}

function answerMC(k, rerender) {
  if (S.answered) return;
  S.picked = k;
  record(k === S.q.answer);
  rerender();
}

function answerFret(s, f, rerender) {
  if (S.answered) return;
  const q = S.q;
  if (q.mode === 'one') {
    S.picked = { s, f };
    record(q.valid.some((p) => p.s === s && p.f === f));
  } else {
    const k = s + ':' + f;
    if (S.selected.has(k)) S.selected.delete(k); else S.selected.add(k);
  }
  rerender();
}

function answerHarp(h, d, rerender) {
  if (S.answered) return;
  const q = S.q;
  if (q.mode === 'one') {
    S.picked = { h, d };
    record(q.valid.some((p) => p.h === h && p.d === d));
  } else {
    const k = h + ':' + d;
    if (S.selected.has(k)) S.selected.delete(k); else S.selected.add(k);
  }
  rerender();
}

function confirmAll(rerender) {
  if (S.answered) return;
  const want = new Set(S.q.valid.map((p) => keyOf(S.q, p)));
  const ok = want.size === S.selected.size && [...want].every((k) => S.selected.has(k));
  record(ok);
  rerender();
}

function next(rerender) {
  if (!S.answered) return;
  S.i += 1;
  if (S.i >= S.total) finish();
  else newQuestion();
  rerender();
  window.scrollTo({ top: 0 });
}

export function bind(root, rerender) {
  if (!S) return;
  root.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => answerMC(+b.dataset.opt, rerender)));
  const fb = root.querySelector('[data-fret]');
  if (fb) {
    const act = (g) => answerFret(+g.dataset.s, +g.dataset.f, rerender);
    fb.addEventListener('click', (ev) => {
      const g = ev.target.closest('.fb-pos');
      if (g) act(g);
    });
    fb.addEventListener('keydown', (ev) => {
      const g = ev.target.closest('.fb-pos');
      if (g && (ev.key === 'Enter' || ev.key === ' ')) {
        ev.preventDefault();
        ev.stopPropagation();
        act(g);
        const again = root.querySelector(`.fb-pos[data-s="${g.dataset.s}"][data-f="${g.dataset.f}"]`);
        if (again) again.focus();
      }
    });
  }
  const hp = root.querySelector('[data-harp]');
  if (hp) {
    const act = (g) => answerHarp(+g.dataset.h, g.dataset.d, rerender);
    hp.addEventListener('click', (ev) => {
      const g = ev.target.closest('.hp-pos');
      if (g) act(g);
    });
    hp.addEventListener('keydown', (ev) => {
      const g = ev.target.closest('.hp-pos');
      if (g && (ev.key === 'Enter' || ev.key === ' ')) {
        ev.preventDefault();
        ev.stopPropagation();
        act(g);
        const again = root.querySelector(`.hp-pos[data-h="${g.dataset.h}"][data-d="${g.dataset.d}"]`);
        if (again) again.focus();
      }
    });
  }
  const c = root.querySelector('[data-confirm]');
  if (c) c.addEventListener('click', () => confirmAll(rerender));
  const n = root.querySelector('[data-next]');
  if (n) {
    n.addEventListener('click', () => next(rerender));
    n.focus({ preventScroll: true });
  }
  const restart = root.querySelector('[data-restart]');
  if (restart) restart.addEventListener('click', (ev) => {
    if (location.hash !== '#/p/' + S.id) return; // navegação normal reinicia a sessão
    ev.preventDefault();
    start('practice', S.id);
    rerender();
  });
  if (!S.done && S.q.audio && !S.autoplayed) {
    S.autoplayed = true;
    setTimeout(() => playSpec(S.q.audio), 250);
  }
}

export function onKey(ev, rerender) {
  if (!S || S.done) return;
  if (ev.target.closest && ev.target.closest('input, textarea, select')) return;
  if (ev.key === 'Enter') {
    if (ev.target.closest && ev.target.closest('.fb-pos, .hp-pos, button, a')) return;
    if (S.answered) next(rerender);
    else if ((S.q.type === 'fret' || S.q.type === 'harp') && S.q.mode === 'all') confirmAll(rerender);
    ev.preventDefault();
  } else if (ev.key === ' ' && S.q.audio) {
    if (ev.target.closest && ev.target.closest('.fb-pos, .hp-pos, button')) return;
    ev.preventDefault();
    playSpec(S.q.audio);
  } else if (/^[1-9]$/.test(ev.key) && S.q.type === 'mc' && !S.answered) {
    const k = Number(ev.key) - 1;
    if (k < S.q.options.length) answerMC(k, rerender);
  }
}

export { PLAY_ICON };
