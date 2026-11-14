// Consulta rápida: braço, escalas, acordes, campo harmônico, ciclo de quintas e analisador.

import * as T from '../theory.js';
import * as store from '../store.js';
import { figure, marksForNotes } from '../ui/fretboard.js';
import { esc, playButton } from '../ui/blocks.js';
import { analyzerHTML, bindAnalyzer } from './analyzer.js';

const TABS = [
  ['braco', 'Braço'], ['escalas', 'Escalas'], ['acordes', 'Acordes'], ['campo', 'Campo harmônico'], ['ciclo', 'Ciclo de quintas'], ['analisador', 'Analisador'],
];
const ROOTS = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const state = { root: 'C', scale: 'maior', chord: '7M', fieldType: 'maior', tetrads: true, note: 'todas' };

const sel = (id, label, options, value) => `<div class="field"><label for="${id}">${label}</label><select id="${id}">${options.map(([v, l]) => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;

function instruments() {
  const i = store.settings().inst;
  return i === 'ambos' ? ['violao', 'baixo'] : [i];
}

function midiFor(n, base = 48) {
  return base + T.pc(n);
}
function ascending(ns, base = 48) {
  let prev = -1;
  return ns.map((n) => {
    let m = midiFor(n, base);
    while (m <= prev) m += 12;
    prev = m;
    return m;
  });
}

function braco() {
  const opts = [['todas', 'Todas as naturais'], ...T.CHROMATIC.map((n) => [T.name(n), T.pcLabel(T.pc(n))])];
  const notes = state.note === 'todas' ? T.LETTERS : [state.note];
  return `<div class="controls">${sel('rf-note', 'Nota', opts, state.note)}</div>
    ${instruments().map((i) => figure(i, { fretMax: 15, marks: marksForNotes(i, notes, { fretMax: 15 }) })).join('')}
    <p class="caption" style="margin:0">As cordas do baixo (E A D G) correspondem às 4 cordas graves do violão, uma oitava abaixo.</p>`;
}

function escalas() {
  const ns = T.scale(state.root, state.scale);
  const types = Object.entries(T.SCALES).filter(([k]) => k !== 'jonio' && k !== 'eolio').map(([k, v]) => [k, v.name]);
  const ivs = T.SCALES[state.scale].ivs.map((k) => (k === '1J' ? 'tônica' : T.INTERVALS[k].name)).join(' · ');
  return `<div class="controls">${sel('rf-root', 'Tônica', ROOTS.map((r) => [r, r]), state.root)}${sel('rf-scale', 'Escala', types, state.scale)}</div>
    <div><span class="label">${esc(state.root + ' ' + T.SCALES[state.scale].name)}</span><div class="notes-line">${ns.map(T.name).join('  ')}</div><p class="caption" style="margin:4px 0 0">${esc(ivs)}</p></div>
    ${playButton({ kind: 'seq', notes: ascending(ns.concat([ns[0]])) }, 'Ouvir')}
    ${instruments().map((i) => figure(i, { fretMax: 15, marks: marksForNotes(i, ns.map(T.name), { root: state.root, fretMax: 15 }) })).join('')}`;
}

function acordes() {
  const types = Object.entries(T.CHORDS).map(([k, v]) => [k, (k || '(maior)') + ' — ' + v.name]);
  const ns = T.chordNotes(state.root, state.chord);
  const ivs = T.CHORDS[state.chord].ivs.map((k) => (k === '1J' ? 'tônica' : T.INTERVALS[k].name)).join(' · ');
  return `<div class="controls">${sel('rf-root', 'Tônica', ROOTS.map((r) => [r, r]), state.root)}${sel('rf-chord', 'Tipo', types, state.chord)}</div>
    <div><span class="label">${esc(state.root + state.chord)}</span><div class="notes-line">${ns.map(T.name).join('  ')}</div><p class="caption" style="margin:4px 0 0">${esc(ivs)}</p></div>
    <div class="btn-row">${playButton({ kind: 'chord', notes: ascending(ns) }, 'Ouvir acorde')}${playButton({ kind: 'seq', notes: ascending(ns) }, 'Ouvir arpejo')}</div>
    ${instruments().map((i) => figure(i, { fretMax: 15, marks: marksForNotes(i, ns.map(T.name), { root: state.root, degrees: true, fretMax: 15 }) })).join('')}`;
}

function campo() {
  const types = [['maior', 'Maior'], ['menor', 'Menor natural'], ['harmonica', 'Menor harmônica'], ['melodica', 'Menor melódica']];
  const f = T.harmonicField(state.root, state.fieldType, state.tetrads);
  const fns = state.fieldType === 'maior' ? T.MAJOR_FUNCTIONS : null;
  return `<div class="controls">${sel('rf-root', 'Tom', ROOTS.map((r) => [r, r]), state.root)}${sel('rf-field', 'Escala', types, state.fieldType)}${sel('rf-tet', 'Acordes', [['1', 'Tétrades'], ['0', 'Tríades']], state.tetrads ? '1' : '0')}</div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Grau</th>${f.map((d) => `<th>${esc(d.roman)}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><td>Acorde</td>${f.map((d) => `<td><b>${esc(d.symbol)}</b></td>`).join('')}</tr>
        <tr><td>Notas</td>${f.map((d) => `<td>${T.chordNotes(d.root, d.quality.replace('+7M', '+').replace('+7', '+')).map(T.name).join(' ')}</td>`).join('')}</tr>
        ${fns ? `<tr><td>Função</td>${fns.map((x) => `<td>${x}</td>`).join('')}</tr>` : ''}
        <tr><td>Ouvir</td>${f.map((d) => {
          const q = d.quality in T.CHORDS ? d.quality : d.quality.startsWith('+') ? '+' : '';
          return `<td>${playButton({ kind: 'chord', notes: ascending(T.chordNotes(d.root, q)) }, '')}</td>`;
        }).join('')}</tr>
      </tbody>
    </table></div>
    ${fns ? '<p class="caption" style="margin:0">T = tônica (repouso) · SD = subdominante (afastamento) · D = dominante (tensão)</p>' : ''}`;
}

function ciclo() {
  const rows = T.CIRCLE.map((k) => {
    const sig = T.keySignature(k);
    return [k, sig.count ? sig.count + sig.type : '—', T.name(T.relativeMinor(k)) + 'm', T.scale(k).map(T.name).join(' ')];
  });
  return `<p style="margin:0">Sentido horário: cada tom fica uma 5ª acima do anterior e ganha um sustenido (ou perde um bemol).</p>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tom maior</th><th>Armadura</th><th>Relativa menor</th><th>Escala</th></tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td>${i === 0 ? '<b>' + esc(c) + '</b>' : esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function render(tab = 'braco') {
  if (!TABS.some(([k]) => k === tab)) tab = 'braco';
  const body = { braco, escalas, acordes, campo, ciclo, analisador: () => analyzerHTML(store.get().settings.lastChords || '') }[tab]();
  return `<main class="page" id="conteudo">
    <div class="page-head"><h1 class="display page-title">Consulta</h1></div>
    <nav class="tabs" aria-label="Seções da consulta">${TABS.map(([k, l]) => `<a href="#/consulta/${k}" ${k === tab ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
    <section style="display:flex;flex-direction:column;gap:20px">${body}</section>
  </main>`;
}

export function bind(root, rerender) {
  const on = (id, fn) => {
    const el = root.querySelector('#' + id);
    if (el) el.addEventListener('change', () => { fn(el.value); rerender(); });
  };
  on('rf-note', (v) => (state.note = v));
  on('rf-root', (v) => (state.root = v));
  on('rf-scale', (v) => (state.scale = v));
  on('rf-chord', (v) => (state.chord = v));
  on('rf-field', (v) => (state.fieldType = v));
  on('rf-tet', (v) => (state.tetrads = v === '1'));
  bindAnalyzer(root, (v) => store.setSetting('lastChords', v));
}
