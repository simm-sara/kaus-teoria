import * as store from '../store.js';
import * as audio from '../audio.js';
import { ELEMENTS } from '../content.js';

export function render() {
  const s = store.settings();
  const st = store.get();
  const done = ELEMENTS.filter((e) => (st.els[e.id] || {}).v >= 2 || (st.els[e.id] || {}).b >= 2).length;
  return `<main class="page narrow" id="conteudo">
    <div class="page-head"><h1 class="display page-title">Ajustes</h1></div>

    <section class="card soft">
      <h2 class="display h3">Progresso</h2>
      <p style="margin:0">${st.xp} XP · ${done} elementos praticados · ${st.log.length} sessões registradas.</p>
      <p class="caption" style="margin:0;font-size:11px">O progresso fica salvo neste navegador. Exporte de vez em quando para não perder, ou para levar para outro computador.</p>
      <div class="btn-row">
        <button type="button" class="btn" data-export>Exportar progresso</button>
        <label class="btn ghost" for="imp" style="cursor:pointer">Importar progresso</label>
        <input type="file" id="imp" accept="application/json,.json" class="sr-only">
      </div>
    </section>

    <section class="card soft">
      <h2 class="display h3">Trilha livre</h2>
      <label style="display:flex;gap:12px;align-items:flex-start;cursor:pointer">
        <input type="checkbox" data-free ${s.free ? 'checked' : ''} style="width:20px;height:20px;margin-top:2px;accent-color:#1A1A1A">
        <span>Liberar todos os elementos, sem precisar seguir a ordem. O progresso continua sendo registrado.</span>
      </label>
    </section>

    <section class="card soft">
      <h2 class="display h3">Som</h2>
      <div class="field"><label for="vol">Volume</label><input type="range" id="vol" min="0" max="1" step="0.05" value="${s.volume}" style="accent-color:#1A1A1A;max-width:320px"></div>
      <div class="btn-row"><button type="button" class="btn ghost small" data-test-sound>Testar som</button></div>
    </section>

    <section class="card soft">
      <h2 class="display h3">Atalhos de teclado</h2>
      <ul class="list-plain" style="font-size:12px">
        <li><span>Responder (múltipla escolha)</span><span>1 a 4</span></li>
        <li><span>Confirmar / próxima pergunta</span><span>Enter</span></li>
        <li><span>Ouvir de novo</span><span>Espaço</span></li>
        <li><span>Trilha · Treino · Consulta</span><span>T · R · C</span></li>
      </ul>
    </section>

    <section class="card soft">
      <h2 class="display h3">Recomeçar</h2>
      <p style="margin:0;font-size:12px">Apaga todo o progresso deste navegador. Não dá para desfazer (a não ser que você tenha exportado antes).</p>
      <div class="btn-row"><button type="button" class="btn ghost" data-reset>Apagar progresso</button></div>
    </section>
  </main>`;
}

const toast = (msg) => window.dispatchEvent(new CustomEvent('kt-toast', { detail: msg }));

export function bind(root, rerender) {
  root.querySelector('[data-export]').addEventListener('click', () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kaus-teoria-progresso-${store.today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  root.querySelector('#imp').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      store.importJSON(await file.text());
      toast('Progresso importado.');
      rerender();
    } catch (e) {
      toast('Não consegui ler esse arquivo.');
    }
  });
  root.querySelector('[data-free]').addEventListener('change', (ev) => {
    store.setSetting('free', ev.target.checked);
    toast(ev.target.checked ? 'Todos os elementos liberados.' : 'Trilha em ordem novamente.');
  });
  const vol = root.querySelector('#vol');
  vol.addEventListener('input', () => {
    audio.setVolume(Number(vol.value));
    store.setSetting('volume', Number(vol.value));
  });
  root.querySelector('[data-test-sound]').addEventListener('click', () => audio.playChord([48, 52, 55, 60]));
  root.querySelector('[data-reset]').addEventListener('click', () => {
    if (confirm('Apagar todo o progresso? Isso não pode ser desfeito.')) {
      store.reset();
      toast('Progresso apagado.');
      rerender();
    }
  });
}
