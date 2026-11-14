import { PERIODS, inPeriod, KIND_LABEL, TAG, NON_EXP } from '../content.js';
import * as P from '../progress.js';
import * as store from '../store.js';
import { esc } from '../ui/blocks.js';

let selected = null;

function marks(n, cls = '') {
  return `<span class="marks ${cls}" aria-hidden="true">${[0, 1, 2].map((i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
}

function tile(e, inst) {
  const st = P.status(e);
  const lvl = st === 'lock' ? 0 : P.level(e);
  const dim = (inst === 'violao' && e.kind === 'b') || (inst === 'baixo' && e.kind === 'v');
  const cls = ['tile', st, e.kind === 'x' ? 'exp' : '', selected === e.id ? 'sel' : '', dim ? 'dim' : ''].join(' ');
  return `<button type="button" class="${cls}" data-sel="${e.id}" aria-pressed="${selected === e.id}" aria-label="${esc(e.id + ' ' + e.name + ', ' + P.STATE_LABEL[st])}">
    <span class="top-line"><span>${e.id}</span><span class="tag">${TAG[e.kind]}</span></span>
    <span class="sym">${e.s}</span>
    <span class="bottom"><span class="nm">${esc(e.name)}</span>${marks(lvl)}</span>
  </button>`;
}

function detail(e) {
  const st = P.status(e);
  const lock = st === 'lock';
  const r = store.get().els[e.id] || { v: 0, b: 0 };
  const rows = [];
  if (e.kind === 'x') rows.push(['Feito', r.v >= 3 ? 3 : 0]);
  else {
    if (e.kind !== 'b') rows.push(['Violão', r.v]);
    if (e.kind !== 'v') rows.push(['Baixo', r.b]);
  }
  const href = e.kind === 'x' ? `#/x/${e.id}` : `#/e/${e.id}`;
  const cta = lock
    ? `<a class="btn ghost" href="${href}">Ver ${e.kind === 'x' ? 'experimento' : 'lição'} (bloqueado)</a>`
    : `<a class="btn" href="${href}">${e.kind === 'x' ? 'Abrir experimento' : st === 'dom' ? 'Revisar lição' : 'Começar lição'}</a>`;
  return `<div class="card">
    <div class="el-head">
      <div class="big-tile ${st === 'cur' ? 'cur' : lock ? 'lock' : e.kind === 'x' ? 'exp' : ''}"><span class="n">${e.id}</span><span class="sym">${e.s}</span></div>
      <div>
        <span class="label construction">${KIND_LABEL[e.kind]}</span>
        <h2 class="display h2">${esc(e.name)}</h2>
        <span class="caption">PERÍODO ${e.period} · ${P.STATE_LABEL[st].toUpperCase()}</span>
      </div>
    </div>
    <p style="margin:0;font-size:13px;line-height:1.65">${esc(e.desc)}</p>
    <div class="domain">
      <span class="label">Domínio</span>
      ${rows.map(([l, n]) => `<div class="domain-row"><span style="font-weight:500">${l}</span>${marks(lock ? 0 : n)}<span class="caption" style="font-size:11px">${e.kind === 'x' ? (n >= 3 ? 'concluído' : 'a fazer') : P.LEVEL_WORDS[lock ? 0 : n]}</span></div>`).join('')}
    </div>
    ${cta}
  </div>`;
}

function review() {
  const due = store.dueElements();
  const items = due.slice(0, 4).map((id) => P.find(id)).filter(Boolean);
  return `<div class="card soft">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
      <span class="display h3">Treino de hoje</span>
      <span class="caption">${due.length ? due.length + (due.length > 1 ? ' elementos' : ' elemento') : 'nada pendente'}</span>
    </div>
    ${items.length
      ? `<ul class="list-plain">${items.map((e) => `<li><span>${esc(e.name)}</span><span class="caption">revisão</span></li>`).join('')}</ul><a href="#/treino" style="font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase">Ir para o treino →</a>`
      : `<p class="caption" style="margin:0;font-size:11px">Os elementos que você pratica voltam aqui para revisão em 1, 3, 7, 14 e 30 dias.</p>`}
  </div>`;
}

export function render() {
  const inst = store.settings().inst;
  const cur = P.current();
  if (!selected || !P.find(selected)) selected = cur ? cur.id : '01';
  const dom = P.dominatedCount();
  const bar = NON_EXP.map((e) => `<span class="${P.level(e) >= 3 ? 'on' : ''}"></span>`).join('');
  const curPeriod = cur ? PERIODS[cur.period - 1] : PERIODS[PERIODS.length - 1];

  const rows = PERIODS.map((p) => {
    const els = inPeriod(p.n);
    const main = els.filter((e) => e.kind !== 'x');
    const exp = els.find((e) => e.kind === 'x');
    const open = P.periodOpen(p.n);
    return `<div class="prow">
      <div class="plabel ${open ? '' : 'locked'}"><span class="n">${p.n}</span><span class="nm">${p.name}</span></div>
      ${main.map((e) => tile(e, inst)).join('')}
      <span class="pgap" aria-hidden="true"></span>
      ${tile(exp, inst)}
    </div>`;
  }).join('');

  return `<main class="page" id="conteudo">
    <div class="page-head">
      <div style="display:flex;flex-direction:column;gap:12px">
        <span class="label">Período ${curPeriod.n} — ${curPeriod.name}</span>
        <h1 class="display page-title">Trilha</h1>
      </div>
      <div class="progress">
        <div class="progress-row"><span>Elementos dominados${inst !== 'ambos' ? ' (' + (inst === 'violao' ? 'violão' : 'baixo') + ')' : ''}</span><b>${dom} / 45</b></div>
        <div class="bar" aria-hidden="true">${bar}</div>
        <div class="bar-scale" aria-hidden="true"><span>01</span><span>15</span><span>30</span><span>45</span></div>
      </div>
    </div>
    <div class="trail">
      <section class="table-wrap" aria-label="Tabela de elementos">
        <div class="ptable mm">
          <div class="prow phead"><span>Período</span><span class="span5">Elementos</span><span></span><span>Experimento</span></div>
          ${rows}
        </div>
        <div class="legend">
          <span><b>V·B</b> ponte violão → baixo</span>
          <span><b>V</b> ramo violão</span>
          <span><b>B</b> ramo baixo</span>
          <span><b>EXP</b> experimento com música real</span>
          <span>Traços: vista · praticada · dominada</span>
        </div>
      </section>
      <aside class="side" aria-label="Elemento selecionado">
        ${detail(P.find(selected))}
        ${review()}
      </aside>
    </div>
  </main>`;
}

export function bind(root, rerender) {
  root.querySelectorAll('[data-sel]').forEach((b) => {
    b.addEventListener('click', () => {
      selected = b.dataset.sel;
      rerender();
      const t = root.querySelector(`[data-sel="${selected}"]`);
      if (t) t.focus();
    });
    b.addEventListener('dblclick', () => {
      const e = P.find(b.dataset.sel);
      location.hash = e.kind === 'x' ? `#/x/${e.id}` : `#/e/${e.id}`;
    });
  });
}
