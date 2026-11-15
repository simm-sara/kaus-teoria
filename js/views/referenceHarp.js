// Consulta da trilha de gaita: mapa de notas, músicas, acordes e bends.

import * as H from '../harp.js';
import { harpFigure, cellsFromTabs } from '../ui/harp.js';
import { esc, playButton, tabHTML } from '../ui/blocks.js';

const TABS = [['mapa', 'Mapa da gaita'], ['musicas', 'Músicas'], ['acordes', 'Acordes'], ['bends', 'Bends'], ['tablatura', 'Como ler']];

function mapa() {
  const rows = (dir) => Array.from({ length: 10 }, (_, i) => {
    const m = (dir === 'b' ? H.BLOW : H.DRAW)[i];
    return `${H.noteName(m)}`;
  });
  return `${harpFigure({ showNotes: true })}
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Furo</th>${Array.from({ length: 10 }, (_, i) => `<th>${i + 1}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><td>Soprar</td>${rows('b').map((n, i) => `<td>${n} ${playButton({ kind: 'seq', notes: [H.BLOW[i]], reed: true }, '')}</td>`).join('')}</tr>
        <tr><td>Puxar</td>${rows('d').map((n, i) => `<td>${n} ${playButton({ kind: 'seq', notes: [H.DRAW[i]], reed: true }, '')}</td>`).join('')}</tr>
      </tbody>
    </table></div>
    ${tabHTML(H.MIDDLE_SCALE.join(' '), 'Escala de Dó (furos 4 a 7)')}
    <p class="caption" style="margin:0">C = Dó · D = Ré · E = Mi · F = Fá · G = Sol · A = Lá · B = Si</p>`;
}

function musicas() {
  return H.SONGS.map((s) => `<section style="display:flex;flex-direction:column;gap:8px">
      <h2 class="display h3">${esc(s.name)}</h2>
      <span class="caption">${esc(s.origin)}</span>
      ${tabHTML(s.tab)}
    </section>`).join('<hr class="rule">');
}

function acordes() {
  return H.CHORDS.map((c) => `<section style="display:flex;flex-direction:column;gap:8px">
      <h2 class="display h3">${esc(c.name)} · ${esc(c.desc)}</h2>
      ${harpFigure({ cells: cellsFromTabs(c.tabs) }, c.notes)}
      ${playButton({ kind: 'chord', notes: c.tabs.map(H.tabToMidi), reed: true }, 'Ouvir')}
    </section>`).join('');
}

function bends() {
  const rows = [];
  for (const [h, n] of Object.entries(H.DRAW_BENDS)) {
    const base = H.DRAW[h - 1];
    rows.push([`-${h}`, H.noteName(base), Array.from({ length: n }, (_, i) => `-${h}${"'".repeat(i + 1)} = ${H.noteName(base - i - 1)}`).join(' · ')]);
  }
  for (const [h, n] of Object.entries(H.BLOW_BENDS)) {
    const base = H.BLOW[h - 1];
    rows.push([`${h}`, H.noteName(base), Array.from({ length: n }, (_, i) => `${h}${"'".repeat(i + 1)} = ${H.noteName(base - i - 1)}`).join(' · ')]);
  }
  return `<p style="margin:0">O bend abaixa a nota sem trocar de furo. Cada apóstrofo (') na tablatura é meio tom abaixo.</p>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Furo</th><th>Nota normal</th><th>Com bend</th></tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function tablatura() {
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Escrito</th><th>O que fazer</th></tr></thead><tbody>
    <tr><td>4</td><td>soprar o furo 4</td></tr>
    <tr><td>-4</td><td>puxar o furo 4</td></tr>
    <tr><td>6:2</td><td>soprar o furo 6 durante 2 tempos</td></tr>
    <tr><td>-4'</td><td>puxar o furo 4 com bend de meio tom</td></tr>
    <tr><td>|</td><td>separa as frases (ou compassos)</td></tr>
    <tr><td>+4 / ↑4 / ↓4</td><td>outras formas de escrever soprar (+, ↑) e puxar (↓) que aparecem na internet</td></tr>
  </tbody></table></div>`;
}

export function render(tab = 'mapa') {
  if (!TABS.some(([k]) => k === tab)) tab = 'mapa';
  const body = { mapa, musicas, acordes, bends, tablatura }[tab]();
  return `<main class="page" id="conteudo">
    <div class="page-head"><h1 class="display page-title">Consulta</h1></div>
    <nav class="tabs" aria-label="Seções da consulta">${TABS.map(([k, l]) => `<a href="#/consulta/${k}" ${k === tab ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
    <section style="display:flex;flex-direction:column;gap:20px">${body}</section>
  </main>`;
}

export function bind() {}
