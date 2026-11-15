// Trilha da gaita (harmônica diatônica em Dó), para quem começa do zero:
// nunca tocou um instrumento e não sabe teoria musical.

import * as H from '../harp.js';
import { GENERATORS as BASE, mcQuestion as mc, fixedPool as fixed } from '../exercises.js';
import { pick, rand, shuffle, sample } from '../theory.js';

// ── Utilidades ──────────────────────────────────────────

const N = (m) => H.noteName(m);
const NS = (m) => `${H.noteName(m)} (${H.solfege(m)})`;
const MID = H.MIDDLE_SCALE; // 4 -4 5 -5 6 -6 -7 7
const cell = (tab) => {
  const p = H.parseTab(tab);
  return { h: p.hole, d: p.dir };
};
const seqMidi = (tabs) => tabs.map(H.tabToMidi);

// ── Geradores ───────────────────────────────────────────

function holeNote() {
  const h = 1 + rand(10);
  const d = pick(['b', 'd']);
  const m = (d === 'b' ? H.BLOW : H.DRAW)[h - 1];
  const others = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].filter((x) => x !== N(m));
  const lbl = (n) => `${n} (${{ C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si' }[n]})`;
  return mc(`Que nota sai ao ${d === 'b' ? 'soprar' : 'puxar'} o furo ${h}?`, lbl(N(m)), others.map(lbl), {
    show: { harp: { cells: [{ h, d, accent: true }] } },
    audio: { kind: 'seq', notes: [m], reed: true },
    explain: `${d === 'b' ? 'Soprar' : 'Puxar'} o furo ${h} (${H.tabOf(h, d)}) dá ${NS(m)}.`,
  });
}

function findNote() {
  const t = pick(MID);
  const m = H.tabToMidi(t);
  const valid = H.cellsFor(m % 12).filter((c) => c.h >= 4 && c.h <= 7);
  return {
    type: 'harp', mode: 'one', holes: [4, 7], valid,
    prompt: `Na parte do meio da gaita (furos 4 a 7), onde está a nota ${NS(m)}? Clique em soprar ou puxar no furo certo.`,
    explain: `${NS(m)} = ${valid.map((c) => H.tabOf(c.h, c.d)).join(' ou ')}.`,
  };
}

function blowOrDraw() {
  const t = pick(MID.concat(['1', '-1', '2', '-2', '3', '-3', '8', '-8', '9', '-9']));
  const p = H.parseTab(t);
  const m = H.tabToMidi(t);
  return mc(`Para tocar ${NS(m)} no furo ${p.hole}, você sopra ou puxa?`, p.dir === 'b' ? `Soprar (${p.hole})` : `Puxar (-${p.hole})`, [`Soprar (${p.hole})`, `Puxar (-${p.hole})`], {
    show: { harp: { cells: [], showNotes: true } },
    explain: `No furo ${p.hole}: soprar dá ${N(H.BLOW[p.hole - 1])}, puxar dá ${N(H.DRAW[p.hole - 1])}.`,
  });
}

function readTab() {
  const h = 1 + rand(10);
  const d = pick(['b', 'd']);
  const t = H.tabOf(h, d);
  return mc(`Na tablatura, o que significa "${t}"?`, `${d === 'b' ? 'Soprar' : 'Puxar'} o furo ${h}`, [`${d === 'b' ? 'Puxar' : 'Soprar'} o furo ${h}`, `${d === 'b' ? 'Soprar' : 'Puxar'} o furo ${h === 10 ? 9 : h + 1}`, `${d === 'b' ? 'Soprar' : 'Puxar'} ${h} furos ao mesmo tempo`, `Tocar a nota ${h} vezes`], {
    explain: 'O número é o furo. Sem sinal: soprar. Com o sinal de menos (-): puxar o ar.',
  });
}

function tabToNotes() {
  const start = rand(MID.length - 2);
  const tabs = MID.slice(start, start + 3);
  const notes = tabs.map((t) => N(H.tabToMidi(t))).join(' ');
  const wrong = [
    MID.slice(Math.min(start + 1, MID.length - 3), Math.min(start + 1, MID.length - 3) + 3),
    MID.slice(Math.max(start - 1, 0), Math.max(start - 1, 0) + 3),
    tabs.slice().reverse(),
  ].map((ts) => ts.map((t) => N(H.tabToMidi(t))).join(' '));
  return mc(`Quais notas a tablatura ${tabs.join(' ')} toca?`, notes, wrong.concat(['C E G', 'D F A']), {
    explain: tabs.map((t) => `${t} = ${N(H.tabToMidi(t))}`).join(' · '),
  });
}

function noteToTab() {
  const t = pick(MID);
  const m = H.tabToMidi(t);
  const options = MID.filter((x) => H.tabToMidi(x) % 12 !== m % 12);
  return mc(`Qual tablatura toca ${NS(m)} na parte do meio da gaita?`, t === '7' ? '4 ou 7' : t === '4' ? '4 ou 7' : t, options, {
    explain: m % 12 === 0 ? 'Dó aparece no furo 4 soprado e, uma oitava acima, no furo 7 soprado.' : `${NS(m)} = ${t}.`,
  });
}

function scaleNext() {
  const i = rand(MID.length - 1);
  const up = Math.random() < 0.7 || i === 0;
  const k = up ? i : i + 1;
  const ans = up ? MID[i + 1] : MID[i];
  return mc(`Subindo a escala de Dó (${MID.join(' ')}), o que vem ${up ? 'depois' : 'antes'} de ${MID[up ? i : k]}?`, ans, MID.filter((x) => x !== ans && x !== MID[up ? i : k]), {
    explain: 'A escala do meio: 4 -4 5 -5 6 -6 -7 7. Repare que no furo 7 a ordem inverte: puxa antes de soprar.',
  });
}

function scaleMark() {
  const valid = MID.map(cell);
  return {
    type: 'harp', mode: 'all', holes: [4, 7], valid,
    prompt: 'Marque todas as notas da escala de Dó nos furos 4 a 7 (são 8 casas). Depois confirme.',
    explain: 'Nos furos 4 a 7 todas as 8 casas fazem parte da escala: 4 -4 5 -5 6 -6 -7 7.',
  };
}

function higherLower() {
  const tabs = MID.concat(['1', '-1', '2', '3', '-3', '8', '-8', '9']);
  const a = pick(tabs);
  let b = pick(tabs);
  if (Math.random() < 0.15) b = a;
  const ma = H.tabToMidi(a);
  const mb = H.tabToMidi(b);
  const ans = mb > ma ? 'Mais aguda' : mb < ma ? 'Mais grave' : 'Igual';
  return mc('Ouça as duas notas. A segunda é mais aguda, mais grave ou igual à primeira?', ans, ['Mais aguda', 'Mais grave', 'Igual'], {
    audio: { kind: 'seq', notes: [ma, mb], reed: true, gap: 0.8 },
    explain: `Primeira: ${N(ma)} (${a}). Segunda: ${N(mb)} (${b}). ${ans === 'Igual' ? 'Mesma nota.' : ans === 'Mais aguda' ? 'A segunda é mais aguda (mais fina).' : 'A segunda é mais grave (mais grossa).'}`,
  });
}

