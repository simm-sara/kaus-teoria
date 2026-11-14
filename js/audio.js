// Som sintetizado no navegador: cordas dedilhadas (Karplus-Strong simplificado)
// e cliques de ritmo. Sem arquivos de áudio.

let ctx = null;
let master = null;
let volume = 0.7;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setVolume(v) {
  volume = v;
  if (master) master.gain.value = v;
}

const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// Corda dedilhada: ruído filtrado num laço de atraso.
const bufferCache = new Map();
function pluckBuffer(midi, dur) {
  const key = midi + ':' + dur;
  if (bufferCache.has(key)) return bufferCache.get(key);
  const c = ac();
  const sr = c.sampleRate;
  const len = Math.floor(sr * dur);
  const buf = c.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  const period = Math.max(2, Math.round(sr / freq(midi)));
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  // Graves decaem mais devagar, como num baixo.
  const decay = midi < 45 ? 0.998 : 0.996;
  let idx = 0;
  let prev = 0;
  for (let i = 0; i < len; i++) {
    const cur = ring[idx];
    const next = ring[(idx + 1) % period];
    const v = decay * 0.5 * (cur + next);
    ring[idx] = v;
    data[i] = cur * 0.6 + prev * 0.4;
    prev = cur;
    idx = (idx + 1) % period;
  }
  bufferCache.set(key, buf);
  return buf;
}

export function playNote(midi, when = 0, dur = 1.6, gain = 0.8) {
  const c = ac();
  const src = c.createBufferSource();
  src.buffer = pluckBuffer(midi, dur);
  const g = c.createGain();
  const t = c.currentTime + when;
  g.gain.setValueAtTime(gain, t);
  g.gain.setTargetAtTime(0, t + dur * 0.8, 0.08);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = midi < 45 ? 1800 : 4200;
  src.connect(lp);
  lp.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + dur + 0.2);
}

// Notas em sequência (melódico).
export function playSequence(midis, gap = 0.55) {
  midis.forEach((m, i) => playNote(m, i * gap, 1.4));
  return midis.length * gap + 1;
}

// Acorde "dedilhado" rápido, do grave para o agudo.
export function playChord(midis, strum = 0.035) {
  const sorted = midis.slice().sort((a, b) => a - b);
  sorted.forEach((m, i) => playNote(m, i * strum, 2.2, 0.55));
  return 2.4;
}

// Intervalo: primeiro separado, depois junto.
export function playInterval(a, b) {
  playNote(a, 0, 1.2);
  playNote(b, 0.6, 1.2);
  playNote(a, 1.4, 1.6, 0.6);
  playNote(b, 1.4, 1.6, 0.6);
  return 3.2;
}

function click(when, accent = false, high = false) {
  const c = ac();
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'square';
  o.frequency.value = high ? 1500 : accent ? 1000 : 800;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.3, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.06);
}

function thump(when, midi) {
  playNote(midi, when, 0.35, 0.9);
}

// Toca um padrão rítmico: steps = array de 0/1, stepDur em segundos.
// O metrônomo marca cada tempo (a cada `perBeat` passos).
export function playRhythm(steps, { bpm = 90, perBeat = 4, midi = 52, metronome = true } = {}) {
  const stepDur = 60 / bpm / perBeat;
  const countIn = perBeat * 4 === steps.length ? 0 : 0;
  if (metronome) {
    for (let i = 0; i < steps.length; i += perBeat) click(countIn + i * stepDur, i === 0);
  }
  steps.forEach((on, i) => {
    if (on) thump(countIn + i * stepDur, midi);
  });
  return steps.length * stepDur + 0.6;
}

export function unlock() {
  ac();
}
