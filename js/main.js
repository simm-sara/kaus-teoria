// MUSIKAUS: roteamento, topo e atalhos.

import * as store from './store.js';
import * as P from './progress.js';
import * as audio from './audio.js';
import * as trail from './views/trail.js';
import * as element from './views/element.js';
import * as practice from './views/practice.js';
import * as experiment from './views/experiment.js';
import * as reference from './views/reference.js';
import * as settings from './views/settings.js';
import * as referenceHarp from './views/referenceHarp.js';
import * as profilesView from './views/profiles.js';
import * as profiles from './profiles.js';
import { track, setTrack } from './track.js';
import { esc, handlePlayClick, resetPlayers } from './ui/blocks.js';

const app = document.getElementById('app');

function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [view, arg] = h.split('/');
  return { view: view || '', arg: arg ? decodeURIComponent(arg) : null };
}

const SETTINGS_ICON = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"/><rect x="5.5" y="3" width="3" height="4" fill="#F2EFE8"/><rect x="11.5" y="8" width="3" height="4" fill="#F2EFE8"/><rect x="7.5" y="13" width="3" height="4" fill="#F2EFE8"/></svg>';

function activate(id) {
  const p = profiles.find(id);
  if (!p) return false;
  profiles.setCurrent(p.id);
  store.useKey(p.storageKey);
  setTrack(p.track);
  practice.reset();
  audio.setVolume(store.settings().volume ?? 0.7);
  return true;
}

function header(view) {
  if (view === 'perfis') {
    return `<header class="top"><div class="top-in"><div class="top-left"><span class="display brand">MUSIKAUS</span></div></div></header>`;
  }
  const inst = store.settings().inst;
  const prof = profiles.find(profiles.currentId());
  const st = store.streak();
  const xp = store.get().xp.toLocaleString('pt-BR');
  const due = store.dueElements().length;
  const cur = (v) => (v === view ? 'aria-current="page"' : '');
  const trailViews = ['', 'e', 'p', 'teste', 'x'];
  return `<header class="top">
    <div class="top-in">
      <div class="top-left">
        <a class="display brand" href="#/">MUSIKAUS</a>
        <nav class="nav" aria-label="Navegação principal">
          <a href="#/" ${trailViews.includes(view) ? 'aria-current="page"' : ''}>Trilha</a>
          <a href="#/treino" ${cur('treino')}>Treino${due ? ` (${due})` : ''}</a>
          <a href="#/consulta" ${cur('consulta')}>Consulta</a>
        </nav>
      </div>
      <div class="top-right">
        <span class="label">${st} ${st === 1 ? 'dia' : 'dias'} · ${xp} XP</span>
        ${track().instruments ? `<div class="seg" role="group" aria-label="Instrumento">
          ${[['ambos', 'Ambos'], ['violao', 'Violão'], ['baixo', 'Baixo']].map(([k, l]) => `<button type="button" data-inst="${k}" aria-pressed="${inst === k}">${l}</button>`).join('')}
        </div>` : `<span class="label construction">${esc(track().name)} em Dó</span>`}
        <a class="who" href="#/perfis" title="Trocar de perfil">${esc(prof ? profiles.nameOf(prof) : 'Perfil')} <span aria-hidden="true">⇄</span></a>
        <a class="icon-btn" href="#/ajustes" aria-label="Ajustes" ${cur('ajustes')}>${SETTINGS_ICON}</a>
      </div>
    </div>
  </header>`;
}

function reviewEmpty() {
  const practiced = store.practicedElements().length;
  return `<main class="page narrow" id="conteudo">
    <div class="page-head"><h1 class="display page-title">Treino</h1></div>
    <div class="empty">
      <p style="margin:0 0 8px;color:#1A1A1A">Nada para revisar hoje.</p>
      <p style="margin:0;font-size:12px">${practiced ? 'Os elementos que você praticou voltam aqui em 1, 3, 7, 14 e 30 dias. Volte amanhã ou siga a trilha.' : 'Assim que você praticar o primeiro elemento, ele aparece aqui para revisão.'}</p>
    </div>
    <div class="btn-row"><a class="btn" href="#/">Ir para a trilha</a></div>
  </main>`;
}

