import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../js/theory.js';

const names = (ns) => ns.map(T.name).join(' ');

test('escalas maiores com a grafia certa', () => {
  assert.equal(names(T.scale('C')), 'C D E F G A B');
  assert.equal(names(T.scale('F')), 'F G A Bb C D E');
  assert.equal(names(T.scale('D')), 'D E F# G A B C#');
  assert.equal(names(T.scale('Eb')), 'Eb F G Ab Bb C D');
  assert.equal(names(T.scale('F#')), 'F# G# A# B C# D# E#');
});

test('escalas menores', () => {
  assert.equal(names(T.scale('A', 'menor')), 'A B C D E F G');
  assert.equal(names(T.scale('A', 'harmonica')), 'A B C D E F G#');
  assert.equal(names(T.scale('A', 'melodica')), 'A B C D E F# G#');
  assert.equal(names(T.scale('E', 'pentaMenor')), 'E G A B D');
  assert.equal(names(T.scale('D', 'dorico')), 'D E F G A B C');
});

test('intervalos', () => {
  assert.equal(T.intervalBetween(T.note('C'), T.note('E')), '3M');
  assert.equal(T.intervalBetween(T.note('E'), T.note('G')), '3m');
  assert.equal(T.intervalBetween(T.note('B'), T.note('F')), '5d');
  assert.equal(T.intervalBetween(T.note('F'), T.note('B')), '4A');
  assert.equal(T.name(T.transpose(T.note('D'), '5J')), 'A');
  assert.equal(T.name(T.transpose(T.note('Bb'), '3M')), 'D');
  assert.equal(T.name(T.transposeDown(T.note('C'), '2m')), 'B');
});

test('armaduras', () => {
  assert.deepEqual([T.keySignature('D').count, T.keySignature('D').type], [2, '#']);
  assert.deepEqual([T.keySignature('Eb').count, T.keySignature('Eb').type], [3, 'b']);
  assert.equal(T.keySignature('C').count, 0);
});

test('campo harmônico', () => {
  assert.equal(T.harmonicField('C', 'maior', true).map((d) => d.symbol).join(' '), 'C7M Dm7 Em7 F7M G7 Am7 Bm7(b5)');
  assert.equal(T.harmonicField('C', 'maior', true).map((d) => d.roman).join(' '), 'I7M IIm7 IIIm7 IV7M V7 VIm7 VIIm7(b5)');
  assert.equal(T.harmonicField('G').map((d) => d.symbol).join(' '), 'G Am Bm C D Em F#°');
  assert.equal(T.harmonicField('A', 'harmonica', true)[4].symbol, 'E7');
  assert.equal(T.harmonicField('A', 'menor', true).map((d) => d.roman).join(' '), 'Im7 IIm7(b5) bIII7M IVm7 Vm7 bVI7M bVII7');
});

test('cifras', () => {
  const c = (s) => {
    const p = T.parseChord(s);
    return p && names(p.notes) + (p.bass ? ' /' + T.name(p.bass) : '');
  };
  assert.equal(c('C'), 'C E G');
  assert.equal(c('Am7'), 'A C E G');
  assert.equal(c('F#m7(b5)'), 'F# A C E');
  assert.equal(c('Bb7M'), 'Bb D F A');
  assert.equal(c('G/B'), 'G B D /B');
  assert.equal(c('C7(9)'), 'C E G Bb D');
  assert.equal(c('C9'), 'C E G Bb D');
  assert.equal(c('Dø'), 'D F Ab C');
  assert.equal(c('B°7'), 'B D F Ab');
  assert.equal(c('Cmaj7'), 'C E G B');
  assert.equal(c('E7(#9)'), 'E G# B D F##');
  assert.equal(c('Cadd9'), 'C E G D');
  assert.equal(T.parseChord('H7'), null);
});

test('braço', () => {
  assert.equal(T.pcAt('violao', 5, 0), 4); // Mi grave
  assert.equal(T.pcAt('violao', 4, 3), 0); // Dó na corda Lá
  assert.equal(T.pcAt('baixo', 3, 5), 9); // Lá na corda Mi
  // A corda Mi do baixo é a corda Mi grave do violão uma oitava abaixo.
  assert.equal(T.midiAt('violao', 5, 0) - T.midiAt('baixo', T.bassStringFor(5), 0), 12);
  assert.equal(T.midiAt('violao', 2, 7) - T.midiAt('baixo', T.bassStringFor(2), 7), 12);
});

test('análise de progressão', () => {
  const r = T.analyzeProgression(['C', 'A7', 'Dm7', 'G7', 'C']);
  assert.equal(T.name(r.key.root), 'C');
  assert.equal(r.key.type, 'maior');
  assert.deepEqual(r.items.map((i) => i.label), ['I', 'V7/II', 'IIm7', 'V7', 'I']);
  const r2 = T.analyzeProgression(['Am', 'Dm', 'E7', 'Am']);
  assert.equal(T.name(r2.key.root), 'A');
  assert.equal(r2.key.type, 'menor');
  const r3 = T.analyzeProgression(['C', 'F', 'Fm', 'C']);
  assert.equal(r3.items[2].kind, 'empréstimo modal');
  assert.equal(r3.items[2].label, 'IVm');
});
