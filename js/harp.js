// Harmônica diatônica de 10 furos em Dó (afinação Richter).
// Tablatura: "4" = soprar o furo 4, "-4" = puxar o furo 4,
// "-3'" = puxar com bend de meio tom, "-3''" = bend de um tom.

export const KEY = 'C';

// MIDI de cada furo (índice 0 = furo 1).
export const BLOW = [60, 64, 67, 72, 76, 79, 84, 88, 91, 96];
export const DRAW = [62, 67, 71, 74, 77, 81, 83, 86, 89, 93];

// Bends possíveis (semitons abaixo da nota natural).
export const DRAW_BENDS = { 1: 1, 2: 2, 3: 3, 4: 1, 6: 1 };
export const BLOW_BENDS = { 8: 1, 9: 1, 10: 2 };

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SOLF = { C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si' };

export const noteName = (midi, flats = true) => (flats ? FLAT : SHARP)[midi % 12];
export const octave = (midi) => Math.floor(midi / 12) - 1;
export const solfege = (midi) => {
  const n = noteName(midi);
  return SOLF[n[0]] + n.slice(1).replace('b', '♭');
};

// "-4" → { hole: 4, dir: 'd', bend: 0 }
export function parseTab(tok) {
  const m = /^(-?)(10|[1-9])('{0,3})$/.exec(String(tok).trim());
  if (!m) return null;
  return { hole: Number(m[2]), dir: m[1] ? 'd' : 'b', bend: m[3].length };
}

export function tabToMidi(tok) {
  const t = typeof tok === 'string' ? parseTab(tok) : tok;
  if (!t) return null;
  const base = (t.dir === 'b' ? BLOW : DRAW)[t.hole - 1];
  const max = (t.dir === 'b' ? BLOW_BENDS : DRAW_BENDS)[t.hole] || 0;
  if (t.bend > max) return null;
  return base - t.bend;
}

export const tabOf = (hole, dir, bend = 0) => (dir === 'd' ? '-' : '') + hole + "'".repeat(bend);

// Uma sequência de tablatura com durações opcionais: "4 4 6 6 -6 -6 6:2".
export function parseSeq(text) {
  return text.trim().split(/\s+/).map((tok) => {
    if (tok === '|') return { bar: true };
    if (tok === '_') return { rest: true, dur: 1 };
    const [t, d] = tok.split(':');
    const p = parseTab(t);
    if (!p) return { error: tok };
    return { ...p, tab: t, midi: tabToMidi(p), dur: d ? Number(d) : 1 };
  });
}

// Todas as posições (sem bend) que dão uma classe de nota.
export function cellsFor(pcOrName) {
  const pc = typeof pcOrName === 'number' ? pcOrName : FLAT.indexOf(pcOrName) >= 0 ? FLAT.indexOf(pcOrName) : SHARP.indexOf(pcOrName);
  const out = [];
  for (let h = 1; h <= 10; h++) {
    if (BLOW[h - 1] % 12 === pc) out.push({ h, d: 'b' });
    if (DRAW[h - 1] % 12 === pc) out.push({ h, d: 'd' });
  }
  return out;
}

export const midiOf = (cell) => (cell.d === 'b' ? BLOW : DRAW)[cell.h - 1];

// Escala de Dó completa na oitava do meio (furos 4 a 7).
export const MIDDLE_SCALE = ['4', '-4', '5', '-5', '6', '-6', '-7', '7'];

// Acordes que a gaita dá "de graça".
export const CHORDS = [
  { tabs: ['1', '2', '3'], name: 'C', notes: 'C E G', desc: 'soprar os furos 1, 2 e 3' },
  { tabs: ['-1', '-2', '-3', '-4'], name: 'G', notes: 'D G B D', desc: 'puxar os furos 1 a 4' },
  { tabs: ['-4', '-5', '-6'], name: 'Dm', notes: 'D F A', desc: 'puxar os furos 4, 5 e 6' },
  { tabs: ['4', '5', '6'], name: 'C', notes: 'C E G', desc: 'soprar os furos 4, 5 e 6' },
];

// Músicas de domínio público, na gaita em Dó.
export const SONGS = [
  {
    id: 'estrelinha', name: 'Brilha, brilha, estrelinha', origin: 'melodia tradicional francesa',
    tab: '4 4 6 6 -6 -6 6:2 | -5 -5 5 5 -4 -4 4:2 | 6 6 -5 -5 5 5 -4:2 | 6 6 -5 -5 5 5 -4:2 | 4 4 6 6 -6 -6 6:2 | -5 -5 5 5 -4 -4 4:2',
    notes: 'C C G G A A G F F E E D D C G G F F E E D G G F F E E D C C G G A A G F F E E D D C',
  },
  {
    id: 'carneirinho', name: 'Mary had a little lamb', origin: 'canção infantil americana',
    tab: '5 -4 4 -4 5 5 5:2 | -4 -4 -4:2 5 6 6:2 | 5 -4 4 -4 5 5 5 5 | -4 -4 5 -4 4:4',
    notes: 'E D C D E E E D D D E G G E D C D E E E E D D E D C',
  },
  {
    id: 'ode', name: 'Ode à Alegria', origin: 'Beethoven, 9ª Sinfonia',
    tab: '5 5 -5 6 6 -5 5 -4 | 4 4 -4 5 5:1.5 -4:0.5 -4:2 | 5 5 -5 6 6 -5 5 -4 | 4 4 -4 5 -4:1.5 4:0.5 4:2',
    notes: 'E E F G G F E D C C D E E D D E E F G G F E D C C D E D C C',
  },
  {
    id: 'santos', name: 'When the saints go marching in', origin: 'spiritual tradicional',
    tab: '4 5 -5 6:4 | 4 5 -5 6:4 | 4 5 -5 6:2 5:2 4:2 5:2 -4:4',
    notes: 'C E F G C E F G C E F G E C E D',
  },
  {
    id: 'parabens', name: 'Parabéns a você', origin: 'melodia de domínio público',
    tab: '6:0.75 6:0.25 -6 6 7 -7:2 | 6:0.75 6:0.25 -6 6 -8 7:2 | 6:0.75 6:0.25 9 8 7 -7 -6:2 | -9:0.75 -9:0.25 8 7 -8 7:2',
    notes: 'G G A G C B G G A G D C G G G E C B A F F E C D C',
  },
];
