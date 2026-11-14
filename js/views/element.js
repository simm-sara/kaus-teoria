import { KIND_LABEL, ELEMENTS, usesInstrument } from '../content.js';
import * as P from '../progress.js';
import * as store from '../store.js';
import { esc, lessonHTML } from '../ui/blocks.js';

function neighbors(e) {
  const list = ELEMENTS.filter((x) => x.kind !== 'x');
  const i = list.indexOf(e);
  return { prev: list[i - 1], next: list[i + 1] };
}

export function render(id) {
  const e = P.find(id);
  if (!e) return `<main class="page narrow"><p>Elemento não encontrado.</p><a href="#/">Voltar à trilha</a></main>`;
  const st = P.status(e);
  const lock = st === 'lock';
  if (!lock) store.markSeen(e.id);
  const inst = store.settings().inst;
  const { prev, next } = neighbors(e);
  const instNote = usesInstrument(e) && e.kind !== 'v' && e.kind !== 'b'
    ? `<p class="caption" style="margin:0;font-size:11px">Os exercícios de braço seguem o instrumento escolhido no topo${inst === 'ambos' ? ' (alternando violão e baixo)' : ''}.</p>`
    : '';

  return `<main class="page narrow" id="conteudo">
    <a href="#/" class="label" style="text-decoration:none">← Trilha</a>
    <div class="el-head">
      <div class="big-tile ${st === 'cur' ? 'cur' : lock ? 'lock' : ''}"><span class="n">${e.id}</span><span class="sym">${e.s}</span></div>
      <div>
        <span class="label construction">${KIND_LABEL[e.kind]} · Período ${e.period}</span>
        <h1 class="display page-title" style="font-size:clamp(36px,5vw,56px)">${esc(e.name)}</h1>
        <p style="margin:0;max-width:560px">${esc(e.desc)}</p>
      </div>
    </div>
    ${lock ? `<div class="tip">Este elemento ainda está bloqueado. Você pode ler a lição e, se já souber o assunto, fazer o teste para pular: com 90% de acerto ele fica dominado e libera o próximo.</div>` : ''}
    <article class="lesson">${lessonHTML(e.lesson, inst)}</article>
    <hr class="rule">
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="btn-row">
        ${lock
          ? `<a class="btn" href="#/teste/${e.id}">Fazer teste para pular (10 perguntas)</a>`
          : `<a class="btn" href="#/p/${e.id}">Praticar · 8 perguntas</a>`}
        ${!lock && P.level(e) < 3 ? `<a class="btn ghost" href="#/teste/${e.id}">Já sei: teste rápido</a>` : ''}
      </div>
      ${instNote}
      <p class="caption" style="margin:0;font-size:11px">70% de acerto: praticada. 90% numa sessão seguinte: dominada.</p>
    </div>
    <nav class="btn-row" aria-label="Elementos vizinhos" style="justify-content:space-between">
      ${prev ? `<a class="btn ghost small" href="#/e/${prev.id}">← ${prev.id} ${esc(prev.name)}</a>` : '<span></span>'}
      ${next ? `<a class="btn ghost small" href="#/e/${next.id}">${next.id} ${esc(next.name)} →</a>` : ''}
    </nav>
  </main>`;
}
