// Gaita diatônica em SVG: 10 furos, fileira de cima = soprar, de baixo = puxar.

import { BLOW, DRAW, noteName } from '../harp.js';

const LABEL_W = 64;
const CELL_W = 56;
const ROW_H = 40;
const COMB_H = 34;
const PAD = 8;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cx = (h) => LABEL_W + (h - 0.5) * CELL_W;
const rowY = (d) => (d === 'b' ? PAD + ROW_H / 2 : PAD + ROW_H + COMB_H + ROW_H / 2);

// opts:
//   cells: [{h, d, label, accent, ghost, wrong}]  marcas
//   showNotes: mostra o nome da nota em todas as casas (cinza)
//   holes: [min, max] furos ativos (os outros ficam apagados)
//   interactive, selected (Set "h:d")
//   title
export function harpSVG(opts = {}) {
  const W = LABEL_W + 10 * CELL_W + PAD;
  const H = PAD * 2 + ROW_H * 2 + COMB_H;
  const [hMin, hMax] = opts.holes || [1, 10];
  const out = [];
  out.push(`<svg class="harp" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.title || 'Gaita diatônica em Dó, furos 1 a 10')}">`);

  // Faixa ativa.
  if (opts.holes) {
    const x0 = LABEL_W + (hMin - 1) * CELL_W;
    out.push(`<rect x="${x0}" y="${PAD - 4}" width="${(hMax - hMin + 1) * CELL_W}" height="${ROW_H * 2 + COMB_H + 8}" fill="rgba(91,106,60,0.12)" stroke="#5B6A3C" stroke-dasharray="3 4"/>`);
  }

  // Rótulos das fileiras.
  out.push(`<text x="${LABEL_W - 12}" y="${rowY('b') + 4}" text-anchor="end" font-size="10" font-weight="500" fill="#6B6760" font-family="Martian Mono, monospace">SOPRA</text>`);
  out.push(`<text x="${LABEL_W - 12}" y="${rowY('d') + 4}" text-anchor="end" font-size="10" font-weight="500" fill="#6B6760" font-family="Martian Mono, monospace">PUXA</text>`);

  // Pente (corpo da gaita) com os números dos furos.
  const combY = PAD + ROW_H;
  out.push(`<rect x="${LABEL_W}" y="${combY}" width="${10 * CELL_W}" height="${COMB_H}" fill="#1A1A1A"/>`);
  for (let h = 1; h <= 10; h++) {
    const x = cx(h);
    out.push(`<rect x="${x - 13}" y="${combY + 7}" width="26" height="${COMB_H - 14}" fill="#F2EFE8"/>`);
    out.push(`<text x="${x}" y="${combY + COMB_H / 2 + 4}" text-anchor="middle" font-size="11" font-weight="600" fill="#1A1A1A" font-family="Martian Mono, monospace">${h}</text>`);
  }
  // Grade das fileiras.
  for (const d of ['b', 'd']) {
    const y0 = rowY(d) - ROW_H / 2;
    out.push(`<rect x="${LABEL_W}" y="${y0}" width="${10 * CELL_W}" height="${ROW_H}" fill="none" stroke="#1A1A1A" stroke-width="1"/>`);
    for (let h = 1; h < 10; h++) {
      const x = LABEL_W + h * CELL_W;
      out.push(`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + ROW_H}" stroke="#CFC9BE" stroke-width="1"/>`);
    }
  }

  // Nomes das notas (fundo).
  if (opts.showNotes) {
    for (let h = 1; h <= 10; h++) {
      for (const d of ['b', 'd']) {
        if (opts.cells && opts.cells.some((c) => c.h === h && c.d === d && !c.ghost)) continue;
        const m = (d === 'b' ? BLOW : DRAW)[h - 1];
        const dim = h < hMin || h > hMax;
        out.push(`<text x="${cx(h)}" y="${rowY(d) + 4}" text-anchor="middle" font-size="12" fill="${dim ? '#CFC9BE' : '#6B6760'}" font-family="Martian Mono, monospace">${noteName(m)}</text>`);
      }
    }
  }

  // Casas clicáveis.
  if (opts.interactive) {
    for (let h = hMin; h <= hMax; h++) {
      for (const d of ['b', 'd']) {
        const sel = opts.selected && opts.selected.has(h + ':' + d);
        out.push(`<g class="hp-pos" data-h="${h}" data-d="${d}" tabindex="0" role="button" aria-pressed="${sel ? 'true' : 'false'}" aria-label="${d === 'b' ? 'Soprar' : 'Puxar'} o furo ${h}">`);
        out.push(`<rect class="hp-hit" x="${cx(h) - CELL_W / 2 + 2}" y="${rowY(d) - ROW_H / 2 + 2}" width="${CELL_W - 4}" height="${ROW_H - 4}" fill="transparent"/>`);
        if (sel) out.push(`<circle cx="${cx(h)}" cy="${rowY(d)}" r="13" fill="#1A1A1A"/>`);
        out.push('</g>');
      }
    }
  }

  // Marcas.
  for (const c of opts.cells || []) {
    const x = cx(c.h);
    const y = rowY(c.d);
    if (c.ghost) {
      out.push(`<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#5B6A3C" stroke-width="2" stroke-dasharray="3 3"/>`);
      continue;
    }
    const fill = c.accent ? '#A8382A' : c.wrong ? '#F2EFE8' : '#1A1A1A';
    const stroke = c.wrong ? '#A8382A' : fill;
    const txt = c.wrong ? '#A8382A' : '#F2EFE8';
    out.push(`<circle cx="${x}" cy="${y}" r="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`);
    if (c.label) {
      const l = esc(c.label);
      out.push(`<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="${l.length > 2 ? 9 : 11}" font-weight="600" fill="${txt}" font-family="Martian Mono, monospace" pointer-events="none">${l}</text>`);
    } else if (c.wrong) {
      out.push(`<path d="M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}" stroke="#A8382A" stroke-width="2"/>`);
    }
  }
  out.push('</svg>');
  return out.join('');
}

export function harpFigure(opts, label = 'Gaita em Dó') {
  return `<div class="figure"><span class="label">${esc(label)}</span><div class="fb-wrap">${harpSVG(opts)}</div></div>`;
}

// Marca as casas de uma lista de tablaturas ("4", "-4"...).
export function cellsFromTabs(tabs, { label = 'note', accentFirst = false } = {}) {
  return tabs.map((t, i) => {
    const d = t.startsWith('-') ? 'd' : 'b';
    const h = Number(t.replace(/[-']/g, ''));
    const m = (d === 'b' ? BLOW : DRAW)[h - 1];
    return { h, d, label: label === 'tab' ? t : label === 'order' ? String(i + 1) : noteName(m), accent: accentFirst && i === 0 };
  });
}
