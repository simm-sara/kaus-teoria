// Motor de teoria musical: notas escritas corretamente (com letra e acidente),
// intervalos, escalas, acordes, campos harmônicos, cifras e braço dos instrumentos.

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const SOLFEGE = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];
const NAT = [0, 2, 4, 5, 7, 9, 11];

// ── Notas ───────────────────────────────────────────────

export function note(name) {
  if (typeof name === 'object') return name;
  const m = /^([A-G])(#{1,2}|b{1,2})?$/.exec(name.trim());
  if (!m) throw new Error('Nota inválida: ' + name);
  const l = LETTERS.indexOf(m[1]);
  const acc = m[2] ? (m[2][0] === '#' ? m[2].length : -m[2].length) : 0;
  return { l, a: acc };
}

export const pc = (n) => (((NAT[n.l] + n.a) % 12) + 12) % 12;

export function name(n) {
  return LETTERS[n.l] + (n.a > 0 ? '#'.repeat(n.a) : 'b'.repeat(-n.a));
}

export const solfege = (n) => SOLFEGE[n.l] + (n.a > 0 ? '#'.repeat(n.a) : 'b'.repeat(-n.a));

export const sameNote = (x, y) => x.l === y.l && x.a === y.a;

// Nomes padrão para cada classe de altura (usados no braço).
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const pcName = (p, flats = false) => (flats ? FLAT_NAMES : SHARP_NAMES)[((p % 12) + 12) % 12];
export const pcLabel = (p) => {
  const s = SHARP_NAMES[((p % 12) + 12) % 12];
  const f = FLAT_NAMES[((p % 12) + 12) % 12];
  return s === f ? s : s + '/' + f;
};

export const NATURALS = LETTERS.map((l) => note(l));
export const CHROMATIC = SHARP_NAMES.map(note);

// ── Intervalos ──────────────────────────────────────────
// steps = distância entre letras (0 a 7), semis = semitons.

export const INTERVALS = {
  '1J': { steps: 0, semis: 0, name: 'uníssono' },
  '2m': { steps: 1, semis: 1, name: '2ª menor' },
  '2M': { steps: 1, semis: 2, name: '2ª maior' },
  '3m': { steps: 2, semis: 3, name: '3ª menor' },
  '3M': { steps: 2, semis: 4, name: '3ª maior' },
  '4J': { steps: 3, semis: 5, name: '4ª justa' },
  '4A': { steps: 3, semis: 6, name: '4ª aumentada' },
  '5d': { steps: 4, semis: 6, name: '5ª diminuta' },
  '5J': { steps: 4, semis: 7, name: '5ª justa' },
  '5A': { steps: 4, semis: 8, name: '5ª aumentada' },
  '6m': { steps: 5, semis: 8, name: '6ª menor' },
  '6M': { steps: 5, semis: 9, name: '6ª maior' },
  '7d': { steps: 6, semis: 9, name: '7ª diminuta' },
  '7m': { steps: 6, semis: 10, name: '7ª menor' },
  '7M': { steps: 6, semis: 11, name: '7ª maior' },
  '8J': { steps: 7, semis: 12, name: 'oitava' },
  '9m': { steps: 1, semis: 13, name: '9ª menor' },
  '9M': { steps: 1, semis: 14, name: '9ª maior' },
  '9A': { steps: 1, semis: 15, name: '9ª aumentada' },
  '11J': { steps: 3, semis: 17, name: '11ª justa' },
  '11A': { steps: 3, semis: 18, name: '11ª aumentada' },
  '13m': { steps: 5, semis: 20, name: '13ª menor' },
  '13M': { steps: 5, semis: 21, name: '13ª maior' },
};

// Os intervalos simples que a trilha ensina, em ordem.
export const SIMPLE_INTERVALS = ['2m', '2M', '3m', '3M', '4J', '4A', '5J', '6m', '6M', '7m', '7M', '8J'];

export function transpose(n, ivName) {
  const iv = INTERVALS[ivName];
  if (!iv) throw new Error('Intervalo inválido: ' + ivName);
  const l = (n.l + iv.steps) % 7;
  const target = (pc(n) + iv.semis) % 12;
  let a = target - NAT[l];
  if (a > 6) a -= 12;
  if (a < -6) a += 12;
  return { l, a };
}

// Desce um intervalo (para "aproximação" e afins).
export function transposeDown(n, ivName) {
  const iv = INTERVALS[ivName];
  const l = (((n.l - iv.steps) % 7) + 7) % 7;
  const target = (((pc(n) - iv.semis) % 12) + 12) % 12;
  let a = target - NAT[l];
  if (a > 6) a -= 12;
  if (a < -6) a += 12;
  return { l, a };
}

// Nome do intervalo entre duas notas escritas (ascendente, dentro da oitava).
export function intervalBetween(x, y) {
  const steps = (((y.l - x.l) % 7) + 7) % 7;
  const semis = (((pc(y) - pc(x)) % 12) + 12) % 12;
  for (const [k, v] of Object.entries(INTERVALS)) {
    if (v.steps === steps && v.semis === semis) return k;
  }
  return null;
}

export const semitonesBetween = (x, y) => (((pc(y) - pc(x)) % 12) + 12) % 12;

export const isUsable = (n) => Math.abs(n.a) <= 1;

// ── Escalas ─────────────────────────────────────────────

export const SCALES = {
  maior: { name: 'maior', ivs: ['1J', '2M', '3M', '4J', '5J', '6M', '7M'] },
  menor: { name: 'menor natural', ivs: ['1J', '2M', '3m', '4J', '5J', '6m', '7m'] },
  harmonica: { name: 'menor harmônica', ivs: ['1J', '2M', '3m', '4J', '5J', '6m', '7M'] },
  melodica: { name: 'menor melódica', ivs: ['1J', '2M', '3m', '4J', '5J', '6M', '7M'] },
  pentaMaior: { name: 'pentatônica maior', ivs: ['1J', '2M', '3M', '5J', '6M'] },
  pentaMenor: { name: 'pentatônica menor', ivs: ['1J', '3m', '4J', '5J', '7m'] },
  blues: { name: 'blues', ivs: ['1J', '3m', '4J', '5d', '5J', '7m'] },
  jonio: { name: 'jônio', ivs: ['1J', '2M', '3M', '4J', '5J', '6M', '7M'] },
  dorico: { name: 'dórico', ivs: ['1J', '2M', '3m', '4J', '5J', '6M', '7m'] },
  frigio: { name: 'frígio', ivs: ['1J', '2m', '3m', '4J', '5J', '6m', '7m'] },
  lidio: { name: 'lídio', ivs: ['1J', '2M', '3M', '4A', '5J', '6M', '7M'] },
  mixolidio: { name: 'mixolídio', ivs: ['1J', '2M', '3M', '4J', '5J', '6M', '7m'] },
  eolio: { name: 'eólio', ivs: ['1J', '2M', '3m', '4J', '5J', '6m', '7m'] },
  locrio: { name: 'lócrio', ivs: ['1J', '2m', '3m', '4J', '5d', '6m', '7m'] },
};

export const MODES = ['jonio', 'dorico', 'frigio', 'lidio', 'mixolidio', 'eolio', 'locrio'];

export function scale(root, type = 'maior') {
  const r = typeof root === 'string' ? note(root) : root;
  return SCALES[type].ivs.map((iv) => transpose(r, iv));
}

// Tonalidades maiores usuais e suas armaduras.
export const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
export const COMMON_MAJOR = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'];
export const COMMON_MINOR = ['A', 'E', 'D', 'B', 'G', 'C', 'F#'];

export function keySignature(root) {
  const s = scale(root, 'maior');
  const sharps = s.filter((n) => n.a > 0).length;
  const flats = s.filter((n) => n.a < 0).length;
  return { sharps, flats, count: sharps || flats, type: sharps ? '#' : flats ? 'b' : '' };
}

// Ciclo de quintas (sentido horário, sustenidos) e os bemóis.
export const CIRCLE = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const relativeMinor = (root) => transpose(note(root), '6M');
export const relativeMajor = (root) => transpose(note(root), '3m');

// ── Acordes ─────────────────────────────────────────────

export const CHORDS = {
  '': { ivs: ['1J', '3M', '5J'], name: 'maior', cls: 'M' },
  m: { ivs: ['1J', '3m', '5J'], name: 'menor', cls: 'm' },
  '°': { ivs: ['1J', '3m', '5d'], name: 'diminuto', cls: 'dim' },
  '+': { ivs: ['1J', '3M', '5A'], name: 'aumentado', cls: 'aug' },
  sus4: { ivs: ['1J', '4J', '5J'], name: 'suspenso (4ª)', cls: 'sus' },
  sus2: { ivs: ['1J', '2M', '5J'], name: 'suspenso (2ª)', cls: 'sus' },
  '7M': { ivs: ['1J', '3M', '5J', '7M'], name: 'maior com 7ª maior', cls: 'M' },
  '7': { ivs: ['1J', '3M', '5J', '7m'], name: 'dominante (com 7ª menor)', cls: 'dom' },
  m7: { ivs: ['1J', '3m', '5J', '7m'], name: 'menor com 7ª menor', cls: 'm' },
  'm7(b5)': { ivs: ['1J', '3m', '5d', '7m'], name: 'meio-diminuto', cls: 'hdim' },
  '°7': { ivs: ['1J', '3m', '5d', '7d'], name: 'diminuto com 7ª diminuta', cls: 'dim' },
  m7M: { ivs: ['1J', '3m', '5J', '7M'], name: 'menor com 7ª maior', cls: 'm' },
  '6': { ivs: ['1J', '3M', '5J', '6M'], name: 'maior com 6ª', cls: 'M' },
  m6: { ivs: ['1J', '3m', '5J', '6M'], name: 'menor com 6ª', cls: 'm' },
  '7sus4': { ivs: ['1J', '4J', '5J', '7m'], name: 'dominante suspenso', cls: 'dom' },
};

export const TRIAD_TYPES = ['', 'm', '°', '+'];
export const TETRAD_TYPES = ['7M', '7', 'm7', 'm7(b5)', '°7'];

const TENSIONS = { '9': '9M', b9: '9m', '#9': '9A', '11': '11J', '#11': '11A', '13': '13M', b13: '13m' };

// Lê uma cifra: "C", "Am7", "G/B", "F#m7(b5)", "C7(9)", "Bb7M", "E7(#9)", "Dø"...
export function parseChord(sym) {
  const s = sym.trim().replace(/\s+/g, '');
  const m = /^([A-G])(#|b)?(.*?)(?:\/([A-G](?:#|b)?))?$/.exec(s);
  if (!m) return null;
  const root = note(m[1] + (m[2] || ''));
  let rest = m[3] || '';
  const bass = m[4] ? note(m[4]) : null;

  // Tensões entre parênteses: (9), (b9,#11), (9/13)...
  const tensions = [];
  rest = rest.replace(/\(([^)]*)\)/g, (_, inner) => {
    for (const t of inner.split(/[,/]/)) {
      const tt = t.trim().replace('+', '#').replace('-', 'b');
      if (tt === 'b5') tensions.push('b5');
      else if (tt === '#5') tensions.push('#5');
      else if (TENSIONS[tt]) tensions.push(tt);
      else if (tt) return '(' + inner + ')';
    }
    return '';
  });

  // Normaliza sinônimos comuns.
  let q = rest
    .replace(/^maj7|^Maj7|^M7|^7\+|^Δ/, '7M')
    .replace(/^min/, 'm')
    .replace(/^-/, 'm')
    .replace(/^ø7?/, 'm7(b5)')
    .replace(/^dim7|^o7|^º7/, '°7')
    .replace(/^dim|^o|^º/, '°')
    .replace(/^aug/, '+');

  // Tensões soltas: C9, Cm9, C7M9, C13, Cadd9.
  let added = null;
  if (/^add9$/.test(q)) { q = ''; added = '9'; }
  const loose = /^(m|7M|m7|7)?(9|11|13)$/.exec(q);
  if (loose && !(q === '' )) {
    const base = loose[1] || '';
    q = base === '' ? '7' : base === 'm' ? 'm7' : base;
    tensions.push(loose[2]);
  }
  if (tensions.includes('b5')) {
    if (q === 'm7') q = 'm7(b5)';
    else if (q === 'm') q = '°';
    tensions.splice(tensions.indexOf('b5'), 1);
  }
  if (tensions.includes('#5')) {
    if (q === '') q = '+';
    tensions.splice(tensions.indexOf('#5'), 1);
  }
  if (!(q in CHORDS)) return null;
  if (added) tensions.push(added);
  const notes = CHORDS[q].ivs.map((iv) => transpose(root, iv));
  for (const t of tensions) if (TENSIONS[t]) notes.push(transpose(root, TENSIONS[t]));
  return { root, quality: q, tensions, bass, notes, cls: CHORDS[q].cls, symbol: s };
}

export function chordNotes(root, quality) {
  const r = typeof root === 'string' ? note(root) : root;
  return CHORDS[quality].ivs.map((iv) => transpose(r, iv));
}

export const chordSymbol = (root, quality, bass) =>
  name(typeof root === 'string' ? note(root) : root) + quality + (bass ? '/' + name(bass) : '');

// ── Campo harmônico ─────────────────────────────────────

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
export const roman = (i) => ROMAN[i];

function qualityOf(stack) {
  const [r, t, f, s] = stack;
  const iv3 = intervalBetween(r, t);
  const iv5 = intervalBetween(r, f);
  const iv7 = s ? intervalBetween(r, s) : null;
  const triad = iv3 === '3M' && iv5 === '5J' ? '' : iv3 === '3m' && iv5 === '5J' ? 'm' : iv3 === '3m' && iv5 === '5d' ? '°' : iv3 === '3M' && iv5 === '5A' ? '+' : '?';
  if (!s) return triad;
  const map = { '': { '7M': '7M', '7m': '7' }, m: { '7m': 'm7', '7M': 'm7M' }, '°': { '7m': 'm7(b5)', '7d': '°7' }, '+': { '7M': '+7M', '7m': '+7' } };
  return (map[triad] && map[triad][iv7]) || '?';
}

// Acordes de cada grau. type: 'maior' | 'menor' | 'harmonica' | 'melodica'
export function harmonicField(root, type = 'maior', tetrads = false) {
  const s = scale(root, type);
  return s.map((n, i) => {
    const stack = [s[i], s[(i + 2) % 7], s[(i + 4) % 7]];
    if (tetrads) stack.push(s[(i + 6) % 7]);
    const q = qualityOf(stack);
    return { degree: i, root: n, quality: q, symbol: name(n) + q, roman: degreeLabel(i, q, type) };
  });
}

// Grau no padrão usado no Brasil: I7M, IIm7, V7, VIIm7(b5)...
export function degreeLabel(i, q, type = 'maior') {
  let r = ROMAN[i];
  if (type !== 'maior') {
    // Em menor, graus rebaixados em relação à maior paralela levam "b".
    const flatDegrees = { menor: [2, 5, 6], harmonica: [2, 5], melodica: [2] }[type] || [];
    if (flatDegrees.includes(i)) r = 'b' + r;
  }
  return r + q;
}

export const FUNCTION_NAMES = { T: 'tônica', SD: 'subdominante', D: 'dominante' };
// Função de cada grau no tom maior.
export const MAJOR_FUNCTIONS = ['T', 'SD', 'T', 'SD', 'D', 'T', 'D'];

// ── Instrumentos e braço ────────────────────────────────

export const INSTRUMENTS = {
  violao: { name: 'Violão', strings: [64, 59, 55, 50, 45, 40], labels: ['E', 'B', 'G', 'D', 'A', 'E'] },
  baixo: { name: 'Baixo', strings: [43, 38, 33, 28], labels: ['G', 'D', 'A', 'E'] },
};
// Cordas listadas da mais aguda (topo do diagrama) para a mais grave.

export const midiAt = (inst, s, f) => INSTRUMENTS[inst].strings[s] + f;
export const pcAt = (inst, s, f) => midiAt(inst, s, f) % 12;

export function positionsOf(inst, pcs, fretMin = 0, fretMax = 12, strings = null) {
  const out = [];
  const set = new Set([].concat(pcs));
  const ss = strings || INSTRUMENTS[inst].strings.map((_, i) => i);
  for (const s of ss) for (let f = fretMin; f <= fretMax; f++) if (set.has(pcAt(inst, s, f))) out.push({ s, f });
  return out;
}

// Corda do baixo que corresponde a uma corda grave do violão (mesma afinação, uma oitava abaixo).
export function bassStringFor(guitarString) {
  const map = { 2: 0, 3: 1, 4: 2, 5: 3 }; // G, D, A, E
  return guitarString in map ? map[guitarString] : null;
}

// ── Análise de cifra (para os Experimentos) ─────────────

function diatonicMap(root, type) {
  const tri = harmonicField(root, type, false);
  const tet = harmonicField(root, type, true);
  return tri.map((t, i) => ({ pc: pc(t.root), tri: t.quality, tet: tet[i].quality, roman: tet[i].roman, triRoman: t.roman, i }));
}

function matchesDegree(ch, d) {
  if (pc(ch.root) !== d.pc) return false;
  if (ch.quality === d.tri || ch.quality === d.tet) return true;
  const triOf = { '7M': '', '7': '', '6': '', m7: 'm', m6: 'm', 'm7(b5)': '°', '°7': '°', m7M: 'm', sus4: null, sus2: null, '7sus4': null };
  return triOf[ch.quality] === d.tri && ch.quality !== '7';
}

export function detectKey(chords) {
  const cands = [];
  for (const k of MAJOR_KEYS) cands.push({ root: note(k), type: 'maior' });
  for (const k of ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D', 'G', 'C', 'F', 'Bb', 'Eb']) cands.push({ root: note(k), type: 'menor' });
  let best = null;
  for (const c of cands) {
    const map = c.type === 'maior' ? diatonicMap(c.root, 'maior') : diatonicMap(c.root, 'menor');
    const harm = c.type === 'menor' ? diatonicMap(c.root, 'harmonica') : [];
    let score = 0;
    for (const ch of chords) {
      if (map.some((d) => matchesDegree(ch, d))) score += 2;
      else if (harm.some((d) => matchesDegree(ch, d))) score += 1.5;
      else if (ch.quality === '7' && map.some((d) => d.pc === (pc(ch.root) + 5) % 12)) score += 0.5;
    }
    const first = chords[0], last = chords[chords.length - 1];
    if (first && pc(first.root) === pc(c.root)) score += 1;
    if (last && pc(last.root) === pc(c.root)) score += 1.5;
    if (!best || score > best.score) best = { ...c, score };
  }
  return best;
}

export function analyzeProgression(symbols) {
  const chords = [];
  const invalid = [];
  for (const s of symbols) {
    const p = parseChord(s);
    if (p) chords.push(p); else invalid.push(s);
  }
  if (!chords.length) return { key: null, items: [], invalid };
  const key = detectKey(chords);
  const map = diatonicMap(key.root, key.type);
  const harm = key.type === 'menor' ? diatonicMap(key.root, 'harmonica') : [];
  const parallel = key.type === 'maior' ? diatonicMap(key.root, 'menor') : diatonicMap(key.root, 'maior');
  const items = chords.map((ch) => {
    let d = map.find((x) => matchesDegree(ch, x));
    if (d) {
      const fn = key.type === 'maior' ? MAJOR_FUNCTIONS[d.i] : ['T', 'SD', 'T', 'SD', 'D', 'SD', 'SD'][d.i];
      return { chord: ch, label: d.roman.replace(/[^IVb]+$/, '') + ch.quality, kind: 'diatônico', fn };
    }
    d = harm.find((x) => matchesDegree(ch, x));
    if (d) return { chord: ch, label: d.roman.replace(/[^IVb]+$/, '') + ch.quality, kind: 'menor harmônica', fn: d.i === 4 || d.i === 6 ? 'D' : 'T' };
    if (ch.quality === '7' || ch.quality === '') {
      // Dominante secundário: resolve uma 5ª abaixo num grau do campo (exceto o I).
      const target = map.find((x) => x.pc === (pc(ch.root) + 5) % 12 && x.i !== 0 && !x.tri.includes('°'));
      if (target && ch.quality === '7') return { chord: ch, label: 'V7/' + target.triRoman.replace('m', '').replace('°', ''), kind: 'dominante secundário', fn: 'D' };
    }
    d = parallel.find((x) => matchesDegree(ch, x));
    if (d) {
      const lbl = (key.type === 'maior' ? degreeLabel(d.i, '', 'menor') : degreeLabel(d.i, '', 'maior')).replace(/[^IVb]+$/, '');
      return { chord: ch, label: lbl + ch.quality, kind: 'empréstimo modal', fn: null };
    }
    return { chord: ch, label: '?', kind: 'fora do tom', fn: null };
  });
  return { key, items, invalid };
}

// ── Utilidades ──────────────────────────────────────────

export const rand = (n) => Math.floor(Math.random() * n);
export const pick = (arr) => arr[rand(arr.length)];
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function sample(arr, k) {
  return shuffle(arr).slice(0, k);
}
