// Geradores de exercícios. Cada gerador recebe { inst } e devolve uma pergunta:
//   { type: 'mc', prompt, options, answer, explain, show?, audio?, optionKind? }
//   { type: 'fret', inst, prompt, mode: 'one' | 'all', valid: [{s,f}], fretMin, fretMax,
//     strings?, marks?, explain }

import * as T from './theory.js';

const { note, name, pc, transpose, pick, rand, shuffle, sample } = T;

// ── Utilidades ──────────────────────────────────────────

function mc(prompt, correct, distractors, extra = {}) {
  const seen = new Set([correct]);
  const rest = [];
  for (const d of shuffle(distractors)) {
    if (!seen.has(d)) { seen.add(d); rest.push(d); }
    if (rest.length === 3) break;
  }
  const options = shuffle([correct, ...rest]);
  return { type: 'mc', prompt, options, answer: options.indexOf(correct), ...extra };
}

const fixed = (pool) => () => {
  const q = pick(pool);
  return mc(q[0], q[1], q[2], { explain: q[3] });
};

const naturalNote = () => pick(T.NATURALS);
const usableNote = () => pick(T.CHROMATIC.concat([note('Db'), note('Eb'), note('Gb'), note('Ab'), note('Bb')]));
const majorKey = () => note(pick(T.COMMON_MAJOR));
const minorKey = () => note(pick(T.COMMON_MINOR));
const names = (ns) => ns.map(name).join(' ');
const ivName = (k) => T.INTERVALS[k].name;

// Erra a escrita de uma nota da lista (para distratores de escala/acorde).
function corrupt(ns) {
  const i = 1 + rand(ns.length - 1);
  const copy = ns.slice();
  const delta = pick([-1, 1]);
  copy[i] = { l: copy[i].l, a: copy[i].a + delta };
  if (Math.abs(copy[i].a) > 1) copy[i] = { l: copy[i].l, a: copy[i].a - 2 * delta };
  return copy;
}

// Uma posição aleatória no braço (sem casas muito altas).
function randomPos(inst, { fretMax = 9, strings = null } = {}) {
  const ss = strings || T.INSTRUMENTS[inst].strings.map((_, i) => i);
  return { s: pick(ss), f: rand(fretMax + 1) };
}

function positionsWithMidi(inst, midi, fretMax = 12) {
  const out = [];
  T.INSTRUMENTS[inst].strings.forEach((open, s) => {
    const f = midi - open;
    if (f >= 0 && f <= fretMax) out.push({ s, f });
  });
  return out;
}

// ── 01 Notas ────────────────────────────────────────────

function nextNatural() {
  const i = rand(7);
  const dir = pick(['depois', 'antes']);
  const ans = dir === 'depois' ? T.LETTERS[(i + 1) % 7] : T.LETTERS[(i + 6) % 7];
  return mc(`Na sequência das notas naturais, qual nota vem ${dir} de ${T.LETTERS[i]}?`, ans, T.LETTERS.filter((l) => l !== T.LETTERS[i]), {
    explain: 'A sequência é C D E F G A B e volta para C.',
  });
}

function solfegeToLetter() {
  const i = rand(7);
  if (Math.random() < 0.5) {
    return mc(`Na cifra, ${T.SOLFEGE[i]} é escrito como:`, T.LETTERS[i], T.LETTERS, {
      explain: 'Dó = C, Ré = D, Mi = E, Fá = F, Sol = G, Lá = A, Si = B.',
    });
  }
  return mc(`A letra ${T.LETTERS[i]} corresponde a qual nota?`, T.SOLFEGE[i], T.SOLFEGE, {
    explain: 'C = Dó, D = Ré, E = Mi, F = Fá, G = Sol, A = Lá, B = Si.',
  });
}

const notesFacts = fixed([
  ['Quantos sons diferentes existem antes de a sequência se repetir (na oitava)?', '12', ['7', '8', '10'], 'São 7 notas naturais e 5 alteradas: 12 sons, depois tudo se repete uma oitava acima.'],
  ['Quantas notas naturais (sem sustenido ou bemol) existem?', '7', ['5', '8', '12'], 'C D E F G A B.'],
  ['Entre quais notas naturais NÃO existe nota no meio?', 'E–F e B–C', ['C–D e F–G', 'D–E e A–B', 'G–A e B–C'], 'E–F e B–C estão a apenas um semitom (uma casa) de distância.'],
]);

// ── 02/03 Braço ─────────────────────────────────────────

function fretFindNote(inst) {
  const n = naturalNote();
  const strings = T.INSTRUMENTS[inst].strings.map((_, i) => i);
  const s = pick(strings);
  const valid = T.positionsOf(inst, pc(n), 0, 12, [s]);
  const label = T.INSTRUMENTS[inst].labels[s];
  return {
    type: 'fret', inst, mode: 'one', fretMin: 0, fretMax: 12, strings: [s], valid,
    prompt: `Toque ${name(n)} (${T.solfege(n)}) na corda ${label}${inst === 'violao' && s === 0 ? ' aguda' : inst === 'violao' && s === 5 ? ' grave' : ''}.`,
    explain: `${name(n)} fica na casa ${valid.map((v) => v.f).join(' e na casa ')} dessa corda.`,
  };
}

function fretNameNote(inst) {
  const pos = randomPos(inst, { fretMax: 12 });
  const p = T.pcAt(inst, pos.s, pos.f);
  const correct = T.pcLabel(p);
  const others = [1, 2, 11, 10, 5].map((d) => T.pcLabel(p + d));
  return mc('Que nota é esta?', correct, others, {
    show: { fret: { inst, marks: [{ ...pos, accent: true }] } },
    explain: `Corda ${T.INSTRUMENTS[inst].labels[pos.s]}, casa ${pos.f}: ${correct}.`,
  });
}

const fretFacts = (inst) => {
  const pool = inst === 'violao'
    ? [
      ['Qual é a afinação padrão do violão, da corda mais grave para a mais aguda?', 'E A D G B E', ['E A D G C E', 'D A D G B E', 'E B G D A E'], 'Mi Lá Ré Sol Si Mi.'],
      ['Na casa 12, qual nota aparece em cada corda?', 'A mesma nota da corda solta, uma oitava acima', ['A nota um tom acima da corda solta', 'Sempre C', 'Uma 5ª acima da corda solta'], 'A casa 12 divide a corda ao meio: a oitava.'],
      ['Na corda E grave, qual nota fica na casa 5?', 'A', ['G', 'B', 'C'], 'E + 5 semitons = A. Por isso a casa 5 de uma corda é a corda solta seguinte (exceto G→B).'],
      ['Qual par de cordas do violão NÃO segue a regra "casa 5 = corda solta de baixo"?', 'G e B', ['E e A', 'A e D', 'D e G'], 'Entre G e B a distância é de 4 semitons, então a referência é a casa 4.'],
    ]
    : [
      ['Qual é a afinação padrão do baixo de 4 cordas, do grave para o agudo?', 'E A D G', ['E A D B', 'D A D G', 'E B G D'], 'Mi Lá Ré Sol, igual às 4 cordas graves do violão.'],
      ['No baixo, a casa 5 da corda E é igual a qual corda solta?', 'A', ['D', 'G', 'B'], 'E + 5 semitons = A.'],
      ['Qual a distância entre todas as cordas vizinhas do baixo?', '4ª justa (5 semitons)', ['3ª maior', '5ª justa', '1 tom'], 'E→A→D→G: sempre 5 semitons. No baixo não há a exceção G→B do violão.'],
    ];
  const q = pick(pool);
  return mc(q[0], q[1], q[2], { explain: q[3] });
};

// ── 04 Tom e semitom ────────────────────────────────────

function stepType() {
  const n = naturalNote();
  const m = T.NATURALS[(n.l + 1) % 7];
  const semis = T.semitonesBetween(n, m);
  return mc(`De ${name(n)} para ${name(m)}: tom ou semitom?`, semis === 1 ? 'Semitom' : 'Tom', ['Tom', 'Semitom', 'Um tom e meio'], {
    explain: semis === 1 ? `${name(n)}–${name(m)} é um dos dois pares naturais com apenas 1 casa de distância.` : `${name(n)}–${name(m)} tem 2 casas de distância: um tom.`,
  });
}

function stepUp() {
  const n = naturalNote();
  const iv = pick(['2M', '2m']);
  const ans = transpose(n, iv);
  const wrong = [transpose(n, iv === '2M' ? '2m' : '2M'), transpose(n, '3m'), { l: ans.l, a: ans.a + (ans.a > 0 ? -1 : 1) }].filter(T.isUsable);
  return mc(`Qual nota fica ${iv === '2M' ? 'um tom' : 'um semitom'} acima de ${name(n)}?`, name(ans), wrong.map(name), {
    explain: `${iv === '2M' ? '2 casas' : '1 casa'} acima de ${name(n)} é ${name(ans)}.`,
  });
}

