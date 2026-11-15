// Peças de interface reaproveitadas: blocos de lição, botões de som, grade de ritmo.

import * as audio from '../audio.js';
import { figure, marksForNotes } from './fretboard.js';
import { harpFigure, cellsFromTabs } from './harp.js';
import { parseSeq } from '../harp.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const PLAY_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>';

// Toca uma especificação de som. Devolve a duração aproximada.
export function playSpec(spec) {
  if (!spec) return 0;
  const reed = !!spec.reed;
  switch (spec.kind) {
    case 'note': return reed ? (audio.playReed(spec.notes[0], 0, 1.2), 1.4) : (audio.playNote(spec.notes[0]), 1.5);
    case 'seq': return audio.playSequence(spec.notes, spec.gap || 0.55, reed);
    case 'chord': return audio.playChord(spec.notes, 0.035, reed);
    case 'chords': {
      spec.chords.forEach((c, i) => setTimeout(() => audio.playChord(c, 0.035, reed), i * 1100));
      return spec.chords.length * 1.1 + 1.5;
    }
    case 'interval': return audio.playInterval(spec.notes[0], spec.notes[1], reed);
    case 'tab': return audio.playTimed(spec.seq, { reed: spec.reed !== false });
    case 'train': return audio.playTrain([60, 64, 67], [62, 67, 71, 74]);
    case 'vibrato': audio.playReed(spec.notes[0], 0, 2.6, 0.5, { vibrato: true }); return 2.8;
    case 'rhythm': return audio.playRhythm(spec.steps.concat(spec.steps), { perBeat: spec.perBeat || 2, bpm: 84 });
    case 'meter': return playMeter(spec.beats || 4, spec.bars || 2);
    default: return 0;
  }
}

function playMeter(beats, bars) {
  // Nota aguda e forte no tempo 1, mais fraca nos outros tempos.
  const total = beats * bars;
  const bpm = 100;
  const beat = 60 / bpm;
  for (let i = 0; i < total; i++) {
    const accent = i % beats === 0;
    audio.playNote(accent ? 76 : 69, i * beat, 0.25, accent ? 0.9 : 0.35);
  }
  return total * beat + 0.5;
}

let registry = new Map();
let nextId = 1;
export function resetPlayers() {
  registry = new Map();
}
export function registerPlay(spec) {
  const id = 'p' + nextId++;
  registry.set(id, spec);
  return id;
}
export function playButton(spec, label) {
  const id = registerPlay(spec);
  return `<button type="button" class="play" data-play="${id}">${PLAY_ICON}<span>${esc(label)}</span></button>`;
}
export function handlePlayClick(target) {
  const btn = target.closest('[data-play]');
  if (!btn) return false;
  playSpec(registry.get(btn.dataset.play));
  return true;
}

export function rhythmGrid(steps, { perBeat = 2, label = '' } = {}) {
  const beats = [];
  steps.forEach((_, i) => {
    beats.push(`<span class="beat" style="grid-column:${i + 1}">${i % perBeat === 0 ? i / perBeat + 1 : ''}</span>`);
  });
  const cells = steps.map((on, i) => `<span class="cell${on ? ' on' : ''}" style="grid-column:${i + 1}"></span>`);
  const desc = steps.map((on, i) => (on ? (i % perBeat === 0 ? String(i / perBeat + 1) : 'e') : '·')).join(' ');
  return `<div class="rgrid" role="img" aria-label="${esc(label || 'Padrão rítmico')}: ${desc}">${beats.join('')}${cells.join('')}</div>`;
}

export function lessonHTML(blocks, inst) {
  return blocks.map((b) => {
    const [type, v] = b;
    switch (type) {
      case 'p': return `<p>${v}</p>`;
      case 'h': return `<h3 class="display h3">${esc(v)}</h3>`;
      case 'list': return `<ul>${v.map((x) => `<li>${x}</li>`).join('')}</ul>`;
      case 'tip': return `<div class="tip">${v}</div>`;
      case 'table':
        return `<div class="tbl-wrap"><table class="tbl">${v.head ? `<thead><tr>${v.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : ''}<tbody>${v.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'play': return playButton(v, v.label);
      case 'rhythm':
        return `<div class="figure"><span class="label">${esc(v.label)}</span>${rhythmGrid(v.steps, v)}${playButton({ kind: 'rhythm', steps: v.steps, perBeat: v.perBeat }, 'Ouvir')}</div>`;
      case 'fret': {
        let which = v.inst === 'both' ? ['violao', 'baixo'] : [v.inst];
        if (v.inst === 'both' && inst !== 'ambos') which = [inst];
        const fretMax = v.fretMax ?? 12;
        return which.map((i) => figure(i, { fretMax, marks: marksForNotes(i, v.notes, { root: v.root, degrees: v.degrees, fretMax }) })).join('');
      }
      case 'harp': {
        const cells = v.tabs ? cellsFromTabs(v.tabs, { label: v.label || 'note' }).map((c) => ({ ...c, accent: !!v.accent })) : v.cells || [];
        return harpFigure({ cells, showNotes: !!v.showNotes, holes: v.holes });
      }
      case 'tab': return tabHTML(v.seq, v.label);
      default: return '';
    }
  }).join('');
}

// Tablatura com botão de ouvir: "4 4 6 6 -6 -6 6:2 | ..."
export function tabHTML(seqText, label) {
  const seq = parseSeq(seqText);
  const chips = seq.map((x) => {
    if (x.bar) return '<span class="tab-bar" aria-hidden="true">|</span>';
    if (x.rest) return '<span class="tab-tok rest">pausa</span>';
    const long = x.dur > 1 ? ` long` : '';
    return `<span class="tab-tok${x.dir === 'd' ? ' draw' : ''}${long}" title="${x.dir === 'd' ? 'puxar' : 'soprar'} o furo ${x.hole}${x.dur !== 1 ? ', ' + x.dur + ' tempos' : ''}">${esc(x.tab)}${x.dur !== 1 ? `<small>${x.dur}</small>` : ''}</span>`;
  }).join('');
  const notes = seq.filter((x) => x.midi).map((x) => ({ midi: x.midi, dur: x.dur }));
  return `<div class="figure">${label ? `<span class="label">${esc(label)}</span>` : ''}<div class="tab-line">${chips}</div>${playButton({ kind: 'tab', seq: notes, reed: true }, 'Ouvir')}</div>`;
}