function stepOrLeap() {
  const i = rand(MID.length);
  let j = rand(MID.length);
  while (j === i || H.tabToMidi(MID[j]) === H.tabToMidi(MID[i])) j = rand(MID.length);
  const dist = Math.abs(i - j);
  const ans = dist === 1 ? 'Passo (nota vizinha)' : 'Salto';
  const audioQ = Math.random() < 0.5;
  return mc(audioQ ? 'Ouça. As duas notas são vizinhas na escala (passo) ou há notas entre elas (salto)?' : `De ${MID[i]} para ${MID[j]}: passo ou salto?`, ans, ['Passo (nota vizinha)', 'Salto'], {
    audio: audioQ ? { kind: 'seq', notes: [H.tabToMidi(MID[i]), H.tabToMidi(MID[j])], reed: true, gap: 0.8 } : undefined,
    explain: `${MID[i]} (${N(H.tabToMidi(MID[i]))}) e ${MID[j]} (${N(H.tabToMidi(MID[j]))}): ${dist === 1 ? 'vizinhas na escala.' : `há ${dist - 1} nota${dist > 2 ? 's' : ''} no meio.`}`,
  });
}

function tabEar() {
  const start = rand(MID.length - 2);
  const up = Math.random() < 0.5;
  let tabs = MID.slice(start, start + 3);
  if (!up) tabs = tabs.slice().reverse();
  const key = tabs.join(' ');
  const others = new Set();
  while (others.size < 3) {
    const s = rand(MID.length - 2);
    let t = MID.slice(s, s + 3);
    if (Math.random() < 0.5) t = t.slice().reverse();
    if (t.join(' ') !== key) others.add(t.join(' '));
  }
  return mc('Ouça a frase de 3 notas. Qual tablatura foi tocada?', key, [...others], {
    audio: { kind: 'seq', notes: seqMidi(tabs), reed: true, gap: 0.6 },
    explain: `Foi ${key}: ${tabs.map((t) => N(H.tabToMidi(t))).join(' ')}, ${up ? 'subindo' : 'descendo'}.`,
  });
}

function sameNote() {
  const pairs = [['-2', '3', 'G (Sol)'], ['-3', '-7', 'B (Si), em oitavas diferentes'], ['4', '7', 'C (Dó), em oitavas diferentes'], ['1', '4', 'C (Dó), em oitavas diferentes']];
  const [a, b, nm] = pick(pairs);
  if (a === '-2') {
    return mc('Puxar o furo 2 e soprar o furo 3 dão...', 'a mesma nota: G (Sol)', ['notas diferentes', 'G e A', 'C e D'], {
      explain: 'É a única nota repetida exatamente igual na gaita: -2 = 3 = G.',
      audio: { kind: 'seq', notes: [H.tabToMidi('-2'), H.tabToMidi('3')], reed: true, gap: 0.8 },
    });
  }
  return mc(`${a} e ${b} tocam qual nota?`, nm, ['G (Sol)', 'D (Ré), na mesma oitava', 'Notas que não têm nada a ver'].filter((x) => x !== nm), {
    explain: `${a} = ${N(H.tabToMidi(a))} e ${b} = ${N(H.tabToMidi(b))}.`,
  });
}

function octaveHole() {
  const opts = [['C', [1, 4, 7, 10]], ['E', [2, 5, 8]], ['G', [3, 6, 9]]];
  const [n, holes] = pick(opts);
  const i = rand(holes.length - 1);
  const up = Math.random() < 0.5;
  const from = up ? holes[i] : holes[i + 1];
  const to = up ? holes[i + 1] : holes[i];
  return mc(`O furo ${from} soprado dá ${n}. Onde está o ${n} uma oitava ${up ? 'acima' : 'abaixo'}?`, `Furo ${to} soprado`, [from + 1, from + 2, from - 1, from - 2, to + 1].filter((x) => x >= 1 && x <= 10 && x !== to).map((x) => `Furo ${x} soprado`), {
    explain: 'Soprando, as notas se repetem a cada 3 furos: C E G | C E G | C E G | C.',
  });
}

function graveAgudo() {
  const hs = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
  const low = Math.random() < 0.5;
  const ans = low ? Math.min(...hs) : Math.max(...hs);
  return mc(`Qual destes furos tem o som mais ${low ? 'grave (grosso)' : 'agudo (fino)'}?`, `Furo ${ans}`, hs.filter((h) => h !== ans).map((h) => `Furo ${h}`), {
    explain: 'Com os números para cima, a esquerda (furo 1) é o grave e a direita (furo 10) é o agudo.',
  });
}

function chordQ() {
  const c = pick(H.CHORDS.slice(0, 3));
  return mc(`O que soa quando você ${c.desc} ao mesmo tempo?`, `Acorde de ${c.name} (${c.notes})`, H.CHORDS.slice(0, 3).filter((x) => x.name !== c.name).map((x) => `Acorde de ${x.name} (${x.notes})`).concat(['Uma nota só, mais forte']), {
    audio: { kind: 'chord', notes: seqMidi(c.tabs), reed: true },
    explain: `${c.tabs.join(' ')} = ${c.notes}: acorde de ${c.name}.`,
  });
}

function songRecognize() {
  const s = pick(H.SONGS);
  const seq = H.parseSeq(s.tab).filter((x) => !x.bar && !x.rest).slice(0, 7);
  return mc('Ouça o começo da música. Qual é?', s.name, H.SONGS.filter((x) => x.id !== s.id).map((x) => x.name), {
    audio: { kind: 'tab', seq: seq.map((x) => ({ midi: x.midi, dur: x.dur })), reed: true },
    explain: `${s.name}: começa com ${seq.map((x) => x.tab).join(' ')}.`,
  });
}

function songTab() {
  const s = pick(H.SONGS);
  const first = (x) => H.parseSeq(x.tab).filter((y) => !y.bar && !y.rest).slice(0, 5).map((y) => y.tab).join(' ');
  return mc(`Qual tablatura é o começo de "${s.name}"?`, first(s), H.SONGS.filter((x) => x.id !== s.id && first(x) !== first(s)).map(first), {
    explain: `${s.name}: ${first(s)}...`,
  });
}

function bendQ() {
  const holes = Object.keys(H.DRAW_BENDS).map(Number);
  const h = pick(holes);
  const steps = 1 + rand(H.DRAW_BENDS[h]);
  const from = H.DRAW[h - 1];
  const to = from - steps;
  const ans = N(to);
  return mc(`Puxando o furo ${h} (${N(from)}) com bend de ${steps === 1 ? 'meio tom' : steps === 2 ? 'um tom' : 'um tom e meio'}, a nota desce para:`, ans, [N(from - steps + 1), N(from - steps - 1), N(from + 1), N(from)].filter((x) => x !== ans), {
    explain: `${N(from)} menos ${steps} semitom${steps > 1 ? 's' : ''} = ${ans} ("-${h}${"'".repeat(steps)}" na tablatura).`,
  });
}

function positionQ() {
  return fixed([
    ['Tocar a gaita em Dó "na 1ª posição" significa tocar no tom de...', 'Dó (C)', ['Sol (G)', 'Ré (D)', 'Lá (A)'], 'Primeira posição = o tom da própria gaita.'],
    ['Numa gaita em Dó, a 2ª posição (cross harp) toca no tom de...', 'Sol (G)', ['Dó (C)', 'Fá (F)', 'Ré (D)'], 'Uma 5ª acima do tom da gaita: C → G. É a posição do blues e do rock.'],
    ['Na 2ª posição, qual é a "nota de casa" (tônica)?', '-2 (ou 3): Sol', ['4: Dó', '-4: Ré', '5: Mi'], 'G aparece em -2, 3, 6 e 9.'],
    ['Por que a 2ª posição é tão usada no blues?', 'Porque as notas puxadas (e os bends) caem nas notas mais expressivas do blues', ['Porque é mais fácil soprar', 'Porque não usa o furo 4', 'Porque é a única que tem acordes'], 'Puxando o ar você controla melhor a nota, e consegue fazer bends.'],
  ])();
}