function stepFret(inst) {
  const s = rand(T.INSTRUMENTS[inst].strings.length);
  const f = 1 + rand(8);
  const up = pick([1, 2]);
  return {
    type: 'fret', inst, mode: 'one', fretMin: 0, fretMax: 12, strings: [s],
    marks: [{ s, f, accent: true }],
    valid: [{ s, f: f + up }],
    prompt: `Na mesma corda, toque a nota ${up === 2 ? 'um tom' : 'um semitom'} acima da marcada.`,
    explain: `${up === 2 ? 'Um tom = 2 casas' : 'Um semitom = 1 casa'}: casa ${f + up}.`,
  };
}

// ── 05 Acidentes ────────────────────────────────────────

function enharmonic() {
  const pairs = [['C#', 'Db'], ['D#', 'Eb'], ['F#', 'Gb'], ['G#', 'Ab'], ['A#', 'Bb'], ['E#', 'F'], ['B#', 'C'], ['Fb', 'E'], ['Cb', 'B']];
  const [a, b] = pick(pairs);
  const [q, ans] = Math.random() < 0.5 ? [a, b] : [b, a];
  const qn = note(q);
  const wrong = [pc(qn) + 1, pc(qn) + 11, pc(qn) + 2].map((p) => T.pcName(p, Math.random() < 0.5));
  return mc(`Qual nota soa igual a ${q}?`, ans, wrong, {
    explain: `${q} e ${ans} são o mesmo som com nomes diferentes (enarmonia).`,
  });
}

const accidentalFacts = fixed([
  ['O sustenido (#)...', 'sobe a nota um semitom', ['sobe a nota um tom', 'desce a nota um semitom', 'muda a oitava'], 'Sustenido = +1 casa. Bemol = −1 casa.'],
  ['O bemol (b)...', 'desce a nota um semitom', ['sobe a nota um semitom', 'desce a nota um tom', 'alonga a nota'], 'Bemol = −1 casa.'],
  ['Por que às vezes se escreve Bb e não A#?', 'Porque cada escala usa cada letra uma vez só', ['Porque Bb soa mais grave', 'É só gosto pessoal', 'Porque A# não existe'], 'Em F maior: F G A Bb C D E. Com A#, a letra A apareceria duas vezes e faltaria o B.'],
]);

// ── 06–09 Intervalos ────────────────────────────────────

function intervalNumber() {
  const n = naturalNote();
  const k = 1 + rand(6);
  const m = T.NATURALS[(n.l + k) % 7];
  const seq = Array.from({ length: k + 1 }, (_, i) => T.LETTERS[(n.l + i) % 7]).join(' ');
  return mc(`De ${name(n)} até ${name(m)} (subindo), que intervalo é? Conte as letras.`, `${k + 1}ª`, ['2ª', '3ª', '4ª', '5ª', '6ª', '7ª'], {
    explain: `${seq}: ${k + 1} letras, então é uma ${k + 1}ª.`,
  });
}

function intervalQuality() {
  const n = pick(T.NATURALS.concat([note('Bb'), note('Eb'), note('F#')]));
  const k = pick(T.SIMPLE_INTERVALS.filter((x) => x !== '8J'));
  const m = transpose(n, k);
  if (!T.isUsable(m)) return intervalQuality();
  const same = T.SIMPLE_INTERVALS.filter((x) => x !== k && x !== '8J' && T.INTERVALS[x].steps === T.INTERVALS[k].steps);
  const near = T.SIMPLE_INTERVALS.filter((x) => x !== k && x !== '8J');
  return mc(`Qual é o intervalo de ${name(n)} até ${name(m)}?`, ivName(k), same.concat(sample(near, 3)).map(ivName), {
    explain: `${name(n)}→${name(m)}: ${T.INTERVALS[k].steps + 1} letras e ${T.INTERVALS[k].semis} semitons = ${ivName(k)}.`,
  });
}

function intervalSemis() {
  const k = pick(T.SIMPLE_INTERVALS);
  const s = T.INTERVALS[k].semis;
  return mc(`Quantos semitons (casas) tem uma ${ivName(k)}?`, String(s), [s - 1, s + 1, s + 2, s - 2].filter((x) => x > 0).map(String), {
    explain: `${ivName(k)} = ${s} semitons.`,
  });
}

function intervalBuild() {
  const n = pick(T.NATURALS.concat([note('Bb'), note('Eb')]));
  const k = pick(['3m', '3M', '4J', '5J', '6m', '6M', '7m', '7M']);
  const m = transpose(n, k);
  if (!T.isUsable(m)) return intervalBuild();
  const wrong = [transpose(n, T.SIMPLE_INTERVALS[(T.SIMPLE_INTERVALS.indexOf(k) + 1) % 12]), transpose(n, T.SIMPLE_INTERVALS[(T.SIMPLE_INTERVALS.indexOf(k) + 11) % 12]), { l: m.l, a: m.a + (m.a >= 0 ? 1 : -1) }].filter(T.isUsable);
  return mc(`Qual nota está uma ${ivName(k)} acima de ${name(n)}?`, name(m), wrong.map(name), {
    explain: `${name(n)} + ${ivName(k)} (${T.INTERVALS[k].semis} semitons) = ${name(m)}.`,
  });
}

// Intervalos com forma no braço: usa notas reais (MIDI).
const SHAPE_IVS = ['2M', '3m', '3M', '4J', '5J', '6M', '7m', '8J'];

function intervalFretFind(inst) {
  const k = pick(SHAPE_IVS);
  const semis = T.INTERVALS[k].semis;
  const nStr = T.INSTRUMENTS[inst].strings.length;
  const s = nStr - 1 - rand(2); // começa numa das duas cordas mais graves
  const f = 1 + rand(5);
  const root = T.midiAt(inst, s, f);
  const valid = positionsWithMidi(inst, root + semis, 12);
  return {
    type: 'fret', inst, mode: 'one', fretMin: 0, fretMax: 12, valid,
    marks: [{ s, f, accent: true, label: '1' }],
    prompt: `Toque a ${ivName(k)} acima da nota marcada (${T.pcLabel(root % 12)}).`,
    explain: `${ivName(k)} = ${semis} semitons acima: ${T.pcLabel((root + semis) % 12)}${valid.length ? ', por exemplo na corda ' + T.INSTRUMENTS[inst].labels[valid[0].s] + ', casa ' + valid[0].f : ''}.`,
  };
}

function intervalFretName(inst) {
  const k = pick(SHAPE_IVS);
  const semis = T.INTERVALS[k].semis;
  const nStr = T.INSTRUMENTS[inst].strings.length;
  const s = nStr - 1 - rand(2);
  const f = 1 + rand(5);
  const root = T.midiAt(inst, s, f);
  const top = pick(positionsWithMidi(inst, root + semis, 12));
  return mc('Que intervalo formam as duas notas marcadas (da grave para a aguda)?', ivName(k), SHAPE_IVS.filter((x) => x !== k).map(ivName), {
    show: { fret: { inst, marks: [{ s, f, accent: true, label: '1' }, { ...top, label: '?' }] } },
    explain: `${semis} semitons de distância: ${ivName(k)}.`,
  });
}

const EAR_SETS = [['3M', '3m', '5J', '8J'], ['2M', '3M', '4J', '5J'], ['4J', '5J', '6M', '8J'], ['3m', '3M', '6m', '6M'], ['2m', '2M', '7m', '7M']];

function intervalEar() {
  const set = pick(EAR_SETS);
  const k = pick(set);
  const root = 48 + rand(12);
  return mc('Ouça o intervalo. Qual é?', ivName(k), set.filter((x) => x !== k).map(ivName), {
    audio: { kind: 'interval', notes: [root, root + T.INTERVALS[k].semis] },
    explain: `Era uma ${ivName(k)} (${T.INTERVALS[k].semis} semitons).`,
  });
}

// ── 10 Ponte: oitava abaixo ─────────────────────────────