let currentView = null;

function render(nav = false) {
  if (nav && typeof nav !== 'boolean') nav = true;
  const { view, arg } = parse();
  if (view !== 'perfis' && !profiles.find(profiles.currentId())) { location.replace('#/perfis'); return; }
  resetPlayers();
  let body = '';
  let binder = null;

  switch (view) {
    case 'perfis':
      body = profilesView.render();
      binder = (root, rr) => profilesView.bind(root, rr, (id) => {
        activate(id);
        location.hash = '#/';
      });
      break;
    case '':
      body = trail.render();
      binder = trail.bind;
      break;
    case 'e': {
      const e = arg && arg.startsWith('X') ? null : arg;
      if (!e) { location.replace('#/x/' + arg); return; }
      body = element.render(arg);
      break;
    }
    case 'p':
    case 'teste': {
      const mode = view === 'p' ? 'practice' : 'test';
      const target = arg && P.find(arg);
      if (mode === 'practice' && target && !P.unlocked(target)) { location.replace('#/e/' + arg); return; }
      if (nav || !practice.matches(mode, arg)) {
        if (!practice.start(mode, arg)) { location.replace('#/'); return; }
      }
      body = practice.render();
      binder = practice.bind;
      break;
    }
    case 'treino':
      if ((nav || !practice.matches('review')) && !practice.start('review')) body = reviewEmpty();
      else { body = practice.render(); binder = practice.bind; }
      break;
    case 'x':
      body = experiment.render(arg);
      binder = (root, rr) => experiment.bind(root, rr, arg);
      break;
    case 'consulta':
      if (track().instruments) {
        body = reference.render(arg || 'braco');
        binder = reference.bind;
      } else {
        body = referenceHarp.render(arg || 'mapa');
        binder = referenceHarp.bind;
      }
      break;
    case 'ajustes':
      body = settings.render();
      binder = settings.bind;
      break;
    default:
      body = `<main class="page narrow"><p>Página não encontrada.</p><a href="#/">Voltar à trilha</a></main>`;
  }

  const changed = currentView !== location.hash;
  currentView = location.hash;
  app.innerHTML = header(view) + body;
  bindHeader();
  if (binder) binder(app, () => render(false));
  if (changed) {
    window.scrollTo({ top: 0 });
    const t = (view === 'perfis' ? 'Quem vai estudar' : view === '' ? 'Trilha' : view === 'consulta' ? 'Consulta' : view === 'treino' ? 'Treino' : view === 'ajustes' ? 'Ajustes' : document.querySelector('h1')?.textContent) || '';
    document.title = (t ? t.trim() + ' · ' : '') + 'MUSIKAUS';
  }
}

function bindHeader() {
  app.querySelectorAll('[data-inst]').forEach((b) => b.addEventListener('click', () => {
    store.setSetting('inst', b.dataset.inst);
    render(false);
  }));
}

// Botões de som em qualquer lugar.
app.addEventListener('click', (ev) => {
  audio.unlock();
  handlePlayClick(ev.target);
});

document.addEventListener('keydown', (ev) => {
  const { view } = parse();
  if (['p', 'teste', 'treino'].includes(view)) {
    practice.onKey(ev, () => render(false));
    if (ev.defaultPrevented) return;
  }
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  if (ev.target.closest && ev.target.closest('input, textarea, select')) return;
  const k = ev.key.toLowerCase();
  if (k === 't') location.hash = '#/';
  else if (k === 'r') location.hash = '#/treino';
  else if (k === 'c') location.hash = '#/consulta';
  else if (k === 'p') location.hash = '#/perfis';
});

let toastTimer = null;
window.addEventListener('kt-toast', (ev) => {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
  }
  t.textContent = ev.detail;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 2600);
});

// Ao abrir o app sem endereço específico, começa pela escolha de perfil.
if (profiles.currentId()) activate(profiles.currentId());
if (!location.hash || location.hash === '#') location.replace('#/perfis');
window.addEventListener('hashchange', () => render(true));
render(true);

export { esc };
