import test from 'node:test';
import assert from 'node:assert/strict';
import { GENERATORS, generate } from '../js/exercises.js';
import { ELEMENTS } from '../js/content.js';
import * as T from '../js/theory.js';

test('todo elemento (menos experimentos) tem geradores válidos', () => {
  for (const e of ELEMENTS) {
    if (e.kind === 'x') {
      assert.ok(e.steps && e.steps.length >= 3, e.id + ' sem passos');
      continue;
    }
    assert.ok(e.gens && e.gens.length, e.id + ' sem geradores');
    for (const g of e.gens) assert.ok(GENERATORS[g], `${e.id}: gerador ${g} não existe`);
    assert.ok(e.lesson && e.lesson.length >= 2, e.id + ' sem lição');
  }
});

test('ids e siglas únicos, 45 elementos e 9 experimentos', () => {
  const ids = ELEMENTS.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ELEMENTS.filter((e) => e.kind !== 'x').length, 45);
  assert.equal(ELEMENTS.filter((e) => e.kind === 'x').length, 9);
  const sig = ELEMENTS.filter((e) => e.kind !== 'x').map((e) => e.s);
  assert.equal(new Set(sig).size, sig.length);
});

test('cada gerador produz perguntas coerentes (300 vezes cada)', () => {
  for (const id of Object.keys(GENERATORS)) {
    for (let i = 0; i < 300; i++) {
      for (const inst of ['violao', 'baixo']) {
        const q = generate(id, inst);
        assert.ok(q.prompt, `${id}: sem enunciado`);
        assert.ok(q.explain, `${id}: sem explicação`);
        if (q.type === 'mc') {
          assert.ok(q.options.length >= 2, `${id}: poucas opções (${q.prompt})`);
          assert.ok(q.answer >= 0 && q.answer < q.options.length, `${id}: resposta fora das opções (${q.prompt})`);
          const keys = q.options.map((o) => JSON.stringify(o));
          assert.equal(new Set(keys).size, keys.length, `${id}: opções repetidas (${q.prompt}) ${keys}`);
        } else if (q.type === 'fret') {
          assert.ok(q.valid.length > 0, `${id}: nenhuma posição válida (${q.prompt})`);
          const nStr = T.INSTRUMENTS[q.inst].strings.length;
          for (const p of q.valid) {
            assert.ok(p.s >= 0 && p.s < nStr, `${id}: corda inválida`);
            assert.ok(p.f >= q.fretMin && p.f <= q.fretMax, `${id}: casa fora da área (${q.prompt}) ${JSON.stringify(p)}`);
            if (q.strings) assert.ok(q.strings.includes(p.s), `${id}: corda fora da área`);
          }
        } else {
          assert.fail(`${id}: tipo desconhecido`);
        }
      }
    }
  }
});