function octaveBridge() {
  const gs = 2 + rand(4); // cordas G, D, A, E do violão
  const f = rand(10);
  const gMidi = T.midiAt('violao', gs, f);
  const valid = positionsWithMidi('baixo', gMidi - 12, 12);
  return {
    type: 'fret', inst: 'baixo', mode: 'one', fretMin: 0, fretMax: 12, valid,
    ref: { inst: 'violao', marks: [{ s: gs, f, accent: true }] },
    prompt: `No violão, a nota marcada é ${T.pcLabel(gMidi % 12)} (corda ${T.INSTRUMENTS.violao.labels[gs]}, casa ${f}). Toque a mesma nota no baixo, uma oitava abaixo.`,
    explain: `Mesma corda, mesma casa: corda ${T.INSTRUMENTS.baixo.labels[T.bassStringFor(gs)]} do baixo, casa ${f}.`,
  };
}

const bridgeFacts = fixed([
  ['A corda A (Lá) do baixo corresponde a qual corda do violão?', 'A 5ª corda (A)', ['A 6ª corda (E grave)', 'A 4ª corda (D)', 'A 2ª corda (B)'], 'O baixo tem as cordas E A D G, como as 4 mais graves do violão, uma oitava abaixo.'],
  ['Uma forma de escala que você toca nas 4 cordas graves do violão...', 'funciona igual no baixo', ['precisa ser transposta uma 5ª', 'não serve para o baixo', 'só funciona com capotraste'], 'Mesma afinação relativa: os desenhos são idênticos.'],
  ['Qual a diferença de altura entre a corda E do baixo e a E grave do violão?', 'Uma oitava (o baixo é mais grave)', ['Nenhuma', 'Duas oitavas', 'Uma 5ª'], 'Mesmo nome, uma oitava abaixo.'],
]);

// ── 11–15 Escala maior ──────────────────────────────────

function majorScaleNotes() {
  const k = majorKey();
  const s = T.scale(k, 'maior');
  return mc(`Quais são as notas de ${name(k)} maior?`, names(s), [names(corrupt(s)), names(corrupt(s)), names(T.scale(k, 'menor')), names(T.scale(k, 'mixolidio'))], {
    explain: `T T S T T T S a partir de ${name(k)}: ${names(s)}.`,
  });
}

function scaleNth() {
  const k = majorKey();
  const s = T.scale(k, 'maior');
  const i = 1 + rand(6);
  return mc(`Qual é a ${i + 1}ª nota da escala de ${name(k)} maior?`, name(s[i]), s.filter((_, j) => j !== i).map(name).concat(name({ l: s[i].l, a: s[i].a + (s[i].a > 0 ? -1 : 1) })), {
    explain: `${names(s)}: a ${i + 1}ª é ${name(s[i])}.`,
  });
}

const scaleFacts = fixed([
  ['Qual é a fórmula da escala maior?', 'T T S T T T S', ['T S T T S T T', 'T T T S T T S', 'S T T T S T T'], 'Tom, tom, semitom, tom, tom, tom, semitom.'],
  ['Na escala maior, onde ficam os semitons?', 'Entre o 3º e 4º graus e entre o 7º e 8º', ['Entre o 2º e 3º e entre o 5º e 6º', 'Entre o 1º e 2º e entre o 4º e 5º', 'Só entre o 7º e o 8º'], 'É o que a fórmula T T S T T T S diz.'],
  ['Qual escala maior não tem nenhum sustenido ou bemol?', 'C maior', ['A maior', 'G maior', 'F maior'], 'C D E F G A B: só notas naturais.'],
]);

function degreeNote() {
  const k = majorKey();
  const s = T.scale(k, 'maior');
  const i = rand(7);
  if (Math.random() < 0.5) {
    return mc(`Em ${name(k)} maior, qual nota é o grau ${T.roman(i)}?`, name(s[i]), s.filter((_, j) => j !== i).map(name), {
      explain: `${names(s)} → grau ${T.roman(i)} = ${name(s[i])}.`,
    });
  }
  return mc(`Em ${name(k)} maior, ${name(s[i])} é qual grau?`, T.roman(i), ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'], {
    explain: `${names(s)}: ${name(s[i])} é o ${i + 1}º grau (${T.roman(i)}).`,
  });
}

function keyBySignature() {
  const k = pick(['G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab', 'Db']);
  const sig = T.keySignature(k);
  const label = `${sig.count} ${sig.type === '#' ? 'sustenido' : 'bemol'}${sig.count > 1 ? (sig.type === '#' ? 's' : 'is') : ''}`;
  if (Math.random() < 0.5) {
    const others = ['G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab', 'Db'].filter((x) => x !== k);
    return mc(`Qual tom maior tem ${label}?`, k, others, {
      explain: `${k} maior: ${names(T.scale(k))}.`,
    });
  }
  return mc(`Quantos acidentes tem a escala de ${k} maior?`, label, [1, 2, 3, 4, 5].filter((n) => n !== sig.count).map((n) => `${n} ${sig.type === '#' ? 'sustenido' : 'bemol'}${n > 1 ? (sig.type === '#' ? 's' : 'is') : ''}`), {
    explain: `${k} maior: ${names(T.scale(k))}.`,
  });
}

function keyFromChords() {
  const k = majorKey();
  const f = T.harmonicField(k, 'maior');
  const set = shuffle([f[0], f[3], f[4], pick([f[1], f[5]])]).map((d) => d.symbol);
  const others = T.COMMON_MAJOR.filter((x) => x !== name(k)).concat([name(transpose(k, '4J')), name(transpose(k, '5J'))]);
  return mc(`Uma música usa os acordes ${set.join(', ')}. Em que tom ela provavelmente está?`, `${name(k)} maior`, others.map((x) => `${x} maior`), {
    explain: `Todos são do campo harmônico de ${name(k)} maior: ${f.map((d) => d.symbol).join(' ')}.`,
  });
}

function circleNext() {
  const i = rand(12);
  const k = T.CIRCLE[i];
  const r = Math.random();
  if (r < 0.4) {
    return mc(`No ciclo de quintas (sentido horário, subindo uma 5ª), qual tom vem depois de ${k}?`, T.CIRCLE[(i + 1) % 12], T.CIRCLE.filter((x) => x !== k), {
      explain: `${k} + 5ª justa = ${T.CIRCLE[(i + 1) % 12]}.`,
    });
  }
  if (r < 0.7) {
    return mc(`No sentido anti-horário (subindo uma 4ª), qual tom vem depois de ${k}?`, T.CIRCLE[(i + 11) % 12], T.CIRCLE.filter((x) => x !== k), {
      explain: `${k} + 4ª justa = ${T.CIRCLE[(i + 11) % 12]}.`,
    });
  }
  const mk = pick(T.COMMON_MAJOR);
  const rel = name(T.relativeMinor(mk)) + 'm';
  return mc(`Qual é a relativa menor de ${mk} maior?`, rel, T.COMMON_MAJOR.filter((x) => x !== mk).map((x) => name(T.relativeMinor(x)) + 'm').concat([mk + 'm']), {
    explain: `A relativa menor fica no 6º grau: ${rel}. Mesmas notas, outro centro.`,
  });
}

function scaleShapeFret() {
  const inst = 'violao';
  const k = pick(['C', 'G', 'D', 'A', 'E', 'F']);
  const s = T.scale(k, 'maior');
  const fretMin = rand(6);
  const fretMax = fretMin + 3;
  const strings = pick([[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]]);
  const valid = T.positionsOf(inst, s.map(pc), fretMin, fretMax, strings);
  return {
    type: 'fret', inst, mode: 'all', fretMin, fretMax, strings, valid,
    prompt: `Marque todas as notas de ${k} maior na área destacada (casas ${fretMin} a ${fretMax}, cordas ${strings.map((i) => T.INSTRUMENTS.violao.labels[i]).join(' ')}). Depois confirme.`,
    explain: `${k} maior: ${names(s)}. São ${valid.length} posições nessa área.`,
  };
}

// ── 16–20 Acordes ───────────────────────────────────────

function chordNotesQ(types) {
  return () => {
    const r = pick(T.NATURALS.concat([note('Bb'), note('Eb'), note('F#')]));
    const q = pick(types);
    const ns = T.chordNotes(r, q);
    if (!ns.every(T.isUsable)) return chordNotesQ(types)();
    const others = types.filter((x) => x !== q).map((x) => names(T.chordNotes(r, x)));
    return mc(`Quais são as notas de ${name(r)}${q}?`, names(ns), others.concat([names(corrupt(ns))]), {
      explain: `${name(r)}${q} (${T.CHORDS[q].name}): ${T.CHORDS[q].ivs.map(ivName).join(', ')} → ${names(ns)}.`,
    });
  };
}

