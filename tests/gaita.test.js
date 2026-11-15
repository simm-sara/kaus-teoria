import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../js/tracks/gaita.js';
import * as H from '../js/harp.js';

test('trilha da gaita: 30 elementos, 6 experimentos, conteúdo completo', () => {
  assert.equal(G.NON_EXP.length, 30);
  assert.equal(G.ELEMENTS.filter((e) => e.kind === 'x').length, 6);
  const ids = G.ELEMENTS.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  const sig = G.NON_EXP.map((e) => e.s);
  assert.equal(new Set(sig).size, sig.length, 'siglas repetidas');
  for (const p of G.PERIODS) assert.equal(G.inPeriod(p.n).filter((e) => e.kind !== 'x').length, 5, 'período ' + p.n);
  for (const e of G.ELEMENTS) {
    if (e.kind === 'x') {
      assert.ok(e.steps.length >= 3 && e.song && e.song.tab, e.id);
      assert.ok(H.parseSeq(e.song.tab).every((x) => !x.error && (x.bar || x.rest || x.midi)), e.id + ': tablatura inválida');
      continue;
    }
    assert.ok(e.lesson.length >= 2, e.id + ' sem lição');
    for (const g of e.gens) assert.ok(G.GENERATORS[g], `${e.id}: gerador ${g} não existe`);
    for (const [type, v] of e.lesson) {
      if (type === 'tab') assert.ok(H.parseSeq(v.seq).every((x) => !x.error && (x.bar || x.rest || x.midi)), `${e.id}: tablatura ${v.seq}`);
      if (type === 'harp' && v.tabs) assert.ok(v.tabs.every((t) => H.tabToMidi(t)), `${e.id}: furo inválido`);
    }
  }
});

test('geradores da gaita produzem perguntas coerentes (400 vezes cada)', () => {
  for (const id of Object.keys(G.GENERATORS)) {
    for (let i = 0; i < 400; i++) {
      const q = G.generate(id);
      assert.ok(q.prompt && q.explain, id);
      if (q.type === 'mc') {
        assert.ok(q.options.length >= 2, `${id}: poucas opções (${q.prompt})`);
        assert.ok(q.answer >= 0, `${id}: resposta fora das opções (${q.prompt})`);
        const keys = q.options.map((o) => JSON.stringify(o));
        assert.equal(new Set(keys).size, keys.length, `${id}: opções repetidas ${keys}`);
      } else if (q.type === 'harp') {
        assert.ok(q.valid.length > 0, id);
        for (const c of q.valid) {
          assert.ok(c.h >= q.holes[0] && c.h <= q.holes[1], `${id}: furo fora da área`);
          assert.ok(c.d === 'b' || c.d === 'd');
        }
      } else {
        assert.fail(id + ': tipo ' + q.type);
      }
    }
  }
});
