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

// Palheta (gaita): duas ondas levemente desafinadas, filtradas, com ataque suave.
export function playReed(midi, when = 0, dur = 0.8, gain = 0.5, { vibrato = false } = {}) {
  const c = ac();
  const t = c.currentTime + when;
  const f = freq(midi);
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(gain, t + 0.05);
  out.gain.setValueAtTime(gain, t + Math.max(0.06, dur - 0.08));
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = Math.min(4200, f * 6);
  lp.Q.value = 1.2;
  lp.connect(out);
  out.connect(master);
  const oscs = [['sawtooth', 0, 0.35], ['square', 6, 0.18]].map(([type, cents, g]) => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = cents;
    const og = c.createGain();
    og.gain.value = g;
    o.connect(og);
    og.connect(lp);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  });
  if (vibrato) {
    const lfo = c.createOscillator();
    const depth = c.createGain();
    lfo.frequency.value = 5.5;
    depth.gain.value = gain * 0.45;
    lfo.connect(depth);
    depth.connect(out.gain);
    lfo.start(t + 0.3);
    lfo.stop(t + dur);
    oscs.forEach((o) => {
      const fd = c.createGain();
      fd.gain.value = 8;
      lfo.connect(fd);
      fd.connect(o.detune);
    });
  }
}

// Notas em sequência (melódico).
export function playSequence(midis, gap = 0.55, reed = false) {
  midis.forEach((m, i) => (reed ? playReed(m, i * gap, gap * 0.92) : playNote(m, i * gap, 1.4)));
  return midis.length * gap + 1;
}

// Notas com durações (em tempos): [{midi, dur}].
export function playTimed(items, { beat = 0.45, reed = true } = {}) {
  let t = 0;
  for (const it of items) {
    const d = (it.dur || 1) * beat;
    if (it.midi) (reed ? playReed(it.midi, t, d * 0.94) : playNote(it.midi, t, d + 0.4));
    t += d;
  }
  return t + 0.5;
}

// Acorde "dedilhado" rápido, do grave para o agudo.
export function playChord(midis, strum = 0.035, reed = false) {
  const sorted = midis.slice().sort((a, b) => a - b);
  if (reed) {
    sorted.forEach((m) => playReed(m, 0, 1.4, 0.32));
    return 1.6;
  }
  sorted.forEach((m, i) => playNote(m, i * strum, 2.2, 0.55));
  return 2.4;
}

// Ritmo de trem: acordes soprado e puxado em colcheias, sopra-sopra-puxa-puxa.
export function playTrain(blow, draw, { bars = 2, bpm = 96 } = {}) {
  const step = 60 / bpm / 2;
  for (let i = 0; i < bars * 8; i++) {
    const chord = Math.floor(i / 2) % 2 === 0 ? blow : draw;
    const accent = i % 2 === 0;
    chord.forEach((m) => playReed(m, i * step, step * 0.85, accent ? 0.3 : 0.16));
  }
  return bars * 8 * step + 0.4;
}

// Intervalo: primeiro separado, depois junto.
export function playInterval(a, b, reed = false) {
  if (reed) {
    playReed(a, 0, 0.6);
    playReed(b, 0.7, 0.6);
    playReed(a, 1.5, 1.2, 0.3);
    playReed(b, 1.5, 1.2, 0.3);
    return 3;
  }
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
