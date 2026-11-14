import * as P from '../progress.js';
import * as store from '../store.js';
import { esc } from '../ui/blocks.js';
import { analyzerHTML, bindAnalyzer } from './analyzer.js';

export function render(id) {
  const e = P.find(id);
  if (!e || e.kind !== 'x') return `<main class="page narrow"><p>Experimento não encontrado.</p><a href="#/">Voltar à trilha</a></main>`;
  const st = P.status(e);
  const data = store.experiment(e.id);
  const checks = data.checks || [];
  const done = !!data.done;
  return `<main class="page narrow" id="conteudo">
    <a href="#/" class="label" style="text-decoration:none">← Trilha</a>
    <div class="el-head">
      <div class="big-tile ${st === 'cur' ? 'cur' : st === 'lock' ? 'lock' : 'exp'}"><span class="n">${e.id}</span><span class="sym">${e.s}</span></div>
      <div>
        <span class="label construction">Experimento · Período ${e.period}</span>
        <h1 class="display page-title" style="font-size:clamp(36px,5vw,56px)">${esc(e.name)}</h1>
        <p style="margin:0;max-width:560px">${esc(e.desc)}</p>
      </div>
    </div>
    ${st === 'lock' ? '<div class="tip">Este experimento libera quando os 5 elementos do período estiverem pelo menos praticados. Você já pode ler e se preparar.</div>' : ''}
    ${done ? `<div class="tip">Concluído em ${esc(data.at.split('-').reverse().join('/'))}. Você pode refazer com outra música quando quiser.</div>` : ''}

    <section style="display:flex;flex-direction:column;gap:14px">
      <h2 class="display h2">Passos</h2>
      <ol class="steps">
        ${e.steps.map((s, i) => `<li><input type="checkbox" id="st${i}" data-step="${i}" ${checks[i] ? 'checked' : ''}><label for="st${i}">${esc(s)}</label></li>`).join('')}
      </ol>
    </section>

    ${e.analyzer ? `<section style="display:flex;flex-direction:column;gap:14px"><h2 class="display h2">Analisador de cifra</h2>${analyzerHTML(data.chords || '')}</section>` : ''}

    <section style="display:flex;flex-direction:column;gap:10px">
      <h2 class="display h2">Anotações</h2>
      <div class="field"><label for="xp-song">Música</label><input type="text" id="xp-song" value="${esc(data.song || '')}" placeholder="Nome da música e artista"></div>
      <div class="field"><label for="xp-notes">O que eu descobri</label><textarea id="xp-notes" placeholder="Tom, graus, acordes de fora, o que foi difícil...">${esc(data.notes || '')}</textarea></div>
      <span class="caption">Salvo automaticamente neste navegador.</span>
    </section>

    <div class="btn-row">
      <button type="button" class="btn" data-finish ${st === 'lock' ? 'disabled' : ''}>${done ? 'Marcar como concluído de novo' : 'Concluir experimento (+100 XP)'}</button>
    </div>
  </main>`;
}

export function bind(root, rerender, id) {
  const e = P.find(id);
  if (!e) return;
  const save = (patch) => store.saveExperiment(e.id, patch);
  root.querySelectorAll('[data-step]').forEach((c) => c.addEventListener('change', () => {
    const checks = [...root.querySelectorAll('[data-step]')].map((x) => x.checked);
    save({ checks });
  }));
  const song = root.querySelector('#xp-song');
  const notes = root.querySelector('#xp-notes');
  song.addEventListener('input', () => save({ song: song.value }));
  notes.addEventListener('input', () => save({ notes: notes.value }));
  bindAnalyzer(root, (chords) => save({ chords }));
  const fin = root.querySelector('[data-finish]');
  fin.addEventListener('click', () => {
    store.completeExperiment(e.id, { song: song.value, notes: notes.value });
    window.dispatchEvent(new CustomEvent('kt-toast', { detail: `Experimento ${e.id} concluído. +100 XP` }));
    rerender();
  });
}