function chordNameQ(types) {
  return () => {
    const r = pick(T.NATURALS.concat([note('Bb'), note('Eb')]));
    const q = pick(types);
    const ns = T.chordNotes(r, q);
    if (!ns.every(T.isUsable)) return chordNameQ(types)();
    return mc(`Que acorde formam as notas ${names(ns)}?`, name(r) + q, types.filter((x) => x !== q).map((x) => name(r) + x).concat([name(ns[1]) + q]), {
      explain: `Tônica ${name(r)}, ${T.CHORDS[q].ivs.slice(1).map(ivName).join(', ')}: ${name(r)}${q}.`,
    });
  };
}

function chordEar(types, labels) {
  return () => {
    const q = pick(types);
    const root = 48 + rand(7);
    const midis = T.CHORDS[q].ivs.map((k) => root + T.INTERVALS[k].semis);
    return mc('Ouça o acorde. Qual é o tipo?', labels[q], types.filter((x) => x !== q).map((x) => labels[x]), {
      audio: { kind: 'chord', notes: midis },
      explain: `Era um acorde ${labels[q].toLowerCase()}.`,
    });
  };
}

const triadFacts = fixed([
  ['O que diferencia um acorde maior de um menor?', 'A 3ª: maior (4 semitons) ou menor (3)', ['A 5ª', 'A tônica', 'A 7ª'], 'Tônica e 5ª são iguais; só a 3ª muda.'],
  ['Uma tríade diminuta tem...', '3ª menor e 5ª diminuta', ['3ª maior e 5ª diminuta', '3ª menor e 5ª justa', '3ª maior e 5ª aumentada'], 'Ex.: B D F.'],
  ['Tríade é um acorde de...', 'três notas empilhadas em terças', ['três notas quaisquer', 'quatro notas', 'duas notas e uma oitava'], 'Tônica, 3ª e 5ª.'],
]);

const tetradFacts = fixed([
  ['A diferença entre C7M e C7 é...', 'a 7ª: maior (B) em C7M, menor (Bb) em C7', ['a 3ª', 'a 5ª', 'C7 não tem 7ª'], 'O "7" sozinho é sempre 7ª menor; "7M" é 7ª maior.'],
  ['m7(b5) é chamado também de...', 'meio-diminuto (ø)', ['diminuto', 'aumentado', 'suspenso'], 'Tríade diminuta + 7ª menor.'],
  ['Qual tétrade tem 3ª maior, 5ª justa e 7ª menor?', 'Dominante (7)', ['7M', 'm7', 'm7(b5)'], 'É o acorde de tensão que quer resolver.'],
  ['C°7 (diminuto) tem quais intervalos?', '3ª menor, 5ª diminuta e 7ª diminuta', ['3ª menor, 5ª diminuta e 7ª menor', '3ª maior, 5ª justa e 7ª menor', '3ª menor, 5ª justa e 7ª menor'], 'Todas as notas a 3 semitons de distância: C Eb Gb Bbb (= A).'],
]);

function cifraRead() {
  const r = pick([note('C'), note('D'), note('E'), note('F'), note('G'), note('A'), note('Bb')]);
  const kind = rand(4);
  if (kind === 0) {
    const t = pick([['9', '9M'], ['13', '13M'], ['11', '11J']]);
    const base = t[0] === '11' ? 'm7' : '7';
    const ans = transpose(r, t[1]);
    return mc(`Em ${name(r)}${base}(${t[0]}), qual nota é a ${t[0]}ª?`, name(ans), [transpose(r, '2m'), transpose(r, '3M'), transpose(r, '5J'), transpose(r, '6m'), transpose(r, '4A')].map(name), {
      explain: `${t[0]}ª = ${t[0] === '9' ? '2ª' : t[0] === '11' ? '4ª' : '6ª'} uma oitava acima: ${name(ans)}.`,
    });
  }
  if (kind === 1) {
    const b = pick(T.chordNotes(r, '').slice(1));
    return mc(`Em ${name(r)}/${name(b)}, qual nota o baixo toca?`, name(b), [name(r), ...T.chordNotes(r, '').map(name), name(transpose(r, '5J'))], {
      explain: `O que vem depois da barra é a nota mais grave: ${name(b)}.`,
    });
  }
  if (kind === 2) {
    const q = pick(['m7', '7M', '7', 'm7(b5)', 'm6', '°7']);
    const desc = { m7: 'menor com 7ª menor', '7M': 'maior com 7ª maior', '7': 'maior com 7ª menor (dominante)', 'm7(b5)': 'meio-diminuto', m6: 'menor com 6ª', '°7': 'diminuto' }[q];
    return mc(`Como se escreve "${T.solfege(r)} ${desc}"?`, name(r) + q, ['m7', '7M', '7', 'm7(b5)', 'm6', '°7', 'm7M'].filter((x) => x !== q).map((x) => name(r) + x), {
      explain: `${name(r)}${q}.`,
    });
  }
  return fixed([
    ['Na cifra, o que indica o "m" em Am?', 'Acorde menor', ['Acorde maior', 'Sétima maior', 'Nota no baixo'], 'm minúsculo = menor.'],
    ['O que significa o "7M" em C7M?', 'Sétima maior', ['Sétima menor', 'Acorde menor com 7ª', 'Sete casas acima'], '7M = 7ª maior. O "7" sozinho é 7ª menor.'],
    ['Em uma cifra, o que fica entre parênteses, como em G7(13)?', 'Tensões adicionadas ao acorde', ['A nota do baixo', 'Notas que não devem ser tocadas', 'O dedilhado'], 'Notas além da tétrade: 9, 11, 13 e suas alterações.'],
  ])();
}

function chordFretCheck(inst) {
  const r = pick(['C', 'G', 'D', 'A', 'E', 'F']);
  const q = pick(['', 'm']);
  const ns = T.chordNotes(r, q);
  const fretMin = rand(4);
  const fretMax = fretMin + 3;
  const strings = inst === 'baixo' ? [0, 1, 2, 3] : [2, 3, 4, 5];
  const valid = T.positionsOf(inst, ns.map(pc), fretMin, fretMax, strings);
  return {
    type: 'fret', inst, mode: 'all', fretMin, fretMax, strings, valid,
    prompt: `Marque todas as notas de ${r}${q} (${names(ns)}) entre as casas ${fretMin} e ${fretMax}${inst === 'violao' ? ', nas 4 cordas graves' : ''}.`,
    explain: `${r}${q} = ${names(ns)}. ${valid.length} posições na área.`,
  };
}

function arpeggioBass() {
  const inst = 'baixo';
  const r = pick(['C', 'G', 'D', 'A', 'E', 'F', 'Bb']);
  const q = pick(['', 'm', '7', 'm7', '7M']);
  const ns = T.chordNotes(r, q);
  // Uma região de 4 casas ao redor da tônica na corda E ou A.
  const rs = pick([2, 3]);
  const rf = T.positionsOf(inst, pc(note(r)), 1, 8, [rs])[0] || { s: 3, f: 3 };
  const fretMin = Math.max(0, rf.f - 1);
  const fretMax = fretMin + 4;
  const valid = T.positionsOf(inst, ns.map(pc), fretMin, fretMax);
  return {
    type: 'fret', inst, mode: 'all', fretMin, fretMax, valid,
    marks: [{ s: rf.s, f: rf.f, label: '1' }],
    prompt: `Arpejo de ${r}${q} no baixo: marque todas as notas do acorde (${names(ns)}) entre as casas ${fretMin} e ${fretMax}.`,
    explain: `${r}${q} = ${names(ns)}. É o mesmo acorde que você faz no violão, nota por nota.`,
  };
}

const arpeggioFacts = fixed([
  ['O que é um arpejo?', 'As notas de um acorde tocadas uma de cada vez', ['Um acorde tocado com força', 'Uma escala de 5 notas', 'Um acorde sem a 3ª'], 'No baixo, quase toda linha nasce de arpejos.'],
  ['Você toca G no violão. Que notas o baixo pode usar para acompanhar sem errar?', 'G, B e D', ['G, C e E', 'G, A e B', 'Só G'], 'As notas do acorde: tônica, 3ª e 5ª.'],
]);

function slashBass() {
  const r = pick(['C', 'D', 'E', 'F', 'G', 'A']);
  const q = pick(['', 'm']);
  const ns = T.chordNotes(r, q);
  const i = 1 + rand(2);
  const b = ns[i];
  if (Math.random() < 0.5) {
    return mc(`Em ${r}${q}/${name(b)}, o baixo toca qual nota do acorde?`, i === 1 ? 'A 3ª' : 'A 5ª', ['A tônica', 'A 3ª', 'A 5ª', 'A 7ª'], {
      explain: `${r}${q} = ${names(ns)}: ${name(b)} é a ${i === 1 ? '3ª' : '5ª'} (inversão).`,
    });
  }
  const valid = T.positionsOf('baixo', pc(b), 0, 7);
  return {
    type: 'fret', inst: 'baixo', mode: 'one', fretMin: 0, fretMax: 12, valid: T.positionsOf('baixo', pc(b), 0, 12),
    prompt: `O violão toca ${r}${q}/${name(b)}. Toque no baixo a nota da barra.`,
    explain: `A barra indica a nota do baixo: ${name(b)}${valid[0] ? ' (por exemplo corda ' + T.INSTRUMENTS.baixo.labels[valid[0].s] + ', casa ' + valid[0].f + ')' : ''}.`,
  };
}

