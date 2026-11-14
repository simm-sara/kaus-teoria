// Analisador de cifra: cola a sequência de acordes e vê tom, graus e funções.

import { analyzeProgression, name, FUNCTION_NAMES } from '../theory.js';
import { esc } from '../ui/blocks.js';

export function analyzerHTML(initial = '') {
  return `<div class="analyzer" style="display:flex;flex-direction:column;gap:14px">
    <div class="field">
      <label for="an-input">Acordes, separados por espaço, vírgula ou traço</label>
      <textarea id="an-input" style="min-height:80px" placeholder="Ex.: C A7 Dm7 G7 C">${esc(initial)}</textarea>
    </div>
    <div data-an-out>${resultHTML(initial)}</div>
  </div>`;
}

function splitChords(text) {
  return text.split(/[\s,|;]+|\s-\s|–|—/).map((s) => s.trim()).filter(Boolean);
}

function resultHTML(text) {
  const list = splitChords(text || '');
  if (!list.length) return '<p class="caption" style="margin:0;font-size:12px">Cole os acordes para ver o tom provável, o grau e a função de cada um.</p>';
  const r = analyzeProgression(list);
  if (!r.key) return `<p style="margin:0">Não reconheci nenhum acorde. Confira a escrita (ex.: Am7, F#m7(b5), G/B).</p>`;
  const keyName = name(r.key.root) + (r.key.type === 'maior' ? ' maior' : ' menor');
  const chips = r.items.map((it) => {
    const cls = it.kind === 'fora do tom' ? 'chip out' : it.kind === 'diatônico' ? 'chip' : 'chip sec';
    return `<div class="${cls}"><span class="sym">${esc(it.chord.symbol)}</span><span class="deg">${esc(it.label)}${it.fn ? ' · ' + it.fn : ''}</span><span class="kind">${esc(it.kind)}</span></div>`;
  }).join('');
  const counts = {};
  r.items.forEach((it) => { counts[it.kind] = (counts[it.kind] || 0) + 1; });
  return `<div style="display:flex;flex-direction:column;gap:12px">
    <div><span class="label">Tom provável</span><div class="display h2" style="margin-top:4px">${keyName}</div></div>
    <div class="analysis">${chips}</div>
    <p class="caption" style="margin:0;font-size:11px">${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(' · ')}. Funções: T = ${FUNCTION_NAMES.T}, SD = ${FUNCTION_NAMES.SD}, D = ${FUNCTION_NAMES.D}.</p>
    ${r.invalid.length ? `<p class="caption" style="margin:0;font-size:11px">Não reconheci: ${r.invalid.map(esc).join(', ')}</p>` : ''}
    <p class="caption" style="margin:0;font-size:11px">A análise é automática e serve de ponto de partida: confira com o ouvido, principalmente em músicas que mudam de tom.</p>
  </div>`;
}

export function bindAnalyzer(root, onChange) {
  const input = root.querySelector('#an-input');
  const out = root.querySelector('[data-an-out]');
  if (!input) return;
  let t = null;
  input.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      out.innerHTML = resultHTML(input.value);
      if (onChange) onChange(input.value);
    }, 250);
  });
}