// Fatos fixos por assunto.
const holdFacts = fixed([
  ['Como segurar a gaita para ler a tablatura?', 'Números para cima, furo 1 à esquerda', ['Números para baixo, furo 1 à direita', 'De pé, com os furos para cima', 'Tanto faz'], 'Assim o grave fica à esquerda e o agudo à direita, como num piano.'],
  ['Quantos furos tem a gaita diatônica?', '10', ['8', '12', '16'], 'De 1 (grave) a 10 (agudo).'],
  ['Em cada furo, quantas notas dá para tirar sem técnica especial?', '2: uma soprando e uma puxando', ['1', '3', '4'], 'Por isso 10 furos dão 20 notas.'],
  ['O que significa "gaita em Dó" (C)?', 'Que ela foi afinada para tocar no tom de Dó', ['Que só toca a nota Dó', 'Que é para crianças', 'Que tem 10 furos'], 'Existem gaitas em todos os tons. A de Dó é a padrão para começar.'],
]);

const breathFacts = fixed([
  ['De onde deve vir o ar para tocar?', 'Do diafragma (barriga), com a garganta relaxada', ['Das bochechas, sopradas com força', 'Só do nariz', 'Do peito, com os ombros subindo'], 'A gaita precisa de pouco ar. Respire como se fosse bocejar devagar.'],
  ['Para tirar um som bonito, você deve...', 'soprar e puxar de leve', ['soprar com o máximo de força', 'morder a gaita', 'prender a respiração'], 'Força demais desafina e cansa. Som bom vem de ar relaxado.'],
  ['Quando ficar sem ar tocando uma música, o que fazer?', 'Aproveitar as pausas e as notas puxadas para respirar', ['Parar a música', 'Soprar mais forte', 'Tocar mais rápido'], 'Na gaita você também respira pelo instrumento: puxar é inspirar.'],
]);

const singleFacts = fixed([
  ['Para tocar uma nota só (um furo), a boca deve...', 'formar um biquinho, como para assobiar ou tomar canudinho', ['cobrir 3 furos', 'ficar bem aberta', 'encostar só os dentes'], 'O biquinho (pucker) isola um furo. Os lábios ficam relaxados e úmidos.'],
  ['Se você ouve duas notas ao mesmo tempo quando queria uma, provavelmente...', 'a boca está cobrindo mais de um furo', ['a gaita está quebrada', 'você está soprando pouco', 'está na posição errada'], 'Feche um pouco o biquinho ou mova a gaita até sobrar um furo só.'],
  ['Para mudar de furo, o que é melhor mexer?', 'A gaita, deslizando entre os lábios', ['A cabeça inteira', 'Os dedos tapando os furos', 'Nada: a boca alcança todos'], 'A boca fica parada; a gaita desliza para os lados.'],
]);

const notesFacts = fixed([
  ['Quantas notas musicais diferentes têm nome próprio (as naturais)?', '7: Dó Ré Mi Fá Sol Lá Si', ['5', '10', '12'], 'Depois do Si, volta o Dó, mais agudo.'],
  ['Na cifra e na gaita, Dó é escrito como...', 'C', ['D', 'A', 'Do'], 'C D E F G A B = Dó Ré Mi Fá Sol Lá Si.'],
  ['A letra A é qual nota?', 'Lá', ['Dó', 'Fá', 'Ré'], 'A = Lá. As letras começam pelo Lá: A B C D E F G.'],
  ['A letra E é qual nota?', 'Mi', ['Ré', 'Fá', 'Si'], 'E = Mi.'],
  ['A letra G é qual nota?', 'Sol', ['Lá', 'Si', 'Fá'], 'G = Sol.'],
]);

const scaleFacts = fixed([
  ['O que é uma escala?', 'Uma sequência de notas, em ordem, do grave para o agudo', ['Um acorde de três notas', 'Uma música inteira', 'O volume do som'], 'A escala de Dó: Dó Ré Mi Fá Sol Lá Si Dó.'],
  ['No furo 7, qual a ordem para subir a escala?', 'Primeiro puxar (-7), depois soprar (7)', ['Primeiro soprar, depois puxar', 'Só soprar', 'Só puxar'], 'Do furo 7 em diante a gaita inverte: a nota puxada fica abaixo da soprada.'],
  ['Por que a escala completa fica nos furos 4 a 7?', 'Porque só ali a gaita tem todas as notas de Dó a Dó, sem buracos', ['Porque são os furos mais fáceis', 'Por acaso', 'Porque os outros furos são desafinados'], 'Nos graves faltam notas (sem bend); nos agudos também.'],
]);

const rhythmFacts = fixed([
  ['O que é o pulso de uma música?', 'A batida constante que você acompanha com o pé', ['A nota mais aguda', 'O volume', 'A letra da música'], 'É o "tum tum tum" que não muda.'],
  ['O que é uma pausa?', 'Um tempo de silêncio dentro da música', ['Uma nota mais forte', 'O fim da música', 'Uma nota longa'], 'Silêncio também é música. E na gaita é a hora de respirar.'],
  ['No "ritmo de trem" da gaita, você...', 'alterna acordes soprados e puxados num ritmo constante', ['toca uma nota só bem longa', 'toca só no furo 10', 'bate na gaita'], 'É um dos exercícios mais clássicos para ganhar ritmo e respiração.'],
]);

const intervalFacts = fixed([
  ['Na melodia, um "passo" é...', 'ir para a nota vizinha da escala', ['pular várias notas', 'repetir a nota', 'parar de tocar'], 'De 4 para -4 é um passo; de 4 para 6 é um salto.'],
  ['O que é uma oitava?', 'A mesma nota, mais aguda ou mais grave', ['Uma escala de 8 músicas', 'Oito furos', 'Uma nota errada'], 'O Dó do furo 4 e o do furo 7 estão a uma oitava.'],
  ['Melodias fáceis de tocar costumam ter...', 'muitos passos e poucos saltos', ['só saltos', 'só notas repetidas', 'só notas puxadas'], 'Passos são mais fáceis de cantar e de tocar.'],
]);

const phraseFacts = fixed([
  ['Numa frase musical de "pergunta e resposta"...', 'a primeira parte fica em aberto e a segunda conclui', ['as duas partes são iguais', 'a segunda parte é mais rápida', 'não há fim'], 'Como numa conversa: a resposta costuma terminar na nota de casa (Dó).'],
  ['Na gaita em Dó, qual nota dá a sensação de "fim", de chegar em casa?', 'Dó (4 ou 7)', ['Ré (-4)', 'Si (-7)', 'Fá (-5)'], 'É a tônica da escala.'],
]);