// ── 21–25 Harmonia ──────────────────────────────────────

function fieldChord() {
  const k = majorKey();
  const tet = Math.random() < 0.5;
  const f = T.harmonicField(k, 'maior', tet);
  const i = rand(7);
  if (Math.random() < 0.5) {
    return mc(`No campo harmônico de ${name(k)} maior${tet ? ' (tétrades)' : ''}, qual é o acorde do grau ${f[i].roman}?`, f[i].symbol, f.filter((_, j) => j !== i).map((d) => d.symbol).concat([name(f[i].root) + (f[i].quality.includes('m') ? f[i].quality.replace('m', '') : 'm' + f[i].quality)]), {
      explain: `${name(k)} maior: ${f.map((d) => d.roman + ' ' + d.symbol).join(' · ')}.`,
    });
  }
  return mc(`Em ${name(k)} maior, ${f[i].symbol} é qual grau?`, f[i].roman, f.filter((_, j) => j !== i).map((d) => d.roman), {
    explain: `${name(k)} maior: ${f.map((d) => d.roman + ' ' + d.symbol).join(' · ')}.`,
  });
}

function notInField() {
  const k = majorKey();
  const f = T.harmonicField(k, 'maior');
  const ins = sample(f.slice(0, 6), 3).map((d) => d.symbol);
  const i = rand(6);
  const out = name(f[i].root) + (f[i].quality === '' ? 'm' : '');
  return mc(`Qual destes acordes NÃO pertence ao campo harmônico de ${name(k)} maior?`, out, ins, {
    explain: `${name(k)} maior: ${f.map((d) => d.symbol).join(' ')}. ${out} não está nele.`,
  });
}

const fieldFacts = fixed([
  ['No campo harmônico maior, quais graus são acordes maiores?', 'I, IV e V', ['I, II e V', 'II, III e VI', 'I, III e V'], 'Maiores: I IV V. Menores: II III VI. Diminuto: VII.'],
  ['Em tétrades, qual é o único grau com acorde dominante (7)?', 'V', ['I', 'IV', 'VII'], 'V7: por isso ele é a dominante do tom.'],
  ['De onde vem o campo harmônico?', 'De empilhar terças sobre cada nota da escala', ['Do ciclo de quintas', 'Das cordas soltas do violão', 'Da escala cromática'], 'Cada grau usa só notas da escala.'],
]);

function functionOf() {
  const k = majorKey();
  const f = T.harmonicField(k, 'maior', true);
  const i = pick([0, 1, 3, 4, 5, 6]);
  const fn = T.MAJOR_FUNCTIONS[i];
  return mc(`Em ${name(k)} maior, qual é a função de ${f[i].symbol} (${f[i].roman})?`, T.FUNCTION_NAMES[fn], Object.values(T.FUNCTION_NAMES), {
    explain: `Tônica (repouso): I, VI, III. Subdominante (afastamento): IV, II. Dominante (tensão): V, VII.`,
  });
}

const functionFacts = fixed([
  ['Qual função gera mais tensão, pedindo resolução?', 'Dominante', ['Tônica', 'Subdominante', 'Nenhuma'], 'O V7 tem o trítono (3ª e 7ª) que puxa para o I.'],
  ['Qual acorde pode substituir o I, por ter função de tônica?', 'VIm', ['V7', 'IV', 'VIIm7(b5)'], 'O VIm divide duas notas com o I.'],
  ['Qual acorde substitui o IV, com função subdominante?', 'IIm', ['V', 'VIIm7(b5)', 'IIIm'], 'IIm e IV dividem duas notas.'],
]);

function cadence() {
  const k = majorKey();
  const f = T.harmonicField(k, 'maior', true);
  const tri = T.harmonicField(k, 'maior');
  const types = [
    ['autêntica (V → I)', [f[4].symbol, tri[0].symbol]],
    ['plagal (IV → I)', [tri[3].symbol, tri[0].symbol]],
    ['suspensiva (termina no V)', [tri[0].symbol, tri[4].symbol]],
    ['interrompida (V → VIm)', [f[4].symbol, tri[5].symbol]],
  ];
  const [ans, seq] = pick(types);
  return mc(`Em ${name(k)} maior, a frase termina com ${seq.join(' → ')}. Que cadência é essa?`, ans, types.map((t) => t[0]), {
    explain: 'Autêntica V→I (conclusiva), plagal IV→I ("amém"), suspensiva para no V, interrompida V→VIm (engana o ouvido).',
  });
}

function iiVI() {
  const k = majorKey();
  const f = T.harmonicField(k, 'maior', true);
  const r = rand(3);
  if (r === 0) {
    return mc(`Complete o II–V–I de ${name(k)} maior: ${f[1].symbol} – ${f[4].symbol} – ?`, f[0].symbol, [f[3].symbol, f[5].symbol, name(transpose(k, '4J')) + '7M', f[0].symbol.replace('7M', '7')], {
      explain: `IIm7 – V7 – I7M em ${name(k)}: ${f[1].symbol} – ${f[4].symbol} – ${f[0].symbol}.`,
    });
  }
  if (r === 1) {
    const others = T.COMMON_MAJOR.filter((x) => x !== name(k));
    return mc(`${f[1].symbol} – ${f[4].symbol} – ${f[0].symbol} é o II–V–I de qual tom?`, `${name(k)} maior`, others.map((x) => x + ' maior'), {
      explain: `O I é ${f[0].symbol}: tom de ${name(k)} maior.`,
    });
  }
  const others = T.COMMON_MAJOR.filter((x) => x !== name(k)).map((x) => {
    const g = T.harmonicField(x, 'maior', true);
    return g[1].symbol + ' – ' + g[4].symbol;
  });
  return mc(`Qual é o II–V que leva a ${f[0].symbol}?`, f[1].symbol + ' – ' + f[4].symbol, others.concat([f[5].symbol + ' – ' + f[4].symbol]), {
    explain: `II de ${name(k)} = ${f[1].symbol}; V = ${f[4].symbol}.`,
  });
}

function secondaryDominant() {
  const k = majorKey();
  const tri = T.harmonicField(k, 'maior');
  const i = pick([1, 2, 3, 4, 5]);
  const target = tri[i];
  const dom = name(transpose(target.root, '5J')) + '7';
  if (Math.random() < 0.5) {
    const others = [1, 2, 3, 4, 5].filter((j) => j !== i).map((j) => name(transpose(tri[j].root, '5J')) + '7');
    return mc(`Em ${name(k)} maior, qual é o dominante secundário que leva a ${target.symbol} (V7/${T.roman(i)})?`, dom, others, {
      explain: `O V7 de ${target.symbol} fica uma 5ª acima de ${name(target.root)}: ${dom}.`,
    });
  }
  return mc(`Em ${name(k)} maior aparece ${dom}, que não é do campo. Para qual acorde ele costuma resolver?`, target.symbol, tri.filter((_, j) => j !== i).map((d) => d.symbol), {
    explain: `${dom} é dominante de ${target.symbol}: resolve uma 5ª abaixo.`,
  });
}

// ── 26–30 Menor ─────────────────────────────────────────

function minorScaleNotes(type) {
  return () => {
    const k = minorKey();
    const s = T.scale(k, type);
    const others = ['menor', 'harmonica', 'melodica', 'maior'].filter((x) => x !== type).map((x) => names(T.scale(k, x)));
    return mc(`Quais são as notas de ${name(k)} ${T.SCALES[type].name}?`, names(s), others.concat([names(corrupt(s))]), {
      explain: `${name(k)} ${T.SCALES[type].name}: ${names(s)}.`,
    });
  };
}

function relativeMajorQ() {
  const k = minorKey();
  const rel = name(T.relativeMajor(k));
  return mc(`Qual é a relativa maior de ${name(k)}m?`, rel, T.COMMON_MAJOR.filter((x) => x !== rel).concat([name(k)]), {
    explain: `Uma 3ª menor acima de ${name(k)}: ${rel}. ${name(k)} menor e ${rel} maior têm as mesmas notas.`,
  });
}

