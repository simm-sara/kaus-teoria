import test from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../js/harp.js';

test('notas da gaita em Dó (Richter)', () => {
  const blow = H.BLOW.map((m) => H.noteName(m)).join(' ');
  const draw = H.DRAW.map((m) => H.noteName(m)).join(' ');
  assert.equal(blow, 'C E G C E G C E G C');
  assert.equal(draw, 'D G B D F A B D F A');
  assert.equal(H.noteName(H.tabToMidi("-3''")), 'A');
  assert.equal(H.noteName(H.tabToMidi("-4'")), 'Db');
  assert.equal(H.noteName(H.tabToMidi("-2''")), 'F');
  assert.equal(H.tabToMidi("-5'"), null); // furo 5 não tem bend de puxar
  assert.equal(H.tabToMidi('-2'), H.tabToMidi('3')); // mesma nota (G)
});

test('escala do meio', () => {
  assert.equal(H.MIDDLE_SCALE.map((t) => H.noteName(H.tabToMidi(t))).join(' '), 'C D E F G A B C');
});

test('tablaturas das músicas batem com as notas da melodia', () => {
  for (const s of H.SONGS) {
    const seq = H.parseSeq(s.tab).filter((x) => !x.bar && !x.rest);
    assert.ok(seq.every((x) => !x.error && x.midi), s.id + ': tablatura inválida');
    assert.equal(seq.map((x) => H.noteName(x.midi)).join(' '), s.notes, s.id);
  }
});

test('acordes da gaita', () => {
  for (const c of H.CHORDS) {
    assert.equal(c.tabs.map((t) => H.noteName(H.tabToMidi(t))).join(' '), c.notes);
  }
});