const chordFacts = fixed([
  ['Por que a gaita diatônica foi feita para soar bem com vários furos juntos?', 'Os furos vizinhos formam acordes', ['Ela não foi', 'Para ficar mais alta', 'Para ser mais fácil de limpar'], 'Soprando: acorde de Dó. Puxando os graves: acorde de Sol.'],
  ['Acorde é...', 'várias notas tocadas ao mesmo tempo', ['uma nota bem longa', 'o nome da gaita', 'uma pausa'], 'Na gaita: cobrir 3 ou 4 furos com a boca.'],
  ['Acompanhar uma música com a gaita é, no básico...', 'alternar o acorde soprado (C) e o puxado (G) no ritmo', ['tocar só a melodia', 'tocar só o furo 1', 'soprar sem parar'], 'Soprado = Dó, puxado grave = Sol.'],
]);

const bluesFacts = fixed([
  ['Quantos compassos tem a forma clássica do blues?', '12', ['8', '16', '4'], 'I I I I | IV IV I I | V IV I I.'],
  ['No blues em Sol (2ª posição numa gaita em Dó), o acorde principal (I) é tocado...', 'puxando os furos graves (1 a 4)', ['soprando os furos 1 a 3', 'puxando os furos 8 a 10', 'soprando o furo 10'], 'Puxado grave = Sol. Soprado = Dó, que vira o IV.'],
]);

const techFacts = fixed([
  ['O que é o bend na gaita?', 'Abaixar a nota mudando o formato da boca e da garganta', ['Dobrar a gaita', 'Soprar mais forte', 'Cobrir dois furos'], 'Como dizer "iii-uuu" puxando o ar: a nota cai.'],
  ['Em quais furos dá para fazer bend puxando o ar?', '1, 2, 3, 4 e 6', ['7, 8, 9 e 10', 'Em todos', 'Só no 5'], 'Nos furos 8, 9 e 10 o bend é soprando.'],
  ['O que é vibrato?', 'Uma leve ondulação na nota, que dá expressão', ['Tocar duas notas ao mesmo tempo', 'Tocar muito rápido', 'Soprar e puxar juntos'], 'Pode vir da garganta, do diafragma ou das mãos.'],
  ['Para fazer o efeito "uá-uá" com as mãos, você...', 'abre e fecha a concha das mãos em volta da gaita', ['bate na gaita', 'tapa os furos com os dedos', 'balança a cabeça'], 'Mãos fechadas abafam; abrir solta o som.'],
  ['Tongue blocking é...', 'tapar alguns furos com a língua para isolar notas', ['morder a gaita', 'soprar com a língua para fora', 'um tipo de gaita'], 'Técnica alternativa ao biquinho; permite tocar oitavas e acompanhamentos.'],
]);

export const GENERATORS = {
  holeNote, findNote, blowOrDraw, readTab, tabToNotes, noteToTab, scaleNext, scaleMark,
  higherLower, stepOrLeap, tabEar, sameNote, octaveHole, graveAgudo, chordQ, songRecognize, songTab,
  bendQ, positionQ, holdFacts, breathFacts, singleFacts, notesFacts, scaleFacts, rhythmFacts,
  intervalFacts, phraseFacts, chordFacts, bluesFacts, techFacts,
  figures: BASE.figures, meterEar: BASE.meterEar, subdivisionEar: BASE.subdivisionEar,
  syncopeEar: BASE.syncopeEar, offbeatEar: BASE.offbeatEar, triadEar: BASE.triadEar,
};

export function generate(id) {
  const g = GENERATORS[id];
  if (!g) throw new Error('Gerador desconhecido: ' + id);
  const q = g();
  q.gen = id;
  return q;
}

// ── Conteúdo ────────────────────────────────────────────

const tabBlock = (seq, label) => ['tab', { seq, label }];

export const PERIODS = [
  { n: 1, name: 'Primeiros sons' },
  { n: 2, name: 'Notas' },
  { n: 3, name: 'Ritmo' },
  { n: 4, name: 'Melodias' },
  { n: 5, name: 'Acordes e posições' },
  { n: 6, name: 'Técnica' },
];

export const KIND_LABEL = {
  t: 'Teoria',
  g: 'Gaita · técnica',
  o: 'Ouvido',
  x: 'Experimento · tocar uma música',
};
export const TAG = { t: '', g: 'G', o: 'O', x: 'EXP' };
export const LEGEND = [['G', 'técnica de gaita'], ['O', 'treino de ouvido'], ['EXP', 'tocar uma música inteira']];