function harmonicChange() {
  const k = minorKey();
  const nat = T.scale(k, 'menor');
  const har = T.scale(k, 'harmonica');
  if (Math.random() < 0.5) {
    return mc(`De ${name(k)} menor natural para ${name(k)} menor harmônica, qual nota muda?`, `${name(nat[6])} vira ${name(har[6])}`, [`${name(nat[5])} vira ${name({ l: nat[5].l, a: nat[5].a + 1 })}`, `${name(nat[2])} vira ${name({ l: nat[2].l, a: nat[2].a + 1 })}`, 'Nenhuma'], {
      explain: 'A harmônica sobe a 7ª um semitom. Assim o V vira dominante (V7).',
    });
  }
  const v = T.harmonicField(k, 'harmonica', true)[4].symbol;
  const vn = T.harmonicField(k, 'menor', true)[4].symbol;
  return mc(`Em ${name(k)} menor harmônica, qual é o acorde do grau V?`, v, [vn, name(T.scale(k, 'menor')[3]) + 'm7', name(k) + 'm7'], {
    explain: `A 7ª elevada (${name(T.scale(k, 'harmonica')[6])}) transforma ${vn} em ${v}.`,
  });
}

const melodicFacts = fixed([
  ['O que muda da menor natural para a menor melódica?', 'A 6ª e a 7ª sobem um semitom', ['Só a 7ª sobe', 'A 3ª vira maior', 'A 5ª desce'], 'Menor melódica = menor com 6ª e 7ª maiores.'],
  ['A menor melódica é igual à escala maior, exceto por...', 'a 3ª, que é menor', ['a 7ª, que é menor', 'a 4ª, que é aumentada', 'nada'], 'C menor melódica: C D Eb F G A B.'],
]);

function minorField() {
  const k = minorKey();
  const f = T.harmonicField(k, 'menor', true);
  const i = rand(7);
  return mc(`No campo de ${name(k)} menor natural, qual é o acorde do grau ${f[i].roman}?`, f[i].symbol, f.filter((_, j) => j !== i).map((d) => d.symbol), {
    explain: `${name(k)} menor: ${f.map((d) => d.roman + ' ' + d.symbol).join(' · ')}.`,
  });
}

function minorIIVI() {
  const k = minorKey();
  const ii = T.harmonicField(k, 'menor', true)[1].symbol;
  const v = T.harmonicField(k, 'harmonica', true)[4].symbol;
  const i = name(k) + 'm';
  if (Math.random() < 0.5) {
    return mc(`Complete o II–V–I menor: ${ii} – ${v} – ?`, i, [name(T.relativeMajor(k)), name(k), name(transpose(k, '4J')) + 'm', name(transpose(k, '5J')) + 'm'], {
      explain: `IIm7(b5) – V7 – Im: ${ii} – ${v} – ${i}.`,
    });
  }
  return mc(`Qual é o IIm7(b5) do tom de ${i}?`, ii, T.COMMON_MINOR.filter((x) => x !== name(k)).map((x) => T.harmonicField(x, 'menor', true)[1].symbol).concat([name(transpose(k, '2M')) + 'm7']), {
    explain: `O 2º grau de ${name(k)} menor é ${name(T.scale(k, 'menor')[1])}, com acorde meio-diminuto: ${ii}.`,
  });
}

// ── 31–35 Ritmo ─────────────────────────────────────────

const FIG = [['semibreve', 4], ['mínima', 2], ['semínima', 1], ['colcheia', 0.5], ['semicolcheia', 0.25]];
const plural = { semibreve: 'semibreves', 'mínima': 'mínimas', 'semínima': 'semínimas', colcheia: 'colcheias', semicolcheia: 'semicolcheias' };

function figures() {
  const a = rand(4);
  const b = a + 1 + rand(4 - a);
  const [big, bv] = FIG[a];
  const [small, sv] = FIG[b];
  const n = bv / sv;
  if (Math.random() < 0.3) {
    const [f, v] = pick(FIG);
    const lbl = (x) => (x === 4 ? '4 tempos' : x === 2 ? '2 tempos' : x === 1 ? '1 tempo' : x === 0.5 ? 'meio tempo' : '1/4 de tempo');
    return mc(`Em 4/4, quanto dura uma ${f}?`, lbl(v), FIG.map((x) => lbl(x[1])), {
      explain: 'Semibreve 4, mínima 2, semínima 1, colcheia ½, semicolcheia ¼.',
    });
  }
  return mc(`Quantas ${plural[small]} cabem numa ${big}?`, String(n), [n / 2, n * 2, n + 1, n - 1].filter((x) => x >= 1 && Number.isInteger(x)).map(String), {
    explain: `Cada figura vale metade da anterior. ${big} = ${n} ${plural[small]}.`,
  });
}

const meterFacts = fixed([
  ['O que indica o número de cima em 3/4?', 'Quantos tempos tem o compasso', ['A velocidade', 'Quantas notas tem a música', 'A figura de cada tempo'], '3 tempos; o 4 de baixo diz que cada tempo é uma semínima.'],
  ['Em 6/8, quantas colcheias há em cada compasso?', '6', ['3', '8', '4'], 'Seis colcheias, sentidas em 2 grupos de 3.'],
  ['Qual compasso é típico da valsa?', '3/4', ['4/4', '2/4', '6/8'], 'UM-dois-três, UM-dois-três.'],
  ['Em 4/4, qual tempo é o mais forte?', 'O primeiro', ['O segundo', 'O terceiro', 'O quarto'], 'O 1 é o mais forte; o 3 é meio forte.'],
  ['O samba costuma ser escrito em...', '2/4', ['3/4', '6/8', '5/4'], 'Dois tempos por compasso, com muita subdivisão.'],
]);

function meterEar() {
  const beats = pick([2, 3, 4]);
  return mc('Ouça o metrônomo (o clique mais forte é o tempo 1). Quantos tempos por compasso?', `${beats}`, ['2', '3', '4', '6'], {
    audio: { kind: 'meter', beats, bars: 3 },
    explain: `O acento volta a cada ${beats} cliques: compasso de ${beats} tempos.`,
  });
}

// Padrões de 8 passos = colcheias num compasso de 4/4 (2 por tempo).
const R = {
  semínimas: [1, 0, 1, 0, 1, 0, 1, 0],
  colcheias: [1, 1, 1, 1, 1, 1, 1, 1],
  contratempo: [0, 1, 0, 1, 0, 1, 0, 1],
  sincope1: [1, 0, 0, 1, 0, 0, 1, 0],
  sincope2: [1, 0, 1, 1, 0, 1, 1, 0],
  sincope3: [0, 0, 1, 1, 0, 1, 0, 0],
  tempo13: [1, 0, 0, 0, 1, 0, 0, 0],
  galope: [1, 0, 1, 1, 1, 0, 1, 1],
};

function rhythmEar(keys, prompt, explainFor) {
  return () => {
    const k = pick(keys);
    const others = keys.filter((x) => x !== k);
    const opts = shuffle([k, ...sample(others, 2)]);
    return {
      type: 'mc', optionKind: 'rhythm', prompt,
      options: opts.map((x) => R[x]), answer: opts.indexOf(k),
      audio: { kind: 'rhythm', steps: R[k], perBeat: 2 },
      explain: explainFor(k),
    };
  };
}

const subdivisionEar = rhythmEar(['semínimas', 'colcheias', 'tempo13', 'galope'], 'Ouça e escolha o padrão. Cada quadrado é uma colcheia; os números são os tempos.', (k) => `Era o padrão de ${k === 'tempo13' ? 'notas nos tempos 1 e 3' : k}.`);
const syncopeEar = rhythmEar(['sincope1', 'sincope2', 'semínimas', 'sincope3'], 'Ouça e escolha o padrão que você escutou.', () => 'Repare nas notas que caem entre os tempos e se prolongam: isso é síncope.');
const offbeatEar = rhythmEar(['contratempo', 'semínimas', 'colcheias'], 'Ouça: o metrônomo marca os tempos. Onde cai a batida?', (k) => (k === 'contratempo' ? 'Só entre os tempos: contratempo, como a guitarra do reggae e do ska.' : 'A batida caía junto com os tempos.'));

function syncopeVisual() {
  const opts = shuffle(['sincope1', 'semínimas', 'colcheias']);
  return {
    type: 'mc', optionKind: 'rhythm', prompt: 'Qual destes padrões tem síncope (notas que antecipam o tempo e se prolongam por cima dele)?',
    options: opts.map((x) => R[x]), answer: opts.indexOf('sincope1'),
    explain: 'No padrão sincopado, a nota cai no "e" do tempo e se estende pelo tempo seguinte.',
  };
}

