// Braço do violão e do baixo em SVG, desenhado como prancha técnica.
// Os dois instrumentos usam a mesma geometria de casas, para ficarem alinhados.

import { INSTRUMENTS, pcAt, pcLabel, note, pc, intervalBetween, name } from '../theory.js';

const LABEL_W = 34;
const OPEN_W = 44;
const FRET_W = 54;
const STRING_H = 26;
const PAD_T = 22;
const PAD_B = 26;
const INLAYS = [3, 5, 7, 9, 15, 17];

const DEGREE = { '1J': '1', '2m': 'b2', '2M': '2', '3m': 'b3', '3M': '3', '4J': '4', '4A': '#4', '5d': 'b5', '5J': '5', '5A': '#5', '6m': 'b6', '6M': '6', '7d': '°7', '7m': 'b7', '7M': '7' };

export const fx = (f) => (f === 0 ? LABEL_W + OPEN_W / 2 : LABEL_W + OPEN_W + (f - 0.5) * FRET_W);
const fy = (s) => PAD_T + s * STRING_H;

export function width(fretMax) {
  return LABEL_W + OPEN_W + fretMax * FRET_W + 8;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// opts:
//   inst, fretMax=12
//   marks: [{s,f,label,accent,ghost,wrong}]
//   region: {fretMin, fretMax, strings}
//   interactive: true → posições clicáveis (data-s, data-f)
//   selected: Set de "s:f"
//   title: texto para leitores de tela
export function fretboardSVG(opts) {
  const inst = opts.inst;
  const strings = INSTRUMENTS[inst].strings;
  const labels = INSTRUMENTS[inst].labels;
  const fretMax = opts.fretMax ?? 12;
  const W = width(fretMax);
  const H = PAD_T + (strings.length - 1) * STRING_H + PAD_B;
  const out = [];
  out.push(`<svg class="fretboard" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.title || 'Braço do ' + INSTRUMENTS[inst].name.toLowerCase())}">`);

  // Área destacada (exercícios por região).
  if (opts.region) {
    const r = opts.region;
    const ss = r.strings || strings.map((_, i) => i);
    const x0 = r.fretMin === 0 ? LABEL_W + 2 : LABEL_W + OPEN_W + (r.fretMin - 1) * FRET_W;
    const x1 = LABEL_W + OPEN_W + r.fretMax * FRET_W;
    const y0 = fy(Math.min(...ss)) - STRING_H / 2;
    const y1 = fy(Math.max(...ss)) + STRING_H / 2;
    out.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="rgba(91,106,60,0.12)" stroke="#5B6A3C" stroke-width="1" stroke-dasharray="3 4"/>`);
  }

  // Marcações do braço.
  for (const f of INLAYS) {
    if (f > fretMax) continue;
    out.push(`<circle cx="${fx(f)}" cy="${PAD_T + ((strings.length - 1) * STRING_H) / 2}" r="4" fill="#CFC9BE"/>`);
  }
  if (fretMax >= 12) {
    const mid = PAD_T + ((strings.length - 1) * STRING_H) / 2;
    out.push(`<circle cx="${fx(12)}" cy="${mid - STRING_H * 0.9}" r="4" fill="#CFC9BE"/><circle cx="${fx(12)}" cy="${mid + STRING_H * 0.9}" r="4" fill="#CFC9BE"/>`);
  }

  // Trastes.
  const top = fy(0);
  const bottom = fy(strings.length - 1);
  out.push(`<rect x="${LABEL_W + OPEN_W - 4}" y="${top}" width="4" height="${bottom - top}" fill="#1A1A1A"/>`);
  for (let f = 1; f <= fretMax; f++) {
    const x = LABEL_W + OPEN_W + f * FRET_W;
    out.push(`<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="#1A1A1A" stroke-width="1"/>`);
  }

  // Cordas.
  strings.forEach((_, s) => {
    const w = inst === 'baixo' ? 1.6 + s * 0.5 : 0.8 + s * 0.35;
    out.push(`<line x1="${LABEL_W + 4}" y1="${fy(s)}" x2="${W - 8}" y2="${fy(s)}" stroke="#1A1A1A" stroke-width="${w}"/>`);
    out.push(`<text x="${LABEL_W - 10}" y="${fy(s) + 4}" text-anchor="end" font-size="11" font-weight="500" fill="#6B6760" font-family="Martian Mono, monospace">${labels[s]}</text>`);
  });

  // Números das casas (cotas).
  for (let f = 0; f <= fretMax; f++) {
    out.push(`<text x="${fx(f)}" y="${H - 6}" text-anchor="middle" font-size="9" fill="#5B6A3C" font-family="Martian Mono, monospace">${f}</text>`);
  }

  // Posições clicáveis.
  if (opts.interactive) {
    const reg = opts.region;
    strings.forEach((_, s) => {
      if (reg && reg.strings && !reg.strings.includes(s)) return;
      if (opts.strings && !opts.strings.includes(s)) return;
      const f0 = reg ? reg.fretMin : opts.fretMin || 0;
      const f1 = reg ? reg.fretMax : fretMax;
      for (let f = f0; f <= f1; f++) {
        const sel = opts.selected && opts.selected.has(s + ':' + f);
        out.push(`<g class="fb-pos" data-s="${s}" data-f="${f}" tabindex="0" role="button" aria-pressed="${sel ? 'true' : 'false'}" aria-label="Corda ${labels[s]}, casa ${f}">`);
        out.push(`<rect class="fb-hit" x="${fx(f) - (f === 0 ? OPEN_W / 2 - 2 : FRET_W / 2 - 2)}" y="${fy(s) - STRING_H / 2 + 1}" width="${f === 0 ? OPEN_W - 4 : FRET_W - 4}" height="${STRING_H - 2}" fill="transparent"/>`);
        if (sel) out.push(`<circle cx="${fx(f)}" cy="${fy(s)}" r="10" fill="#1A1A1A"/>`);
        out.push('</g>');
      }
    });
  }

  // Notas marcadas.
  for (const mk of opts.marks || []) {
    const x = fx(mk.f);
    const y = fy(mk.s);
    if (mk.ghost) {
      out.push(`<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="#5B6A3C" stroke-width="2" stroke-dasharray="3 3"/>`);
      continue;
    }
    const fill = mk.accent ? '#A8382A' : mk.wrong ? '#F2EFE8' : '#1A1A1A';
    const stroke = mk.wrong ? '#A8382A' : fill;
    const txt = mk.wrong ? '#A8382A' : '#F2EFE8';
    out.push(`<circle cx="${x}" cy="${y}" r="11" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`);
    if (mk.label) {
      const lbl = esc(mk.label);
      const fs = lbl.length > 3 ? 7 : lbl.length > 2 ? 8 : 10;
      out.push(`<text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="${fs}" font-weight="600" fill="${txt}" font-family="Martian Mono, monospace" pointer-events="none">${lbl}</text>`);
    } else if (mk.wrong) {
      out.push(`<path d="M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}" stroke="#A8382A" stroke-width="2"/>`);
    }
  }

  out.push('</svg>');
  return out.join('');
}

// Marcas para todas as posições de um conjunto de notas.
export function marksForNotes(inst, noteNames, { root = null, degrees = false, fretMax = 12 } = {}) {
  const ns = noteNames.map(note);
  const r = root ? note(root) : null;
  const byPc = new Map(ns.map((n) => [pc(n), n]));
  const out = [];
  INSTRUMENTS[inst].strings.forEach((_, s) => {
    for (let f = 0; f <= fretMax; f++) {
      const p = pcAt(inst, s, f);
      if (!byPc.has(p)) continue;
      const n = byPc.get(p);
      let label = name(n);
      if (degrees && r) label = DEGREE[intervalBetween(r, n)] || label;
      out.push({ s, f, label, accent: r && pc(r) === p });
    }
  });
  return out;
}

export function figure(inst, opts) {
  const title = inst === 'violao' ? 'Violão' : 'Baixo';
  return `<div class="figure"><span class="label">${title}</span><div class="fb-wrap">${fretboardSVG({ inst, ...opts })}</div></div>`;
}

export { pcLabel };