export const ELEMENTS = [
  // ── 1 · Primeiros sons ──
  {
    id: '01', s: 'Gt', name: 'Conhecer a gaita', kind: 'g', period: 1,
    desc: 'Como segurar, os 10 furos e por que cada furo tem duas notas.',
    gens: ['holdFacts', 'graveAgudo', 'holdFacts'],
    lesson: [
      ['p', 'A gaita diatônica tem <b>10 furos</b>, numerados de 1 a 10. Segure com os <b>números para cima</b>: o furo 1 fica à esquerda e tem o som mais <b>grave</b> (grosso); o furo 10, à direita, é o mais <b>agudo</b> (fino).'],
      ['harp', { cells: [{ h: 1, d: 'b', label: '1' }, { h: 10, d: 'b', label: '10' }] }],
      ['p', 'Cada furo dá <b>duas notas</b>: uma quando você <b>sopra</b> e outra quando <b>puxa o ar</b>. São 20 notas sem nenhuma técnica especial.'],
      ['list', ['Mão esquerda segura a gaita, com o polegar embaixo e o indicador em cima.', 'A mão direita pode ficar em concha atrás, ajudando a segurar.', 'Os lábios encostam de leve, com a parte úmida de dentro, não a seca de fora.']],
      ['tip', 'A sua gaita é em <b>Dó (C)</b>, a mais usada para começar. Todos os exercícios desta trilha são para ela.'],
    ],
  },
  {
    id: '02', s: 'Sp', name: 'Soprar e puxar', kind: 'g', period: 1,
    desc: 'As duas direções do ar e o que muda no som.',
    gens: ['blowOrDraw', 'holeNote', 'breathFacts'],
    lesson: [
      ['p', 'Soprando, a gaita toca uma nota. Puxando o ar pelo mesmo furo, toca outra. Ninguém precisa decorar tudo agora: o desenho abaixo mostra as 20 notas.'],
      ['harp', { showNotes: true }],
      ['p', 'Fileira de cima: o que sai <b>soprando</b>. Fileira de baixo: o que sai <b>puxando</b>.'],
      ['play', { label: 'Ouvir: soprar o furo 4, depois puxar o furo 4', kind: 'seq', notes: [H.tabToMidi('4'), H.tabToMidi('-4')], reed: true, gap: 0.9 }],
      ['tip', 'Respire como se fosse bocejar devagar: ar pelo diafragma, garganta aberta, sem força. A gaita precisa de muito pouco ar.'],
    ],
  },
  {
    id: '03', s: 'Nu', name: 'Uma nota só', kind: 'g', period: 1,
    desc: 'Fazer o biquinho para tocar um furo de cada vez.',
    gens: ['singleFacts', 'holeNote', 'singleFacts'],
    lesson: [
      ['p', 'Para tocar uma nota só, a boca precisa cobrir <b>um furo</b>. O jeito mais comum é o <b>biquinho</b> (em inglês, <i>pucker</i>): como para assobiar ou tomar com canudinho.'],
      ['list', ['Coloque a gaita mais para dentro da boca do que parece natural.', 'Lábios relaxados e úmidos, o biquinho pequeno.', 'Sopre de leve no furo 4. Se ouvir duas notas, feche um pouco o biquinho.', 'Para trocar de furo, mexa a gaita, não a cabeça.']],
      ['play', { label: 'Como deve soar: uma nota limpa (furo 4)', kind: 'seq', notes: [H.tabToMidi('4')], reed: true }],
      ['play', { label: 'Como NÃO deve soar: furos 4 e 5 juntos', kind: 'chord', notes: [H.tabToMidi('4'), H.tabToMidi('5')], reed: true }],
      ['tip', 'É normal levar alguns dias para a nota sair limpa. Pratique 5 minutos por dia, sem pressa.'],
    ],
  },
  {
    id: '04', s: 'Tb', name: 'Tablatura', kind: 't', period: 1,
    desc: 'O jeito mais simples de ler música para gaita: números e sinais.',
    gens: ['readTab', 'readTab', 'blowOrDraw'],
    lesson: [
      ['p', 'A <b>tablatura</b> diz o que fazer, sem precisar saber partitura:'],
      ['table', { head: ['Escrito', 'Significa'], rows: [['4', 'soprar o furo 4'], ['-4', 'puxar o furo 4'], ['4 4 -4', 'soprar 4, soprar 4, puxar 4'], ["-4'", 'puxar o furo 4 com bend (lá no período 6)']] }],
      tabBlock('4 -4 5 -5 6', 'Leia e ouça'),
      ['tip', 'Em algumas tablaturas na internet o soprar aparece como "+4" ou "↑4" e o puxar como "↓4". É a mesma coisa.'],
    ],
  },
  {
    id: '05', s: 'Ar', name: 'Respiração', kind: 'g', period: 1,
    desc: 'Ar relaxado, notas longas e onde respirar.',
    gens: ['breathFacts', 'breathFacts', 'higherLower'],
    lesson: [
      ['p', 'Na gaita, a respiração <b>é</b> o instrumento. Três hábitos fazem toda a diferença:'],
      ['list', ['<b>Pouco ar</b>: o som bonito vem de ar calmo, não de força.', '<b>Diafragma</b>: respire "pela barriga", com os ombros parados.', '<b>Notas longas</b>: sopre o furo 4 contando até 4, depois puxe contando até 4. Repita 5 vezes.']],
      ['p', 'Puxar é inspirar e soprar é expirar. Numa música, você vai respirando pelo próprio instrumento. Se faltar ar, use as pausas.'],
      ['play', { label: 'Nota longa soprada e puxada (4 e -4)', kind: 'tab', seq: [{ midi: H.tabToMidi('4'), dur: 4 }, { midi: H.tabToMidi('-4'), dur: 4 }], reed: true }],
    ],
  },
  {
    id: 'X1', s: 'Ex', name: 'Primeira escala', kind: 'x', period: 1,
    desc: 'Tocar devagar a escala do meio, nota por nota, só com notas limpas.',
    song: { name: 'Escala de Dó', tab: '4 -4 5 -5 6 -6 -7 7:2 | 7 -7 -6 6 -5 5 -4 4:2' },
    steps: ['Segure a gaita com os números para cima.', 'Toque a escala subindo, bem devagar, uma nota de cada vez.', 'Se uma nota sair dupla, pare e ajuste o biquinho.', 'Toque descendo.', 'Grave com o celular e ouça: todas as notas saíram limpas?'],
  },

  // ── 2 · Notas ──
  {
    id: '06', s: 'Nt', name: 'Notas musicais', kind: 't', period: 2,
    desc: 'Dó, ré, mi... e as letras C, D, E que aparecem nas cifras.',
    gens: ['notesFacts', 'holeNote', 'notesFacts'],
    lesson: [
      ['p', 'A música usa <b>7 notas</b> com nome próprio. Depois da última, o ciclo recomeça, mais agudo.'],
      ['table', { head: ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'], rows: [['C', 'D', 'E', 'F', 'G', 'A', 'B']] }],
      ['p', 'As letras são usadas em cifras, gaitas e afinadores. "Gaita em C" quer dizer "gaita em Dó".'],
      ['play', { label: 'Dó Ré Mi Fá Sol Lá Si Dó', kind: 'seq', notes: H.MIDDLE_SCALE.map(H.tabToMidi), reed: true }],
      ['tip', 'Um jeito de decorar: as letras seguem o alfabeto a partir do Lá. A B C D E F G = Lá Si Dó Ré Mi Fá Sol.'],
    ],
  },
  {
    id: '07', s: 'Ed', name: 'Escala de Dó', kind: 't', period: 2,
    desc: 'A escala completa nos furos 4 a 7, e a "virada" do furo 7.',
    gens: ['scaleNext', 'scaleMark', 'findNote', 'scaleFacts'],
    lesson: [
      ['p', 'Uma <b>escala</b> é uma sequência de notas em ordem. A escala de Dó completa (Dó a Dó) fica no <b>meio da gaita</b>, nos furos 4 a 7:'],
      ['harp', { tabs: H.MIDDLE_SCALE, label: 'order', holes: [4, 7] }],
      tabBlock('4 -4 5 -5 6 -6 -7 7', 'Escala de Dó'),
      ['p', 'Repare no <b>furo 7</b>: para continuar subindo, você <b>puxa antes de soprar</b>. Do furo 7 em diante, a gaita inverte.'],
      ['tip', 'Esta escala é a base de quase todas as melodias desta trilha. Vale tocar todo dia como aquecimento.'],
    ],
  },
  {
    id: '08', s: 'Ga', name: 'Grave e agudo', kind: 'o', period: 2,
    desc: 'Ouvir se uma nota é mais grossa ou mais fina que a outra.',
    gens: ['higherLower', 'higherLower', 'graveAgudo'],
    lesson: [
      ['p', '<b>Grave</b> é o som grosso; <b>agudo</b> é o som fino. Na gaita, o grave fica à esquerda e o agudo à direita.'],
      ['play', { label: 'Furo 1 (grave)', kind: 'seq', notes: [H.tabToMidi('1')], reed: true }],
      ['play', { label: 'Furo 10 (agudo)', kind: 'seq', notes: [H.tabToMidi('10')], reed: true }],
      ['p', 'Saber se a próxima nota <b>sobe ou desce</b> é o primeiro passo para tirar músicas de ouvido.'],
      ['tip', 'Cante junto. Se a voz precisa subir, a nota é mais aguda.'],
    ],
  },
  {
    id: '09', s: 'Oi', name: 'Oitavas', kind: 't', period: 2,
    desc: 'A mesma nota em vários furos, mais grave ou mais aguda.',
    gens: ['octaveHole', 'sameNote', 'octaveHole'],
    lesson: [
      ['p', 'Soprando, a gaita repete o mesmo padrão: <b>Dó Mi Sol | Dó Mi Sol | Dó Mi Sol | Dó</b>. A mesma nota mais aguda ou mais grave é uma <b>oitava</b>.'],
      ['harp', { tabs: ['1', '4', '7', '10'], accent: true }],
      ['play', { label: 'Os quatro Dós: 1, 4, 7 e 10', kind: 'seq', notes: ['1', '4', '7', '10'].map(H.tabToMidi), reed: true }],
      ['p', 'Uma curiosidade: <b>-2 e 3</b> dão exatamente a mesma nota (Sol). É a única repetição idêntica da gaita.'],
    ],
  },
  {
    id: '10', s: 'Mp', name: 'Mapa da gaita', kind: 't', period: 2,
    desc: 'Encontrar qualquer nota na parte do meio, sem olhar a tabela.',
    gens: ['findNote', 'noteToTab', 'tabToNotes', 'findNote'],
    lesson: [
      ['p', 'Juntando tudo: o mapa completo da sua gaita.'],
      ['harp', { showNotes: true }],
      ['list', ['Soprando: só Dó, Mi e Sol (as notas do acorde de Dó).', 'Puxando: as outras notas da escala aparecem (Ré, Fá, Lá, Si).', 'Nos graves (1 a 3) faltam algumas notas; elas só aparecem com bend (período 6).']],
      ['tip', 'Não precisa decorar a gaita inteira. Domine os furos 4 a 7: com eles você toca quase todas as músicas deste começo.'],
    ],
  },
  {
    id: 'X2', s: 'Ex', name: 'Brilha, brilha, estrelinha', kind: 'x', period: 2,
    desc: 'Sua primeira música inteira, só com os furos 4 a 6.',
    song: H.SONGS.find((s) => s.id === 'estrelinha'),
    steps: ['Ouça a música no botão abaixo.', 'Toque a primeira frase (4 4 6 6 -6 -6 6) até sair sem errar.', 'Toque a segunda frase (-5 -5 5 5 -4 -4 4).', 'Junte as duas primeiras frases.', 'Toque a música inteira, devagar.'],
  },

  // ── 3 · Ritmo ──
  {
    id: '11', s: 'Pu', name: 'Pulso', kind: 't', period: 3,
    desc: 'A batida constante que você marca com o pé.',
    gens: ['rhythmFacts', 'meterEar', 'rhythmFacts'],
    lesson: [
      ['p', 'Quase toda música tem uma batida constante por baixo, o <b>pulso</b>. É o que você marca com o pé sem pensar.'],
      ['play', { label: 'Ouvir um pulso', kind: 'meter', beats: 4, bars: 2 }],
      ['p', 'Tocar "no tempo" é encaixar as notas nesse pulso. Antes de tocar uma música, bata o pé junto com ela.'],
      ['tip', 'Exercício: sopre o furo 4 uma vez a cada batida do pé, durante 8 batidas. Depois puxe o -4 da mesma forma.'],
    ],
  },
  {
    id: '12', s: 'Cp', name: 'Compasso', kind: 't', period: 3,
    desc: 'Contar 1 2 3 4: como o pulso se agrupa.',
    gens: ['meterEar', 'meterEar', 'rhythmFacts'],
    lesson: [
      ['p', 'Os pulsos se agrupam em <b>compassos</b>. O primeiro de cada grupo é o mais forte.'],
      ['list', ['<b>4 tempos</b>: UM dois três quatro. A maioria das músicas.', '<b>3 tempos</b>: UM dois três. Valsas.', '<b>2 tempos</b>: UM dois. Marchinhas e samba.']],
      ['play', { label: 'Ouvir 4 tempos', kind: 'meter', beats: 4 }],
      ['play', { label: 'Ouvir 3 tempos', kind: 'meter', beats: 3 }],
    ],
  },
  {
    id: '13', s: 'Fg', name: 'Notas longas e curtas', kind: 't', period: 3,
    desc: 'Quanto tempo cada nota dura: semínima, mínima, colcheia.',
    gens: ['figures', 'subdivisionEar', 'figures'],
    lesson: [
      ['p', 'Cada nota dura um certo tempo. Os nomes mais comuns:'],
      ['table', { head: ['Nome', 'Dura', 'Contando'], rows: [['Semibreve', '4 tempos', 'um-dois-três-quatro'], ['Mínima', '2 tempos', 'um-dois'], ['Semínima', '1 tempo', 'um'], ['Colcheia', 'meio tempo', 'um-e']] }],
      ['rhythm', { label: 'Uma nota por tempo', steps: [1, 0, 1, 0, 1, 0, 1, 0], perBeat: 2 }],
      ['rhythm', { label: 'Duas notas por tempo', steps: [1, 1, 1, 1, 1, 1, 1, 1], perBeat: 2 }],
      ['tip', 'Nas tablaturas desta trilha, as notas que duram mais aparecem com ":2" (2 tempos) ou ":4" (4 tempos).'],
    ],
  },
  {
    id: '14', s: 'Tr', name: 'Ritmo de trem', kind: 'g', period: 3,
    desc: 'O exercício clássico da gaita: acordes no ritmo, como um trem.',
    gens: ['rhythmFacts', 'chordQ', 'subdivisionEar'],
    lesson: [
      ['p', 'Com a boca cobrindo os <b>furos 1 a 4</b>, alterne soprar e puxar num ritmo constante: <b>sopra-sopra-puxa-puxa</b>. O som lembra um trem.'],
      ['play', { label: 'Ouvir o ritmo de trem', kind: 'train', reed: true }],
      ['list', ['Comece bem devagar, contando 1 e 2 e 3 e 4 e.', 'Acentue a primeira de cada par.', 'Acelere aos poucos, mantendo o ritmo igual.']],
      ['tip', 'Esse exercício treina ritmo, respiração e acordes ao mesmo tempo. Puxando você inspira, soprando expira: dá para tocar por minutos sem cansar.'],
    ],
  },
  {
    id: '15', s: 'Pz', name: 'Pausas e contratempo', kind: 'o', period: 3,
    desc: 'O silêncio também conta, e às vezes a nota cai entre os tempos.',
    gens: ['offbeatEar', 'syncopeEar', 'rhythmFacts'],
    lesson: [
      ['p', '<b>Pausa</b> é um tempo de silêncio. Na gaita, é a hora natural de respirar.'],
      ['p', 'Às vezes as notas caem <b>entre</b> os pulsos: é o <b>contratempo</b>, a batida do reggae.'],
      ['rhythm', { label: 'Nos tempos', steps: [1, 0, 1, 0, 1, 0, 1, 0], perBeat: 2 }],
      ['rhythm', { label: 'No contratempo', steps: [0, 1, 0, 1, 0, 1, 0, 1], perBeat: 2 }],
    ],
  },
  {
    id: 'X3', s: 'Ex', name: 'Mary had a little lamb', kind: 'x', period: 3,
    desc: 'Uma melodia curta, cuidando do ritmo: notas longas e curtas no lugar certo.',
    song: H.SONGS.find((s) => s.id === 'carneirinho'),
    steps: ['Ouça e bata o pé junto.', 'Toque a primeira frase (5 -4 4 -4 5 5 5), segurando a última nota por 2 tempos.', 'Toque a música inteira devagar, batendo o pé.', 'Tente sem olhar a tablatura.'],
  },

  // ── 4 · Melodias ──
  {
    id: '16', s: 'Ps', name: 'Passos e saltos', kind: 'o', period: 4,
    desc: 'Notas vizinhas ou pulos: como as melodias andam.',
    gens: ['stepOrLeap', 'stepOrLeap', 'intervalFacts'],
    lesson: [
      ['p', 'Uma melodia anda de dois jeitos: por <b>passos</b> (para a nota vizinha da escala) ou por <b>saltos</b> (pulando notas).'],
      tabBlock('4 -4 5 -5 6', 'Só passos'),
      tabBlock('4 5 6 7', 'Só saltos'),
      ['p', 'A distância entre duas notas se chama <b>intervalo</b>. No violão e na teoria mais avançada eles ganham nomes (3ª, 5ª...). Aqui, passo e salto bastam.'],
    ],
  },
  {
    id: '17', s: 'Ou', name: 'Frases de ouvido', kind: 'o', period: 4,
    desc: 'Ouvir 3 notas e descobrir a tablatura.',
    gens: ['tabEar', 'tabEar', 'higherLower'],
    lesson: [
      ['p', 'Tirar música de ouvido é juntar duas perguntas: <b>sobe ou desce?</b> e <b>passo ou salto?</b>'],
      ['p', 'Comece com frases de 3 notas na escala do meio. Ouça, cante, e procure na gaita.'],
      tabBlock('5 -5 6', 'Exemplo: sobe por passos'),
      tabBlock('6 -5 5', 'Exemplo: desce por passos'),
      ['tip', 'Se errar, não tem problema: o objetivo é treinar o ouvido, não acertar de primeira.'],
    ],
  },
  {
    id: '18', s: 'Fr', name: 'Frases e respostas', kind: 't', period: 4,
    desc: 'Pergunta e resposta: por que algumas notas soam como "fim".',
    gens: ['phraseFacts', 'tabEar', 'phraseFacts'],
    lesson: [
      ['p', 'Melodias são feitas de <b>frases</b>, como frases faladas. Muitas vezes vêm em pares: uma "pergunta" que fica no ar e uma "resposta" que conclui.'],
      tabBlock('4 4 6 6 -6 -6 6:2', 'Pergunta (termina em Sol, fica no ar)'),
      tabBlock('-5 -5 5 5 -4 -4 4:2', 'Resposta (termina em Dó, conclui)'),
      ['p', 'A nota que dá sensação de "chegar em casa" é a <b>tônica</b>. Na sua gaita, é o <b>Dó</b> (4 e 7).'],
    ],
  },
  {
    id: '19', s: 'Mu', name: 'Reconhecer músicas', kind: 'o', period: 4,
    desc: 'As músicas desta trilha pelo começo da melodia.',
    gens: ['songRecognize', 'songTab', 'songRecognize'],
    lesson: [
      ['p', 'As músicas da trilha são de domínio público e cabem na sua gaita sem nenhuma técnica especial:'],
      ...H.SONGS.map((s) => tabBlock(s.tab, `${s.name} (${s.origin})`)),
      ['tip', 'Escolha a que você mais gosta e toque um pouco todo dia, junto com os exercícios.'],
    ],
  },
  {
    id: '20', s: 'Ag', name: 'Furos agudos', kind: 'g', period: 4,
    desc: 'Tocar nos furos 7 a 10, onde soprar e puxar se invertem.',
    gens: ['blowOrDraw', 'octaveHole', 'holeNote'],
    lesson: [
      ['p', 'Do furo 7 em diante, a nota puxada fica <b>abaixo</b> da soprada. A escala de Dó continua assim:'],
      tabBlock('7 -8 8 -9 9 -10 10', 'Escala aguda (Dó Ré Mi Fá Sol Lá Dó)'),
      ['p', 'Repare que falta o Si nessa região (ele exigiria bend). Os furos agudos são mais "duros": use menos ar e um biquinho mais firme.'],
      ['tip', '"Parabéns a você" usa justamente os furos 6 a 9. É o Experimento deste período.'],
    ],
  },
  {
    id: 'X4', s: 'Ex', name: 'Parabéns a você', kind: 'x', period: 4,
    desc: 'Uma música que todo mundo conhece, usando os furos agudos.',
    song: H.SONGS.find((s) => s.id === 'parabens'),
    steps: ['Ouça a música no botão abaixo.', 'Treine o pedaço agudo sozinho: 9 8 7 -7 -6.', 'Toque frase por frase.', 'Toque inteira e grave. Na próxima festa, é sua.'],
  },

  // ── 5 · Acordes e posições ──
  {
    id: '21', s: 'Ac', name: 'Acordes', kind: 't', period: 5,
    desc: 'Várias notas juntas: o acorde soprado e os puxados.',
    gens: ['chordQ', 'chordFacts', 'chordQ'],
    lesson: [
      ['p', 'Um <b>acorde</b> são várias notas soando juntas. A gaita foi feita para isso: furos vizinhos já formam acordes.'],
      ['table', { head: ['Tablatura', 'Notas', 'Acorde'], rows: H.CHORDS.slice(0, 3).map((c) => [c.tabs.join(' '), c.notes, c.name]) }],
      ...H.CHORDS.slice(0, 3).map((c) => ['play', { label: `${c.name}: ${c.desc}`, kind: 'chord', notes: c.tabs.map(H.tabToMidi), reed: true }]),
      ['tip', 'Para tocar um acorde, abra a boca para cobrir 3 ou 4 furos, em vez do biquinho.'],
    ],
  },
  {
    id: '22', s: 'Mm', name: 'Maior e menor', kind: 'o', period: 5,
    desc: 'O acorde alegre e o acorde triste.',
    gens: ['triadEar', 'triadEar', 'chordQ'],
    lesson: [
      ['p', 'Acordes têm "cores". As duas principais: <b>maior</b> (soa alegre, aberto) e <b>menor</b> (soa triste, fechado).'],
      ['play', { label: 'C (maior): soprar 4 5 6', kind: 'chord', notes: ['4', '5', '6'].map(H.tabToMidi), reed: true }],
      ['play', { label: 'Dm (menor): puxar 4 5 6', kind: 'chord', notes: ['-4', '-5', '-6'].map(H.tabToMidi), reed: true }],
      ['p', 'Na cifra, o acorde menor tem um "m" depois da letra: <b>Dm</b> = Ré menor.'],
    ],
  },
  {
    id: '23', s: 'Ap', name: 'Acompanhar', kind: 'g', period: 5,
    desc: 'Alternar acorde soprado e puxado para acompanhar uma música.',
    gens: ['chordFacts', 'chordQ', 'chordFacts'],
    lesson: [
      ['p', 'Muitas músicas simples usam só dois acordes: <b>Dó</b> e <b>Sol</b>. Na gaita: Dó = soprar os furos 1 a 3; Sol = puxar os furos 1 a 4.'],
      ['play', { label: 'C G C G (sopra, puxa, sopra, puxa)', kind: 'chords', chords: [['1', '2', '3'], ['-1', '-2', '-3', '-4'], ['1', '2', '3'], ['-1', '-2', '-3', '-4']].map((c) => c.map(H.tabToMidi)), reed: true }],
      ['list', ['Escolha uma música com cifra só de C e G.', 'Toque o acorde no ritmo do pulso, trocando quando a cifra trocar.', 'Junte com o ritmo de trem: sopra-sopra-puxa-puxa.']],
    ],
  },
  {
    id: '24', s: 'Po', name: 'Primeira e segunda posição', kind: 't', period: 5,
    desc: 'A mesma gaita em dois tons: Dó (folk) e Sol (blues e rock).',
    gens: ['positionQ', 'positionQ', 'sameNote'],
    lesson: [
      ['p', 'A gaita em Dó toca no tom de Dó: isso é a <b>1ª posição</b>, a das músicas que você aprendeu até aqui.'],
      ['p', 'Mas os gaitistas de blues e rock usam a mesma gaita no tom de <b>Sol</b>: é a <b>2ª posição</b> (ou <i>cross harp</i>). A nota de casa passa a ser o Sol: <b>-2</b> (ou 3).'],
      ['harp', { tabs: ['-2', '3', '6', '9'], accent: true }],
      tabBlock('-2 -3 -4 5 -4 -3 -2:2', 'Uma frase em 2ª posição'),
      ['tip', 'Na 2ª posição as notas importantes são puxadas, e é puxando que se faz bend. Por isso ela é a base do blues.'],
    ],
  },
  {
    id: '25', s: 'Bl', name: 'Blues de 12 compassos', kind: 't', period: 5,
    desc: 'A forma mais famosa da música popular, tocada só com acordes.',
    gens: ['bluesFacts', 'positionQ', 'bluesFacts'],
    lesson: [
      ['p', 'O blues clássico tem <b>12 compassos</b> e três acordes. Em 2ª posição na gaita em Dó:'],
      ['table', { head: ['Acorde', 'Na gaita'], rows: [['I (Sol)', 'puxar furos 1 a 4'], ['IV (Dó)', 'soprar furos 1 a 3'], ['V (Ré)', 'puxar furos 4 a 6 (sai Ré menor, que funciona bem aqui)']] }],
      ['table', { head: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], rows: [['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I']] }],
      ['tip', 'Cada compasso tem 4 tempos. Toque o acorde no ritmo de trem e troque nos compassos certos.'],
    ],
  },
  {
    id: 'X5', s: 'Ex', name: 'Ode à Alegria', kind: 'x', period: 5,
    desc: 'Uma melodia mais longa, com ritmo pontuado, e um acompanhamento com acordes.',
    song: H.SONGS.find((s) => s.id === 'ode'),
    steps: ['Ouça a melodia.', 'Toque as duas frases separadamente.', 'Repare no fim de cada frase: uma nota mais longa e uma curta.', 'Toque inteira.', 'Desafio: acompanhe alguém cantando, alternando os acordes soprado (C) e puxado (G).'],
  },

  // ── 6 · Técnica ──
  {
    id: '26', s: 'Bd', name: 'Bend', kind: 'g', period: 6,
    desc: 'Puxar a nota para baixo: o som chorado da gaita.',
    gens: ['bendQ', 'techFacts', 'bendQ'],
    lesson: [
      ['p', 'O <b>bend</b> abaixa a nota sem trocar de furo, mudando o formato da boca e da garganta. É o som "chorado" do blues.'],
      ['list', ['Puxe o furo 4, com o biquinho.', 'Diga devagar "iii" e depois "uuu", puxando o ar, como se a língua descesse.', 'A nota deve cair um pouco. Isso é o bend.']],
      ['table', { head: ['Furo (puxando)', '1', '2', '3', '4', '6'], rows: [['Bends possíveis', '1 (Db)', '2 (F#, F)', '3 (Bb, A, Ab)', '1 (Db)', '1 (Ab)']] }],
      ['play', { label: '-4 e depois -4 com bend', kind: 'seq', notes: [H.tabToMidi('-4'), H.tabToMidi("-4'")], reed: true, gap: 0.9 }],
      ['tip', 'O bend leva semanas para sair. Não force o ar: o que muda é a boca, não a força.'],
    ],
  },
  {
    id: '27', s: 'Vi', name: 'Vibrato', kind: 'g', period: 6,
    desc: 'A ondulação que dá vida às notas longas.',
    gens: ['techFacts', 'techFacts', 'higherLower'],
    lesson: [
      ['p', 'O <b>vibrato</b> é uma ondulação leve no volume ou na altura da nota. Ele transforma uma nota longa em algo expressivo.'],
      ['list', ['<b>Garganta</b>: como uma risada bem suave, "ha-ha-ha", sem som de voz.', '<b>Mãos</b>: abrindo e fechando a concha em volta da gaita.']],
      ['play', { label: 'Nota longa com vibrato (-4)', kind: 'vibrato', notes: [H.tabToMidi('-4')], reed: true }],
    ],
  },
  {
    id: '28', s: 'Ef', name: 'Efeitos com as mãos', kind: 'g', period: 6,
    desc: 'O "uá-uá" e o som abafado.',
    gens: ['techFacts', 'techFacts', 'chordQ'],
    lesson: [
      ['p', 'As mãos funcionam como uma caixa de som. Fechadas em concha, abafam; abrindo, soltam o som.'],
      ['list', ['Feche bem as mãos em volta da gaita, com a direita fazendo uma concha atrás.', 'Toque uma nota puxada longa (-4).', 'Abra e feche a mão direita devagar: "uá-uá".']],
      ['tip', 'Combine com o ritmo de trem: fechar e abrir a mão a cada acorde faz um som bem característico.'],
    ],
  },
  {
    id: '29', s: 'Lb', name: 'Língua (tongue blocking)', kind: 'g', period: 6,
    desc: 'Usar a língua para isolar notas e tocar oitavas.',
    gens: ['techFacts', 'octaveHole', 'techFacts'],
    lesson: [
      ['p', 'Em vez do biquinho, a boca cobre <b>4 furos</b> e a <b>língua tapa os 3 da esquerda</b>. Só o furo da direita soa.'],
      ['list', ['Muito usado por gaitistas de blues tradicional.', 'Tirando a língua por um instante, os outros furos soam como acorde: dá para tocar melodia e acompanhamento juntos.', 'Com a língua no meio, soam o furo da esquerda e o da direita: uma oitava (ex.: 1 e 4).']],
      ['play', { label: 'Oitava: furos 4 e 7 juntos', kind: 'chord', notes: [H.tabToMidi('4'), H.tabToMidi('7')], reed: true }],
      ['tip', 'Não precisa escolher entre biquinho e língua: a maioria dos gaitistas usa os dois.'],
    ],
  },
  {
    id: '30', s: 'Lk', name: 'Frases de blues', kind: 'g', period: 6,
    desc: 'Frases curtas em 2ª posição para tocar sobre um blues.',
    gens: ['positionQ', 'tabEar', 'bendQ'],
    lesson: [
      ['p', 'Com a 2ª posição e um pouco de bend, você já consegue tocar frases de blues. Algumas para começar:'],
      tabBlock('-2 -3 -4 5 -4 -3 -2:2', 'Frase 1 (sem bend)'),
      tabBlock('-4 -4 -4 -3 -2:2', 'Frase 2 (sem bend)'),
      tabBlock("-2 -3' -2:2", 'Frase 3 (com bend no -3)'),
      ['tip', 'Toque cada frase sobre os acordes do blues de 12 compassos. Repetir a mesma frase em cima de acordes diferentes já soa como blues.'],
    ],
  },
  {
    id: 'X6', s: 'Ex', name: 'When the saints go marching in', kind: 'x', period: 6,
    desc: 'O desafio final: tocar com ritmo, vibrato nas notas longas e um final de efeito.',
    song: H.SONGS.find((s) => s.id === 'santos'),
    steps: ['Ouça a música.', 'Toque a melodia inteira.', 'Coloque vibrato nas notas longas (as de 4 tempos).', 'Use as mãos para abrir o som no final.', 'Grave e compare com a gravação da sua primeira escala (Experimento 1).'],
  },
];

export const byId = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));
export const NON_EXP = ELEMENTS.filter((e) => e.kind !== 'x');
export const inPeriod = (n) => ELEMENTS.filter((e) => e.period === n);
export const usesInstrument = () => false;