const subdivisionFacts = fixed([
  ['Contando semicolcheias, como se fala cada tempo?', '1-e-e-a (4 partes)', ['1-e (2 partes)', '1-2-3 (3 partes)', '1 (1 parte)'], 'Quatro semicolcheias por tempo de semínima.'],
  ['Tercina é...', 'três notas no espaço de duas', ['três tempos por compasso', 'uma nota que dura três tempos', 'um acorde de três notas'], 'Divide o tempo em 3 partes iguais.'],
]);

const offbeatFacts = fixed([
  ['O que é tocar no contratempo?', 'Tocar entre os tempos, no "e"', ['Tocar mais rápido', 'Tocar só no tempo 1', 'Tocar fora do tom'], 'A guitarra do reggae e do ska vive no contratempo.'],
  ['No reggae e no ska, o violão ou a guitarra base costuma...', 'acentuar os contratempos', ['tocar só nos tempos 1 e 3', 'tocar semicolcheias constantes', 'ficar em silêncio'], 'O "tchá" entre os tempos é a assinatura do estilo.'],
]);

// ── 36–40 Baixo ─────────────────────────────────────────

const bassRoleFacts = fixed([
  ['Qual é a principal função do baixo numa banda?', 'Ligar a harmonia (fundamental dos acordes) ao ritmo (bateria)', ['Fazer a melodia principal', 'Tocar acordes cheios', 'Fazer solos'], 'O baixo define o acorde que o ouvido percebe e trava o groove com o bumbo.'],
  ['Quando o baixo toca a 3ª do acorde em vez da tônica, o acorde...', 'soa invertido (ex.: C/E)', ['continua igual', 'vira menor', 'fica sem som'], 'A nota mais grave muda a percepção do acorde.'],
  ['Com qual peça da bateria o baixo mais costuma se alinhar?', 'Bumbo', ['Prato de condução', 'Caixa', 'Chimbal'], 'Baixo e bumbo formam a base rítmica grave.'],
]);

function rootFifth() {
  if (Math.random() < 0.5) {
    const r = pick(T.NATURALS.concat([note('Bb'), note('Eb'), note('F#')]));
    const fifth = transpose(r, '5J');
    return mc(`Qual é a 5ª de ${name(r)}?`, name(fifth), [transpose(r, '4J'), transpose(r, '6M'), transpose(r, '3M'), { l: fifth.l, a: fifth.a + (fifth.a > 0 ? -1 : 1) }].filter(T.isUsable).map(name), {
      explain: `${name(r)} + 7 semitons = ${name(fifth)}. No baixo: uma corda acima, duas casas à frente.`,
    });
  }
  const inst = 'baixo';
  const s = pick([2, 3]);
  const f = 1 + rand(6);
  const root = T.midiAt(inst, s, f);
  const valid = positionsWithMidi(inst, root + 7);
  return {
    type: 'fret', inst, mode: 'one', fretMin: 0, fretMax: 12, valid,
    marks: [{ s, f, accent: true, label: '1' }],
    prompt: `A tônica está marcada (${T.pcLabel(root % 12)}). Toque a 5ª acima dela.`,
    explain: 'A 5ª fica uma corda acima, duas casas à frente.',
  };
}

function targetNote() {
  const k = majorKey();
  const f = T.harmonicField(k, 'maior');
  const a = pick(f.slice(0, 6));
  const b = pick(f.filter((d) => d !== a).slice(0, 6));
  const ns = T.chordNotes(b.root, b.quality);
  if (Math.random() < 0.5) {
    return mc(`A música vai de ${a.symbol} para ${b.symbol}. Qual a nota-alvo mais segura para o tempo 1 de ${b.symbol}?`, name(b.root), [name(transpose(b.root, '2M')), name(transpose(b.root, '4J')), name(transpose(b.root, '7m'))], {
      explain: `A tônica do acorde de chegada: ${name(b.root)}. Depois vêm 3ª e 5ª (${name(ns[1])}, ${name(ns[2])}).`,
    });
  }
  return mc(`Além da tônica, qual destas notas também funciona como alvo em ${b.symbol}?`, name(ns[1]), [name(transpose(b.root, '2M')), name(transpose(b.root, '4J')), name(transpose(b.root, '7M'))].filter((x) => x !== name(ns[1])), {
    explain: `${b.symbol} = ${names(ns)}. A 3ª (${name(ns[1])}) define se é maior ou menor.`,
  });
}

function chromaticApproach() {
  const r = pick(T.NATURALS.concat([note('Bb'), note('Eb')]));
  if (Math.random() < 0.6) {
    const below = Math.random() < 0.5;
    const ans = below ? T.transposeDown(r, '2m') : transpose(r, '2m');
    return mc(`Para chegar em ${name(r)} por aproximação cromática ${below ? 'de baixo' : 'de cima'}, qual nota você toca antes?`, T.pcLabel(pc(ans)), [T.pcLabel(pc(r) + (below ? 1 : 11)), T.pcLabel(pc(r) + (below ? 10 : 2)), T.pcLabel(pc(r) + 5)], {
      explain: `Um semitom ${below ? 'abaixo' : 'acima'} de ${name(r)}: ${T.pcLabel(pc(ans))}.`,
    });
  }
  const inst = 'baixo';
  const s = rand(4);
  const f = 2 + rand(7);
  return {
    type: 'fret', inst, mode: 'one', fretMin: 0, fretMax: 12, strings: [s],
    marks: [{ s, f, accent: true, label: 'alvo' }],
    valid: [{ s, f: f - 1 }],
    prompt: 'O próximo acorde começa na nota marcada. Toque a aproximação cromática de baixo, na mesma corda.',
    explain: `Uma casa antes: casa ${f - 1}.`,
  };
}

const grooveFacts = fixed([
  ['Linha de baixo de rock básica:', 'Colcheias constantes na tônica', ['Uma nota por compasso', 'Semicolcheias sincopadas com notas abafadas', 'Uma nota diferente por tempo, conectando os acordes'], 'O "motorzinho" de colcheias segura a energia.'],
  ['Walking bass (jazz) é...', 'uma nota por tempo, caminhando entre os acordes', ['colcheias na tônica', 'só tônica e 5ª', 'pausas longas'], 'Arpejos, notas de passagem e aproximação cromática a cada tempo.'],
  ['No samba, o baixo tradicionalmente...', 'alterna tônica e 5ª, com a 5ª grave antecipando', ['toca colcheias retas na tônica', 'fica no contratempo', 'faz walking'], 'Imitando o surdo: a nota do tempo 2 é a mais forte.'],
  ['Em funk e soul, é comum o baixo usar...', 'semicolcheias sincopadas e notas abafadas', ['uma nota por compasso', 'só semínimas', 'arpejos lentos'], 'Ghost notes dão o balanço.'],
  ['No reggae, o baixo costuma ser...', 'grave, melódico e com espaço (pausas)', ['rápido e constante', 'agudo e com acordes', 'só tônica em semínimas'], 'A linha de baixo é quase a melodia da música.'],
]);

// ── 41–45 Avançado ──────────────────────────────────────

function pentatonic() {
  const maior = Math.random() < 0.5;
  const k = maior ? majorKey() : minorKey();
  const type = maior ? 'pentaMaior' : 'pentaMenor';
  const s = T.scale(k, type);
  return mc(`Quais são as notas de ${name(k)} pentatônica ${maior ? 'maior' : 'menor'}?`, names(s), [names(T.scale(k, maior ? 'pentaMenor' : 'pentaMaior')), names(T.scale(k, maior ? 'maior' : 'menor').slice(0, 5)), names(corrupt(s))], {
    explain: maior ? `Escala maior sem a 4ª e a 7ª: ${names(s)}.` : `Menor sem a 2ª e a 6ª: ${names(s)}.`,
  });
}

const pentaFacts = fixed([
  ['Que notas a pentatônica maior tira da escala maior?', 'A 4ª e a 7ª', ['A 2ª e a 6ª', 'A 3ª e a 5ª', 'A 6ª e a 7ª'], 'Sem semitons: por isso quase nenhuma nota soa errada.'],
  ['A pentatônica de A menor tem as mesmas notas de qual pentatônica maior?', 'C maior', ['A maior', 'E maior', 'G maior'], 'Relativas: A C D E G = C D E G A.'],
]);

