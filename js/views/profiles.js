// Tela inicial: quem vai estudar?

import * as profiles from '../profiles.js';
import { TRACKS } from '../track.js';
import { esc } from '../ui/blocks.js';

let editing = null;

function summary(p) {
  const data = profiles.peek(p) || { els: {}, xp: 0, streak: {} };
  const T = TRACKS[p.track];
  const total = T.NON_EXP.length;
  const lvl = (e) => {
    const r = data.els[e.id] || { v: 0, b: 0 };
    if (e.kind === 'v') return r.v;
    if (e.kind === 'b') return r.b;
    return T.usesInstrument(e) ? Math.min(r.v, r.b) : Math.max(r.v, r.b);
  };
  const dom = T.NON_EXP.filter((e) => lvl(e) >= 3).length;
  const practiced = T.NON_EXP.filter((e) => lvl(e) >= 2).length;
  return { total, dom, practiced, xp: data.xp || 0 };
}

export function render() {
  const cur = profiles.currentId();
  const cards = profiles.PROFILES.map((p) => {
    const T = TRACKS[p.track];
    const s = summary(p);
    const name = profiles.nameOf(p);
    const isEditing = editing === p.id;
    return `<div class="profile ${cur === p.id ? 'last' : ''}" data-profile="${p.id}" role="button" tabindex="0" aria-label="Estudar como ${esc(name)}: trilha de ${esc(T.name.toLowerCase())}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div class="ptile"><span style="font-size:10px;font-weight:500">${s.practiced}/${s.total}</span><span class="sym">${T.symbol}</span></div>
        ${cur === p.id ? '<span class="label">Último perfil usado</span>' : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <span class="label construction">Trilha de ${esc(T.name.toLowerCase())}</span>
        ${isEditing
          ? `<form class="profile-edit" data-rename="${p.id}"><label class="sr-only" for="nm-${p.id}">Nome</label><input id="nm-${p.id}" type="text" value="${esc(name)}" maxlength="30"><button class="btn small" type="submit">Salvar</button></form>`
          : `<span class="display pname">${esc(name)}</span>`}
      </div>
      <p style="margin:0;font-size:12px;color:#6B6760">${s.dom} de ${s.total} elementos dominados · ${s.xp.toLocaleString('pt-BR')} XP</p>
      <div style="display:flex;gap:16px;align-items:center;margin-top:auto">
        <span class="btn small">Estudar</span>
        ${isEditing ? '' : `<button type="button" class="btn ghost small" data-edit="${p.id}">Trocar nome</button>`}
      </div>
    </div>`;
  }).join('');
  return `<main class="page" id="conteudo">
    <div class="page-head"><div style="display:flex;flex-direction:column;gap:12px"><span class="label">MUSIKAUS</span><h1 class="display page-title">Quem vai estudar?</h1></div></div>
    <div class="profiles">${cards}</div>
    <p class="caption" style="margin:0">Cada perfil tem a sua trilha e o seu progresso, guardados separadamente neste navegador.</p>
  </main>`;
}

export function bind(root, rerender, choose) {
  root.querySelectorAll('[data-profile]').forEach((el) => {
    const go = (ev) => {
      if (ev.target.closest('[data-edit], form')) return;
      choose(el.dataset.profile);
    };
    el.addEventListener('click', go);
    el.addEventListener('keydown', (ev) => {
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target === el) {
        ev.preventDefault();
        choose(el.dataset.profile);
      }
    });
  });
  root.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', (ev) => {
    ev.stopPropagation();
    editing = b.dataset.edit;
    rerender();
    const inp = root.querySelector(`#nm-${editing}`);
    if (inp) { inp.focus(); inp.select(); }
  }));
  root.querySelectorAll('[data-rename]').forEach((f) => f.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const v = f.querySelector('input').value;
    if (v.trim()) profiles.rename(f.dataset.rename, v);
    editing = null;
    rerender();
  }));
}