function blues() {
  const r = rand(3);
  if (r === 0) {
    const k = pick(['E', 'A', 'G', 'C', 'D']);
    const set = [k, name(transpose(note(k), '4J')), name(transpose(note(k), '5J'))].map((x) => x + '7');
    return mc(`Num blues em ${k}, quais são os três acordes principais?`, set.join(' '), [[k + '7M', set[1].replace('7', '7M'), set[2]].join(' '), [k + 'm7', set[1].replace('7', 'm7'), set[2]].join(' '), [k + '7', name(transpose(note(k), '2M')) + 'm7', set[2]].join(' ')], {
      explain: 'I7, IV7 e V7: todos dominantes. No blues isso é a cor do estilo, não um "erro".',
    });
  }
  if (r === 1) {
    const k = minorKey();
    const bn = transpose(k, '5d');
    return mc(`Qual é a blue note da escala blues de ${name(k)}?`, name(bn), [name(transpose(k, '4J')), name(transpose(k, '5J')), name(transpose(k, '3m'))], {
      explain: `A 5ª diminuta (${name(bn)}), acrescentada à pentatônica menor.`,
    });
  }
  return fixed([
    ['Na forma de blues de 12 compassos, em que compasso entra o IV pela primeira vez?', '5', ['2', '4', '9'], 'I I I I | IV IV I I | V IV I V.'],
    ['Na forma de 12 compassos, o V aparece no compasso...', '9', ['5', '7', '3'], 'I I I I | IV IV I I | V IV I V.'],
  ])();
}

function modes() {
  const r = rand(3);
  if (r === 0) {
    const i = rand(7);
    const mode = T.MODES[i];
    return mc(`Qual modo começa no ${i + 1}º grau da escala maior?`, T.SCALES[mode].name, T.MODES.map((m) => T.SCALES[m].name), {
      explain: 'I jônio, II dórico, III frígio, IV lídio, V mixolídio, VI eólio, VII lócrio.',
    });
  }
  if (r === 1) {
    const k = pick(['C', 'G', 'D', 'F', 'Bb']);
    const i = 1 + rand(6);
    const root = T.scale(k, 'maior')[i];
    const mode = T.MODES[i];
    return mc(`${name(root)} ${T.SCALES[mode].name} tem as mesmas notas de qual escala maior?`, `${k} maior`, ['C', 'G', 'D', 'F', 'Bb', 'A', 'E'].filter((x) => x !== k).map((x) => x + ' maior'), {
      explain: `${T.SCALES[mode].name} = ${i + 1}º grau. ${name(root)} é o ${i + 1}º grau de ${k} maior.`,
    });
  }
  return fixed([
    ['Qual nota caracteriza o modo lídio, comparado à escala maior?', 'A 4ª aumentada', ['A 7ª menor', 'A 3ª menor', 'A 2ª menor'], 'Lídio = maior com #4.'],
    ['Qual nota caracteriza o mixolídio, comparado à escala maior?', 'A 7ª menor', ['A 4ª aumentada', 'A 6ª menor', 'A 3ª menor'], 'Mixolídio = maior com b7. Combina com acordes dominantes.'],
    ['Qual nota caracteriza o dórico, comparado à menor natural?', 'A 6ª maior', ['A 7ª maior', 'A 2ª menor', 'A 5ª diminuta'], 'Dórico = menor com 6ª maior.'],
  ])();
}

function modalBorrowing() {
  const k = majorKey();
  const minorF = T.harmonicField(k, 'menor');
  const borrowed = [minorF[3], minorF[5], minorF[6], minorF[2]].filter((d) => d.root.a >= -1 && d.root.a <= 1);
  const b = pick(borrowed);
  const majorF = T.harmonicField(k, 'maior');
  return mc(`Em ${name(k)} maior, qual destes acordes é emprestado de ${name(k)} menor?`, b.symbol, sample(majorF.slice(0, 6), 3).map((d) => d.symbol), {
    explain: `${b.symbol} vem de ${name(k)} menor (${b.roman}). Os outros são do campo maior.`,
  });
}

const borrowingFacts = fixed([
  ['O que é empréstimo modal?', 'Usar no tom maior um acorde do tom menor paralelo (mesma tônica)', ['Trocar de tom no meio da música', 'Tocar a relativa menor', 'Usar um dominante secundário'], 'Ex.: em C, usar Fm, Ab ou Bb, que vêm de C menor.'],
  ['Em C maior, o acorde Fm é...', 'IVm emprestado de C menor', ['o IV do campo', 'dominante de Bb', 'fora de qualquer explicação'], 'Dá aquele clima melancólico antes de voltar ao C.'],
]);

function tensions() {
  const r = pick(T.NATURALS.concat([note('Bb'), note('Eb')]));
  const t = pick([['9', '9M'], ['b9', '9m'], ['11', '11J'], ['#11', '11A'], ['13', '13M'], ['b13', '13m']]);
  const ans = transpose(r, t[1]);
  if (!T.isUsable(ans)) return tensions();
  return mc(`Qual nota é a ${t[0]} de ${name(r)}?`, name(ans), [transpose(r, '2M'), transpose(r, '2m'), transpose(r, '4J'), transpose(r, '4A'), transpose(r, '6M'), transpose(r, '6m')].filter((n) => !T.sameNote(n, ans) && T.isUsable(n)).map(name), {
    explain: `${t[0]} = ${t[0].replace(/\d+/, (x) => ({ 9: '2', 11: '4', 13: '6' }[x]))}ª uma oitava acima: ${name(ans)}.`,
  });
}

const tensionFacts = fixed([
  ['Por que a 11ª justa costuma ser evitada em acordes maiores?', 'Ela choca com a 3ª maior (meio tom acima dela)', ['Porque é muito aguda', 'Porque é igual à 5ª', 'Ela não existe'], 'Em acordes maiores se usa a #11; em menores, a 11 justa soa bem.'],
  ['As tensões 9, 11 e 13 correspondem a quais notas?', '2ª, 4ª e 6ª uma oitava acima', ['3ª, 5ª e 7ª', '1ª, 3ª e 5ª', '5ª, 7ª e 9ª'], '9 = 2 + 7; 11 = 4 + 7; 13 = 6 + 7.'],
]);

// ── Registro ────────────────────────────────────────────

export const GENERATORS = {
  nextNatural, solfegeToLetter, notesFacts,
  fretFindNote, fretNameNote, fretFacts,
  stepType, stepUp, stepFret,
  enharmonic, accidentalFacts,
  intervalNumber, intervalQuality, intervalSemis, intervalBuild,
  intervalFretFind, intervalFretName, intervalEar,
  octaveBridge, bridgeFacts,
  majorScaleNotes, scaleNth, scaleFacts, degreeNote, keyBySignature, keyFromChords, circleNext, scaleShapeFret,
  triadNotes: chordNotesQ(T.TRIAD_TYPES), triadName: chordNameQ(['', 'm', '°', '+']),
  triadEar: chordEar(['', 'm'], { '': 'Maior', m: 'Menor' }), triadFacts,
  triadFret: chordFretCheck,
  tetradNotes: chordNotesQ(['7M', '7', 'm7', 'm7(b5)']), tetradName: chordNameQ(['7M', '7', 'm7', 'm7(b5)']),
  tetradEar: chordEar(['7M', '7', 'm7'], { '7M': 'Maior com 7ª maior (7M)', '7': 'Dominante (7)', m7: 'Menor com 7ª (m7)' }), tetradFacts,
  cifraRead, arpeggioBass, arpeggioFacts, slashBass,
  fieldChord, notInField, fieldFacts, functionOf, functionFacts, cadence, iiVI, secondaryDominant,
  naturalMinorNotes: minorScaleNotes('menor'), harmonicMinorNotes: minorScaleNotes('harmonica'), melodicMinorNotes: minorScaleNotes('melodica'),
  relativeMajorQ, harmonicChange, melodicFacts, minorField, minorIIVI,
  figures, meterFacts, meterEar, subdivisionEar, subdivisionFacts, syncopeEar, syncopeVisual, offbeatEar, offbeatFacts,
  bassRoleFacts, rootFifth, targetNote, chromaticApproach, grooveFacts,
  pentatonic, pentaFacts, blues, modes, modalBorrowing, borrowingFacts, tensions, tensionFacts,
};

// Geradores que dependem do instrumento (recebem 'violao' ou 'baixo').
export const INSTRUMENT_GENERATORS = new Set(['fretFindNote', 'fretNameNote', 'fretFacts', 'stepFret', 'intervalFretFind', 'intervalFretName', 'triadFret']);

export function generate(id, inst) {
  const g = GENERATORS[id];
  if (!g) throw new Error('Gerador desconhecido: ' + id);
  const q = INSTRUMENT_GENERATORS.has(id) ? g(inst) : g();
  q.gen = id;
  return q;
}
