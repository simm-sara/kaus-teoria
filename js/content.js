// Conteúdo da trilha: períodos, elementos, lições e experimentos.
//
// Tipos de elemento: t = tronco (violão e baixo), p = ponte (violão → baixo),
// v = ramo violão, b = ramo baixo, x = experimento.
//
// Blocos de lição:
//   ['p', html]            parágrafo (texto fixo, pode ter <b>)
//   ['h', texto]           subtítulo
//   ['list', [html...]]    lista
//   ['table', {head, rows}]
//   ['fret', {inst: 'both'|'violao'|'baixo', notes: ['C','E','G'], root: 'C', fretMax, degrees: true}]
//   ['play', {label, kind: 'seq'|'chord'|'interval'|'rhythm'|'meter', notes|steps|beats}]
//   ['rhythm', {steps, label, perBeat}]
//   ['tip', html]          observação em destaque

const C3 = 48;
const m = (name) => {
  // MIDI a partir de "C3", "F#2", "Bb3"...
  const r = /^([A-G])(#|b)?(\d)$/.exec(name);
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[r[1]];
  return 12 * (Number(r[3]) + 1) + base + (r[2] === '#' ? 1 : r[2] === 'b' ? -1 : 0);
};
const seq = (...ns) => ns.map(m);

export const PERIODS = [
  { n: 1, name: 'Fundamentos' },
  { n: 2, name: 'Intervalos' },
  { n: 3, name: 'Escala maior' },
  { n: 4, name: 'Acordes' },
  { n: 5, name: 'Harmonia' },
  { n: 6, name: 'Menor' },
  { n: 7, name: 'Ritmo' },
  { n: 8, name: 'Baixo' },
  { n: 9, name: 'Avançado' },
];

export const KIND_LABEL = {
  t: 'Tronco · violão e baixo',
  p: 'Ponte · violão → baixo',
  v: 'Ramo · violão',
  b: 'Ramo · baixo',
  x: 'Experimento · música real',
};
export const TAG = { t: '', p: 'V·B', v: 'V', b: 'B', x: 'EXP' };

export const ELEMENTS = [
  // ── Período 1 · Fundamentos ──────────────────────────
  {
    id: '01', s: 'Nt', name: 'Notas', kind: 't', period: 1,
    desc: 'As 7 notas naturais e os 12 sons. Dó, ré, mi… e onde entram os sustenidos.',
    gens: ['nextNatural', 'solfegeToLetter', 'notesFacts'],
    lesson: [
      ['p', 'A música ocidental usa <b>12 sons</b>. Depois do 12º, tudo se repete mais agudo: é a <b>oitava</b>.'],
      ['p', 'Sete desses sons têm nome próprio, as <b>notas naturais</b>. Na cifra, cada uma é uma letra:'],
      ['table', { head: ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'], rows: [['C', 'D', 'E', 'F', 'G', 'A', 'B']] }],
      ['p', 'Os outros 5 sons ficam <b>entre</b> as naturais e usam o nome da vizinha com um sinal: C# (dó sustenido) ou Db (ré bemol), por exemplo.'],
      ['p', 'Mas atenção: entre <b>E e F</b> e entre <b>B e C</b> não existe nota no meio. Eles já estão colados.'],
      ['play', { label: 'Ouvir as 7 naturais (C a C)', kind: 'seq', notes: seq('C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4') }],
      ['play', { label: 'Ouvir os 12 sons (escala cromática)', kind: 'seq', gap: 0.3, notes: Array.from({ length: 13 }, (_, i) => C3 + i) }],
      ['tip', 'No teclado de um piano: as teclas brancas são as naturais, as pretas são os sustenidos e bemóis. E–F e B–C são as brancas sem preta no meio.'],
    ],
  },
  {
    id: '02', s: 'Bv', name: 'Braço do violão', kind: 'v', period: 1,
    desc: 'Achar qualquer nota nas 6 cordas sem contar casa por casa.',
    gens: ['fretFindNote', 'fretNameNote', 'fretFacts'],
    lesson: [
      ['p', 'Cada casa do braço sobe <b>um semitom</b>, ou seja, um dos 12 sons. Se você sabe a corda solta e conta as casas, chega a qualquer nota.'],
      ['p', 'Afinação padrão, da corda mais grave (6ª) para a mais aguda (1ª): <b>E A D G B E</b>.'],
      ['fret', { inst: 'violao', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], fretMax: 12 }],
      ['h', 'Três atalhos para não contar'],
      ['list', [
        '<b>Casa 12 = corda solta</b>, uma oitava acima. O braço se repete a partir dela.',
        '<b>Casa 5 = próxima corda solta</b>: a casa 5 da corda E é A, a casa 5 da A é D, a casa 5 da D é G. A exceção é G→B, onde vale a <b>casa 4</b>.',
        '<b>Oitavas em desenho</b>: a mesma nota aparece duas cordas acima e duas casas à frente (nas cordas E, A, D e G).',
      ]],
      ['tip', 'Comece decorando as notas naturais nas cordas E e A. Elas são a base de quase todos os acordes com pestana.'],
    ],
  },
  {
    id: '03', s: 'Bb', name: 'Braço do baixo', kind: 'b', period: 1,
    desc: 'As 4 cordas do baixo, uma por uma, até a casa 12.',
    gens: ['fretFindNote', 'fretNameNote', 'fretFacts'],
    lesson: [
      ['p', 'O baixo de 4 cordas é afinado <b>E A D G</b>, do grave para o agudo. Todas as cordas vizinhas estão a uma 4ª justa (5 casas), sem exceção.'],
      ['fret', { inst: 'baixo', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], fretMax: 12 }],
      ['p', 'Os mesmos atalhos do violão funcionam aqui: casa 12 = corda solta, casa 5 = próxima corda solta. E não há a exceção G→B, porque o baixo não tem corda B.'],
      ['tip', 'Você já conhece esse desenho: são as 4 cordas graves do violão. O elemento <b>Oitava abaixo</b> (período 2) explora isso.'],
    ],
  },
  {
    id: '04', s: 'Ts', name: 'Tom e semitom', kind: 't', period: 1,
    desc: 'A régua da música: 1 casa é um semitom, 2 casas são um tom.',
    gens: ['stepType', 'stepUp', 'stepFret'],
    inst: true,
    lesson: [
      ['p', '<b>Semitom</b> é a menor distância entre dois sons: <b>1 casa</b> no braço. <b>Tom</b> são dois semitons: <b>2 casas</b>.'],
      ['p', 'Entre as notas naturais, quase tudo é tom. As exceções são <b>E–F</b> e <b>B–C</b>, que são semitons.'],
      ['table', { head: ['C–D', 'D–E', 'E–F', 'F–G', 'G–A', 'A–B', 'B–C'], rows: [['tom', 'tom', 'semitom', 'tom', 'tom', 'tom', 'semitom']] }],
      ['play', { label: 'Ouvir um semitom (E–F)', kind: 'seq', notes: seq('E3', 'F3') }],
      ['play', { label: 'Ouvir um tom (F–G)', kind: 'seq', notes: seq('F3', 'G3') }],
      ['tip', 'Tudo o que vem depois (intervalos, escalas, acordes) é medido nessa régua.'],
    ],
  },
  {
    id: '05', s: 'Ac', name: 'Acidentes', kind: 't', period: 1,
    desc: 'Sustenido sobe, bemol desce. Por que Dó# e Réb são o mesmo som.',
    gens: ['enharmonic', 'accidentalFacts', 'stepUp'],
    lesson: [
      ['p', '<b>Sustenido (#)</b> sobe a nota um semitom. <b>Bemol (b)</b> desce um semitom.'],
      ['p', 'Por isso o mesmo som pode ter dois nomes: C# e Db são a mesma casa. Isso se chama <b>enarmonia</b>.'],
      ['table', { head: ['C#', 'D#', 'F#', 'G#', 'A#'], rows: [['Db', 'Eb', 'Gb', 'Ab', 'Bb']] }],
      ['p', 'Também existem E# (= F), B# (= C), Fb (= E) e Cb (= B). Parecem estranhos, mas aparecem em algumas escalas.'],
      ['h', 'Qual nome usar?'],
      ['p', 'Numa escala, cada letra aparece <b>uma vez</b>. Em F maior a 4ª nota é Bb, não A#, porque já existe um A na escala e faltaria o B. Você vai ver isso na prática no período 3.'],
    ],
  },
  {
    id: 'X1', s: 'Ex', name: 'Riff nos dois braços', kind: 'x', period: 1,
    desc: 'Achar no braço as notas de um riff que você já toca, primeiro no violão, depois no baixo.',
    steps: [
      'Escolha um riff ou uma introdução que você já toca no violão, de ouvido ou por tablatura.',
      'Escreva o nome de cada nota do riff, usando o braço (casa + corda).',
      'Se o riff está nas 4 cordas graves, toque exatamente as mesmas casas no baixo.',
      'Se usa as cordas B ou E aguda, encontre as mesmas notas nas cordas do baixo (uma oitava ou duas abaixo).',
      'Toque o riff no baixo e compare o som com o violão.',
    ],
    analyzer: false,
  },

  // ── Período 2 · Intervalos ───────────────────────────
  {
    id: '06', s: 'In', name: 'Intervalos', kind: 't', period: 2,
    desc: 'A distância entre duas notas, de 2ª a 8ª.',
    gens: ['intervalNumber', 'intervalNumber', 'intervalSemis'],
    lesson: [
      ['p', '<b>Intervalo</b> é a distância entre duas notas. O número do intervalo é a quantidade de <b>letras</b>, contando a primeira e a última.'],
      ['p', 'De C até G: C D E F G, cinco letras. É uma <b>5ª</b>. De D até F: D E F, três letras, uma <b>3ª</b>.'],
      ['table', { head: ['de C até', 'D', 'E', 'F', 'G', 'A', 'B', 'C'], rows: [['intervalo', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª', '8ª']] }],
      ['play', { label: 'Ouvir C–E (3ª)', kind: 'interval', notes: seq('C3', 'E3') }],
      ['play', { label: 'Ouvir C–G (5ª)', kind: 'interval', notes: seq('C3', 'G3') }],
      ['play', { label: 'Ouvir C–C (8ª)', kind: 'interval', notes: seq('C3', 'C4') }],
      ['tip', 'O número sozinho ainda não diz tudo: D–F e D–F# são as duas 3ª, mas soam diferente. A qualidade vem no próximo elemento.'],
    ],
  },
  {
    id: '07', s: 'Qi', name: 'Qualidade', kind: 't', period: 2,
    desc: 'Maior, menor e justo: o que muda o caráter do intervalo.',
    gens: ['intervalQuality', 'intervalSemis', 'intervalBuild'],
    lesson: [
      ['p', 'Além do número (letras), cada intervalo tem uma <b>qualidade</b>, dada pelos semitons.'],
      ['table', {
        head: ['Intervalo', 'Semitons', 'Exemplo a partir de C'],
        rows: [
          ['2ª menor', '1', 'C–Db'], ['2ª maior', '2', 'C–D'], ['3ª menor', '3', 'C–Eb'], ['3ª maior', '4', 'C–E'],
          ['4ª justa', '5', 'C–F'], ['4ª aumentada / 5ª diminuta', '6', 'C–F# / C–Gb'], ['5ª justa', '7', 'C–G'],
          ['6ª menor', '8', 'C–Ab'], ['6ª maior', '9', 'C–A'], ['7ª menor', '10', 'C–Bb'], ['7ª maior', '11', 'C–B'], ['8ª justa', '12', 'C–C'],
        ],
      }],
      ['p', '2ª, 3ª, 6ª e 7ª são <b>maiores ou menores</b>. 4ª, 5ª e 8ª são <b>justas</b>. Um semitom a mais vira aumentado; a menos, diminuto.'],
      ['p', 'A 3ª é a mais importante de todas: <b>3ª maior</b> soa alegre, <b>3ª menor</b> soa triste. É ela que decide se um acorde é maior ou menor.'],
      ['play', { label: 'Ouvir 3ª maior (C–E)', kind: 'interval', notes: seq('C3', 'E3') }],
      ['play', { label: 'Ouvir 3ª menor (C–Eb)', kind: 'interval', notes: seq('C3', 'Eb3') }],
    ],
  },
  {
    id: '08', s: 'Ib', name: 'Intervalo no braço', kind: 't', period: 2,
    desc: 'Cada intervalo tem um desenho no braço, igual no violão e no baixo.',
    gens: ['intervalFretFind', 'intervalFretName', 'intervalFretFind'],
    inst: true,
    lesson: [
      ['p', 'Como as cordas são afinadas em 4ªs, cada intervalo forma sempre o <b>mesmo desenho</b>, em qualquer lugar do braço. Vale para o violão (fora a passagem G→B) e para o baixo inteiro.'],
      ['p', 'A partir da tônica (1), na corda de cima:'],
      ['list', [
        '<b>4ª justa</b>: mesma casa, uma corda acima.',
        '<b>5ª justa</b>: uma corda acima, <b>duas casas à frente</b>. É o desenho do power chord.',
        '<b>3ª maior</b>: uma corda acima, <b>uma casa atrás</b>.',
        '<b>3ª menor</b>: uma corda acima, <b>duas casas atrás</b>.',
        '<b>Oitava</b>: duas cordas acima, duas casas à frente.',
      ]],
      ['fret', { inst: 'both', notes: ['A', 'C#', 'E'], root: 'A', degrees: true, fretMax: 7 }],
      ['tip', 'O desenho acima mostra A (1), C# (3) e E (5) nos dois instrumentos. Repare que no baixo ele é idêntico ao das 4 cordas graves do violão.'],
    ],
  },
  {
    id: '09', s: 'Io', name: 'Intervalo de ouvido', kind: 't', period: 2,
    desc: 'Reconhecer intervalos ouvindo, sem olhar o braço.',
    gens: ['intervalEar'],
    lesson: [
      ['p', 'Reconhecer intervalos de ouvido é o que permite tirar músicas sem tablatura. O truque é associar cada intervalo a um som que você já conhece.'],
      ['list', [
        '<b>3ª maior</b>: as duas primeiras notas de um acorde maior. Soa aberta e alegre.',
        '<b>3ª menor</b>: mais escura, triste.',
        '<b>4ª justa</b>: soa "suspensa", como um chamado.',
        '<b>5ª justa</b>: forte e vazia, o power chord do rock.',
        '<b>Oitava</b>: a mesma nota, mais aguda.',
      ]],
      ['play', { label: '3ª maior', kind: 'interval', notes: seq('C3', 'E3') }],
      ['play', { label: '3ª menor', kind: 'interval', notes: seq('C3', 'Eb3') }],
      ['play', { label: '4ª justa', kind: 'interval', notes: seq('C3', 'F3') }],
      ['play', { label: '5ª justa', kind: 'interval', notes: seq('C3', 'G3') }],
      ['play', { label: 'Oitava', kind: 'interval', notes: seq('C3', 'C4') }],
      ['tip', 'Dica: escolha músicas que começam com cada intervalo e cante mentalmente o começo delas. Associação pessoal funciona melhor do que lista pronta.'],
    ],
  },
  {
    id: '10', s: 'Ob', name: 'Oitava abaixo', kind: 'p', period: 2,
    desc: 'As 4 cordas do baixo têm a afinação das 4 cordas graves do violão, uma oitava abaixo. O que você já sabe ali vale no baixo.',
    gens: ['octaveBridge', 'octaveBridge', 'bridgeFacts'],
    lesson: [
      ['p', 'Esta é a ponte mais importante da trilha: o baixo é afinado <b>E A D G</b>, exatamente como as <b>4 cordas mais graves do violão</b>, só que <b>uma oitava abaixo</b>.'],
      ['fret', { inst: 'both', notes: ['E', 'A', 'D', 'G'], fretMax: 5 }],
      ['p', 'Consequência: tudo o que você já toca nessas 4 cordas do violão (notas, riffs, desenhos de escala e de intervalo) funciona <b>nas mesmas casas</b> do baixo.'],
      ['play', { label: 'A no violão (5ª corda solta) e A no baixo', kind: 'seq', notes: [45, 33] }],
      ['tip', 'Quando o violão toca um acorde, a nota mais grave dele geralmente está nessas cordas. É ela que o baixo vai reforçar.'],
    ],
  },
  {
    id: 'X2', s: 'Ex', name: 'Intervalos da melodia', kind: 'x', period: 2,
    desc: 'Identificar os intervalos da melodia de uma música que você conhece bem.',
    steps: [
      'Escolha uma música com melodia simples que você sabe cantar.',
      'Toque as primeiras 5 a 8 notas da melodia no violão, de ouvido.',
      'Escreva o nome das notas.',
      'Para cada par de notas seguidas, escreva o intervalo (ex.: C→E = 3ª maior).',
      'Cante a melodia de novo prestando atenção nos saltos maiores.',
    ],
    analyzer: false,
  },

  // ── Período 3 · Escala maior ─────────────────────────
  {
    id: '11', s: 'Em', name: 'Escala maior', kind: 't', period: 3,
    desc: 'A fórmula T T S T T T S e por que ela soa resolvida.',
    gens: ['majorScaleNotes', 'scaleNth', 'scaleFacts'],
    lesson: [
      ['p', 'A escala maior é uma sequência de 7 notas com uma fórmula fixa de tons (T) e semitons (S):'],
      ['table', { head: ['1→2', '2→3', '3→4', '4→5', '5→6', '6→7', '7→8'], rows: [['T', 'T', 'S', 'T', 'T', 'T', 'S']] }],
      ['p', 'Começando em C, ela usa só as notas naturais: <b>C D E F G A B</b>. Começando em outra nota, a fórmula obriga a usar sustenidos ou bemóis. Em G, por exemplo, a 7ª nota precisa ser F# para manter o semitom entre 7 e 8.'],
      ['fret', { inst: 'both', notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'], root: 'G', fretMax: 7 }],
      ['play', { label: 'Ouvir G maior', kind: 'seq', notes: seq('G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F#3', 'G3') }],
      ['tip', 'Regra de escrita: cada letra aparece uma vez. Por isso F maior tem Bb, e não A#.'],
    ],
  },
  {
    id: '12', s: 'Gr', name: 'Graus', kind: 't', period: 3,
    desc: 'Numerar as notas da escala: o I, o IV e o V que todo mundo cita.',
    gens: ['degreeNote', 'degreeNote', 'scaleNth'],
    lesson: [
      ['p', 'Cada nota da escala ganha um número, o <b>grau</b>, normalmente em algarismos romanos: I, II, III, IV, V, VI, VII.'],
      ['table', { head: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'], rows: [['C', 'D', 'E', 'F', 'G', 'A', 'B'], ['G', 'A', 'B', 'C', 'D', 'E', 'F#'], ['D', 'E', 'F#', 'G', 'A', 'B', 'C#']] }],
      ['p', 'Pensar em graus é o que permite <b>transpor</b>: "I–IV–V" em C é C–F–G; em G é G–C–D. A música é a mesma, só muda o tom.'],
      ['tip', 'Quando alguém diz "essa música é I–V–VI–IV", está falando em graus. Você vai usar isso o tempo todo a partir do período 5.'],
    ],
  },
  {
    id: '13', s: 'Tn', name: 'Tonalidades', kind: 't', period: 3,
    desc: 'Descobrir em que tom a música está.',
    gens: ['keyBySignature', 'keyFromChords', 'keyFromChords'],
    lesson: [
      ['p', 'O <b>tom</b> de uma música é a escala que ela usa, e a nota que soa como "casa" (o grau I).'],
      ['p', 'Cada tom maior tem uma quantidade fixa de sustenidos ou bemóis, a <b>armadura</b>:'],
      ['table', {
        head: ['Tom', 'C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'],
        rows: [['Acidentes', '0', '1#', '2#', '3#', '4#', '1b', '2b', '3b']],
      }],
      ['h', 'Na prática, pela cifra'],
      ['list', [
        'O <b>último acorde</b> da música costuma ser o I.',
        'Os acordes mais frequentes costumam ser I, IV e V.',
        'Se todos os acordes cabem numa escala maior, é provável que seja esse o tom.',
      ]],
      ['tip', 'Você vai conferir isso nas suas músicas no Experimento deste período.'],
    ],
  },
  {
    id: '14', s: 'Cq', name: 'Ciclo de quintas', kind: 't', period: 3,
    desc: 'O mapa das 12 tonalidades e de quais são vizinhas.',
    gens: ['circleNext', 'circleNext', 'keyBySignature'],
    lesson: [
      ['p', 'Subindo de 5ª em 5ª a partir de C, você passa pelos 12 tons e volta ao começo. Cada passo acrescenta <b>um sustenido</b>:'],
      ['p', '<b>C → G → D → A → E → B → F#</b>'],
      ['p', 'No sentido contrário (subindo de 4ª em 4ª), cada passo acrescenta <b>um bemol</b>:'],
      ['p', '<b>C → F → Bb → Eb → Ab → Db → Gb</b>'],
      ['p', 'Tons vizinhos no ciclo têm quase as mesmas notas (só uma muda). Por isso modulações entre vizinhos soam naturais.'],
      ['h', 'Relativas'],
      ['p', 'Cada tom maior tem uma <b>relativa menor</b> com as mesmas notas, no 6º grau: C ↔ Am, G ↔ Em, F ↔ Dm.'],
      ['tip', 'O movimento de 4ª (C → F, G → C) é o mais comum entre acordes: é o caminho da dominante para a tônica.'],
    ],
  },
  {
    id: '15', s: 'Fe', name: 'Formas da escala', kind: 'v', period: 3,
    desc: 'A escala maior em regiões do braço do violão.',
    gens: ['scaleShapeFret'],
    lesson: [
      ['p', 'No violão, a escala maior pode ser tocada em várias <b>regiões</b> do braço sem trocar de posição da mão. Cada região tem um desenho próprio.'],
      ['p', 'O jeito mais útil de aprender é por partes: escolha 3 cordas vizinhas e 4 casas, e ache todas as notas da escala ali. Os exercícios deste elemento fazem exatamente isso.'],
      ['fret', { inst: 'violao', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], root: 'C', fretMax: 12 }],
      ['tip', 'Acima: todas as notas de C maior até a casa 12, com o C em destaque. Procure os desenhos que se repetem.'],
    ],
  },
  {
    id: 'X3', s: 'Ex', name: 'O tom de 3 músicas', kind: 'x', period: 3,
    desc: 'Descobrir pela cifra o tom de 3 músicas do seu repertório.',
    steps: [
      'Escolha 3 músicas que você toca no violão e abra a cifra de cada uma.',
      'Para cada música, liste os acordes que aparecem (sem repetir).',
      'Cole os acordes no analisador abaixo e veja o tom sugerido.',
      'Confira: o último acorde da música é o I desse tom?',
      'Anote o tom de cada música e quais graus ela usa.',
    ],
    analyzer: true,
  },

  // ── Período 4 · Acordes ──────────────────────────────
  {
    id: '16', s: 'Tr', name: 'Tríades', kind: 't', period: 4,
    desc: 'Maior, menor, diminuta e aumentada: três notas empilhadas em terças.',
    gens: ['triadNotes', 'triadName', 'triadEar', 'triadFacts', 'triadFret'],
    inst: true,
    lesson: [
      ['p', 'Uma <b>tríade</b> são três notas empilhadas de 3ª em 3ª: <b>tônica (1), 3ª e 5ª</b>. Todo acorde que você toca no violão é, no fundo, uma tríade com notas repetidas.'],
      ['table', {
        head: ['Tipo', 'Cifra', '3ª', '5ª', 'Exemplo'],
        rows: [['Maior', 'C', 'maior', 'justa', 'C E G'], ['Menor', 'Cm', 'menor', 'justa', 'C Eb G'], ['Diminuta', 'C°', 'menor', 'diminuta', 'C Eb Gb'], ['Aumentada', 'C+', 'maior', 'aumentada', 'C E G#']],
      }],
      ['play', { label: 'C maior', kind: 'chord', notes: seq('C3', 'E3', 'G3') }],
      ['play', { label: 'C menor', kind: 'chord', notes: seq('C3', 'Eb3', 'G3') }],
      ['play', { label: 'C diminuto', kind: 'chord', notes: seq('C3', 'Eb3', 'Gb3') }],
      ['fret', { inst: 'both', notes: ['C', 'E', 'G'], root: 'C', degrees: true, fretMax: 5 }],
      ['tip', 'O C aberto do violão (x32010) tem as notas C E G C E. Só três notas diferentes: uma tríade.'],
    ],
  },
  {
    id: '17', s: 'Te', name: 'Tétrades', kind: 't', period: 4,
    desc: 'A quarta nota do acorde: 7M, 7, m7, m7(b5) e °. Cifra de MPB é quase toda assim.',
    gens: ['tetradNotes', 'tetradName', 'tetradEar', 'tetradFacts'],
    lesson: [
      ['p', 'Somando mais uma 3ª em cima da tríade, chega-se à <b>7ª</b>. Acordes de quatro notas são as <b>tétrades</b>.'],
      ['table', {
        head: ['Cifra', 'Nome', 'Fórmula', 'Exemplo'],
        rows: [
          ['C7M', 'maior com 7ª maior', '1 3 5 7', 'C E G B'],
          ['C7', 'dominante', '1 3 5 b7', 'C E G Bb'],
          ['Cm7', 'menor com 7ª', '1 b3 5 b7', 'C Eb G Bb'],
          ['Cm7(b5)', 'meio-diminuto', '1 b3 b5 b7', 'C Eb Gb Bb'],
          ['C°7', 'diminuto', '1 b3 b5 bb7', 'C Eb Gb Bbb'],
        ],
      }],
      ['play', { label: 'C7M (calmo, sofisticado)', kind: 'chord', notes: seq('C3', 'E3', 'G3', 'B3') }],
      ['play', { label: 'C7 (tenso, quer resolver)', kind: 'chord', notes: seq('C3', 'E3', 'G3', 'Bb3') }],
      ['play', { label: 'Cm7 (suave)', kind: 'chord', notes: seq('C3', 'Eb3', 'G3', 'Bb3') }],
      ['play', { label: 'Cm7(b5)', kind: 'chord', notes: seq('C3', 'Eb3', 'Gb3', 'Bb3') }],
      ['tip', 'Cuidado com a leitura: o "7" sozinho é sempre 7ª <b>menor</b>. Para 7ª maior, a cifra diz <b>7M</b> (ou maj7).'],
    ],
  },
  {
    id: '18', s: 'Cf', name: 'Cifra', kind: 't', period: 4,
    desc: 'Ler qualquer cifra: C7(9), Am7, G/B, F#m7(b5).',
    gens: ['cifraRead', 'cifraRead', 'cifraRead'],
    lesson: [
      ['p', 'Toda cifra segue a mesma ordem:'],
      ['table', { head: ['Tônica', 'Tipo', 'Sétima', 'Tensões', 'Baixo'], rows: [['F#', 'm', '7', '(b5)', ''], ['C', '', '7', '(9)', ''], ['G', '', '', '', '/B']] }],
      ['list', [
        '<b>Letra</b> (com # ou b): a tônica.',
        '<b>m</b>: menor. Sem nada: maior. <b>°</b>: diminuto. <b>+</b>: aumentado.',
        '<b>7</b>: 7ª menor. <b>7M</b>: 7ª maior.',
        '<b>Parênteses</b>: tensões, notas extras como 9, 11 e 13.',
        '<b>Barra</b>: a nota do baixo, quando não é a tônica.',
      ]],
      ['p', 'As tensões são notas da escala uma oitava acima: <b>9 = 2ª</b>, <b>11 = 4ª</b>, <b>13 = 6ª</b>. Em C7(9), a 9ª é D.'],
      ['tip', 'Algumas cifras escrevem C9 em vez de C7(9). As duas querem dizer acorde dominante com 9ª.'],
    ],
  },
  {
    id: '19', s: 'Ar', name: 'Do acorde ao arpejo', kind: 'p', period: 4,
    desc: 'Tocar no baixo, nota por nota, o acorde que você já faz no violão.',
    gens: ['arpeggioBass', 'arpeggioBass', 'arpeggioFacts'],
    lesson: [
      ['p', 'No violão você toca as notas do acorde juntas. No baixo, você toca as <b>mesmas notas uma de cada vez</b>: isso é um <b>arpejo</b>.'],
      ['p', 'O desenho é o mesmo das 4 cordas graves do violão. Pegue o acorde que você conhece, identifique tônica, 3ª e 5ª, e toque-as em sequência no baixo.'],
      ['fret', { inst: 'both', notes: ['G', 'B', 'D'], root: 'G', degrees: true, fretMax: 5 }],
      ['play', { label: 'G no violão (acorde)', kind: 'chord', notes: seq('G2', 'B2', 'D3', 'G3', 'B3', 'G4') }],
      ['play', { label: 'G no baixo (arpejo 1–3–5–8)', kind: 'seq', notes: seq('G1', 'B1', 'D2', 'G2') }],
      ['tip', 'Quase toda linha de baixo começa assim: notas do acorde, no ritmo da música.'],
    ],
  },
  {
    id: '20', s: 'Bx', name: 'Baixo da cifra', kind: 'p', period: 4,
    desc: 'Em C/E, o E é a nota do baixista. A barra da cifra é a ponte entre os dois instrumentos.',
    gens: ['slashBass', 'slashBass', 'cifraRead'],
    lesson: [
      ['p', 'Quando a cifra tem barra, como <b>C/E</b>, a nota depois da barra é a <b>mais grave</b>. No violão você faz um C com o E no baixo; no baixo, você toca <b>E</b>.'],
      ['list', [
        '<b>C/E</b>: 3ª no baixo (primeira inversão).',
        '<b>C/G</b>: 5ª no baixo (segunda inversão).',
        '<b>C/Bb</b>: 7ª no baixo.',
      ]],
      ['p', 'Inversões servem para o baixo <b>caminhar</b>. Em C – G/B – Am, o baixo desce C – B – A, uma linha suave em vez de pular.'],
      ['play', { label: 'Baixo de C – G/B – Am – G', kind: 'seq', notes: seq('C2', 'B1', 'A1', 'G1') }],
      ['tip', 'Se a cifra não tem barra, o baixo toca a tônica. Se tem, toca a nota da barra.'],
    ],
  },
  {
    id: 'X4', s: 'Ex', name: 'Cifra nos dois braços', kind: 'x', period: 4,
    desc: 'Ler a cifra de uma música de pop rock nacional e montar cada acorde no violão e no baixo.',
    steps: [
      'Escolha uma música de pop rock nacional que você toca (Skank, Nando Reis, Cássia Eller, Lulu Santos...).',
      'Para cada acorde da cifra, escreva as notas (tônica, 3ª, 5ª e 7ª, se houver).',
      'Toque cada acorde no violão e confira as notas.',
      'No baixo, toque a tônica (ou a nota da barra) de cada acorde no ritmo da música.',
      'Depois, troque a tônica por um arpejo curto (1–3–5) em cada acorde.',
    ],
    analyzer: true,
  },

  // ── Período 5 · Harmonia ─────────────────────────────
  {
    id: '21', s: 'Ch', name: 'Campo harmônico', kind: 't', period: 5,
    desc: 'Os 7 acordes que nascem da escala maior.',
    gens: ['fieldChord', 'fieldChord', 'notInField', 'fieldFacts'],
    lesson: [
      ['p', 'Empilhando 3ªs sobre cada nota da escala maior, usando só notas da escala, surgem 7 acordes: o <b>campo harmônico</b>.'],
      ['table', {
        head: ['Grau', 'I', 'IIm', 'IIIm', 'IV', 'V', 'VIm', 'VII°'],
        rows: [['C', 'C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°'], ['G', 'G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#°']],
      }],
      ['p', 'Em tétrades: <b>I7M, IIm7, IIIm7, IV7M, V7, VIm7, VIIm7(b5)</b>. Em C: C7M Dm7 Em7 F7M G7 Am7 Bm7(b5).'],
      ['p', 'Esse padrão de maiores e menores é igual em qualquer tom. Sabendo o campo, você já sabe quais acordes "combinam" numa música.'],
      ['play', { label: 'Campo de C (tríades)', kind: 'chords', chords: [seq('C3', 'E3', 'G3'), seq('D3', 'F3', 'A3'), seq('E3', 'G3', 'B3'), seq('F3', 'A3', 'C4'), seq('G3', 'B3', 'D4'), seq('A3', 'C4', 'E4'), seq('B3', 'D4', 'F4')] }],
      ['tip', 'Use a aba Consulta para ver o campo harmônico de qualquer tom.'],
    ],
  },
  {
    id: '22', s: 'Fn', name: 'Funções', kind: 't', period: 5,
    desc: 'Tônica, subdominante e dominante: repouso, afastamento e tensão.',
    gens: ['functionOf', 'functionOf', 'functionFacts'],
    lesson: [
      ['p', 'Cada acorde do campo tem um papel, uma <b>função</b>:'],
      ['table', {
        head: ['Função', 'Sensação', 'Graus'],
        rows: [['Tônica (T)', 'repouso, casa', 'I, VIm, IIIm'], ['Subdominante (SD)', 'afastamento, movimento', 'IV, IIm'], ['Dominante (D)', 'tensão, pede resolução', 'V7, VIIm7(b5)']],
      }],
      ['p', 'A maioria das progressões é um passeio entre essas funções: sai da tônica, se afasta, cria tensão e volta. <b>T → SD → D → T</b>.'],
      ['p', 'Acordes da mesma função podem se substituir: no lugar do C, toque Am; no lugar do F, toque Dm.'],
      ['play', { label: 'C – F – G7 – C (T SD D T)', kind: 'chords', chords: [seq('C3', 'E3', 'G3'), seq('C3', 'F3', 'A3'), seq('B2', 'D3', 'F3', 'G3'), seq('C3', 'E3', 'G3')] }],
    ],
  },
  {
    id: '23', s: 'Cd', name: 'Cadências', kind: 't', period: 5,
    desc: 'Como as músicas pontuam as frases e terminam.',
    gens: ['cadence'],
    lesson: [
      ['p', 'Cadência é o final de uma frase musical, a "pontuação" da harmonia.'],
      ['table', {
        head: ['Cadência', 'Movimento', 'Efeito'],
        rows: [['Autêntica', 'V → I', 'ponto final'], ['Plagal', 'IV → I', 'final suave, "amém"'], ['Suspensiva', '... → V', 'vírgula, ficou no ar'], ['Interrompida', 'V → VIm', 'surpresa: ia resolver e não resolveu']],
      }],
      ['play', { label: 'Autêntica: G7 → C', kind: 'chords', chords: [seq('G2', 'B2', 'D3', 'F3'), seq('C3', 'E3', 'G3')] }],
      ['play', { label: 'Plagal: F → C', kind: 'chords', chords: [seq('F2', 'A2', 'C3'), seq('E2', 'G2', 'C3')] }],
      ['play', { label: 'Interrompida: G7 → Am', kind: 'chords', chords: [seq('G2', 'B2', 'D3', 'F3'), seq('A2', 'C3', 'E3')] }],
    ],
  },
  {
    id: '24', s: 'Iv', name: 'II–V–I', kind: 't', period: 5,
    desc: 'A progressão mais usada, do jazz ao pop e à MPB.',
    gens: ['iiVI', 'iiVI', 'iiVI'],
    lesson: [
      ['p', '<b>IIm7 – V7 – I7M</b> é a frase SD → D → T mais comum que existe. Em C: <b>Dm7 – G7 – C7M</b>.'],
      ['p', 'O baixo anda de 4ª em 4ª (D → G → C), e a 7ª de cada acorde desce um semitom para a 3ª do próximo. Por isso soa tão natural.'],
      ['play', { label: 'Dm7 – G7 – C7M', kind: 'chords', chords: [seq('D3', 'F3', 'A3', 'C4'), seq('G2', 'B2', 'D3', 'F3'), seq('C3', 'E3', 'G3', 'B3')] }],
      ['p', 'Muitas músicas encadeiam vários II–V seguidos, passando por tons diferentes. Achar os II–V numa cifra é o primeiro passo para entender harmonias mais ricas.'],
      ['tip', 'Exercício de bolso: toque o II–V–I nos 12 tons, seguindo o ciclo de quintas.'],
    ],
  },
  {
    id: '25', s: 'Ds', name: 'Dominantes secundários', kind: 't', period: 5,
    desc: 'Acordes de fora do tom que puxam para outro grau do campo.',
    gens: ['secondaryDominant', 'secondaryDominant', 'cadence'],
    lesson: [
      ['p', 'Qualquer acorde do campo (menos o VII°) pode ganhar o seu próprio V7. Esse acorde de fora do tom, que resolve num grau do campo, é um <b>dominante secundário</b>.'],
      ['table', {
        head: ['Em C', 'V7/II', 'V7/III', 'V7/IV', 'V7/V', 'V7/VI'],
        rows: [['Dominante', 'A7', 'B7', 'C7', 'D7', 'E7'], ['Resolve em', 'Dm', 'Em', 'F', 'G', 'Am']],
      }],
      ['p', 'Ele soa como um "empurrão" para o acorde seguinte. É o que acontece quando, em C, aparece um A7 antes do Dm, ou um E7 antes do Am.'],
      ['play', { label: 'C – A7 – Dm – G7 – C', kind: 'chords', chords: [seq('C3', 'E3', 'G3'), seq('A2', 'C#3', 'E3', 'G3'), seq('D3', 'F3', 'A3'), seq('G2', 'B2', 'D3', 'F3'), seq('C3', 'E3', 'G3')] }],
      ['tip', 'Na cifra: um acorde 7 que não é o V do tom e que vai para um acorde uma 5ª abaixo é quase sempre um dominante secundário.'],
    ],
  },
  {
    id: 'X5', s: 'Ex', name: 'Funções na cifra', kind: 'x', period: 5,
    desc: 'Marcar graus e funções na cifra de uma música e achar os dominantes secundários.',
    steps: [
      'Escolha uma música de MPB ou pop rock com acordes com 7ª.',
      'Cole a sequência de acordes no analisador.',
      'Para cada acorde, confira o grau e a função (T, SD, D) sugeridos.',
      'Marque os dominantes secundários e para onde cada um resolve.',
      'Procure os II–V da música.',
    ],
    analyzer: true,
  },

  // ── Período 6 · Menor ────────────────────────────────
  {
    id: '26', s: 'Mn', name: 'Menor natural', kind: 't', period: 6,
    desc: 'A escala menor e a maior relativa: mesmas notas, outro centro.',
    gens: ['naturalMinorNotes', 'relativeMajorQ', 'naturalMinorNotes'],
    lesson: [
      ['p', 'A escala menor natural tem a fórmula <b>T S T T S T T</b>. Comparada à maior, ela tem <b>3ª, 6ª e 7ª menores</b>.'],
      ['p', '<b>A menor</b>: A B C D E F G. As mesmas notas de C maior, mas começando no A. A e C são <b>relativos</b>.'],
      ['fret', { inst: 'both', notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], root: 'A', fretMax: 8 }],
      ['play', { label: 'A menor natural', kind: 'seq', notes: seq('A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3') }],
      ['tip', 'Para achar a relativa menor de um tom maior, desça uma 3ª menor (ou suba até o 6º grau).'],
    ],
  },
  {
    id: '27', s: 'Mh', name: 'Menor harmônica', kind: 't', period: 6,
    desc: 'A 7ª elevada que cria o acorde dominante no tom menor.',
    gens: ['harmonicMinorNotes', 'harmonicChange', 'harmonicChange'],
    lesson: [
      ['p', 'Na menor natural, o V é menor (em A menor, Em) e não tem a tensão de uma dominante de verdade.'],
      ['p', 'A <b>menor harmônica</b> sobe a 7ª um semitom: <b>A B C D E F G#</b>. Com isso o V vira <b>E7</b>, que puxa forte para o Am.'],
      ['play', { label: 'A menor harmônica', kind: 'seq', notes: seq('A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G#3', 'A3') }],
      ['play', { label: 'Em → Am (sem tensão)', kind: 'chords', chords: [seq('E2', 'G2', 'B2', 'D3'), seq('A2', 'C3', 'E3')] }],
      ['play', { label: 'E7 → Am (com tensão)', kind: 'chords', chords: [seq('E2', 'G#2', 'B2', 'D3'), seq('A2', 'C3', 'E3')] }],
      ['tip', 'Por isso em músicas em tom menor quase sempre aparece um acorde maior (ou 7) no V: E7 em Am, B7 em Em.'],
    ],
  },
  {
    id: '28', s: 'Ml', name: 'Menor melódica', kind: 't', period: 6,
    desc: 'A versão que sobe a 6ª e a 7ª, comum no jazz e na MPB.',
    gens: ['melodicMinorNotes', 'melodicFacts', 'melodicMinorNotes'],
    lesson: [
      ['p', 'A menor harmônica tem um salto estranho entre a 6ª e a 7ª (F → G# em A menor). A <b>menor melódica</b> resolve isso subindo também a 6ª: <b>A B C D E F# G#</b>.'],
      ['p', 'Ela é igual à escala maior, mas com a <b>3ª menor</b>. Soa menor e sofisticada ao mesmo tempo.'],
      ['play', { label: 'A menor melódica', kind: 'seq', notes: seq('A2', 'B2', 'C3', 'D3', 'E3', 'F#3', 'G#3', 'A3') }],
      ['tip', 'Na música erudita ela só é usada subindo. No jazz e na MPB, é usada nos dois sentidos.'],
    ],
  },
  {
    id: '29', s: 'Cm', name: 'Campo menor', kind: 't', period: 6,
    desc: 'Os acordes do tom menor e de onde vem cada um.',
    gens: ['minorField', 'minorField', 'harmonicChange'],
    lesson: [
      ['p', 'O campo harmônico da menor natural, em A menor:'],
      ['table', { head: ['Im7', 'IIm7(b5)', 'bIII7M', 'IVm7', 'Vm7', 'bVI7M', 'bVII7'], rows: [['Am7', 'Bm7(b5)', 'C7M', 'Dm7', 'Em7', 'F7M', 'G7']] }],
      ['p', 'Na prática, o tom menor mistura escalas: o V costuma vir da harmônica (<b>E7</b> em vez de Em7) para ter força na resolução.'],
      ['p', 'O "b" na frente do grau (bIII, bVI, bVII) indica que ele é um semitom mais baixo do que o grau equivalente na escala maior.'],
      ['play', { label: 'Am – Dm – E7 – Am', kind: 'chords', chords: [seq('A2', 'C3', 'E3'), seq('A2', 'D3', 'F3'), seq('G#2', 'B2', 'D3', 'E3'), seq('A2', 'C3', 'E3')] }],
    ],
  },
  {
    id: '30', s: 'Im', name: 'II–V–I menor', kind: 't', period: 6,
    desc: 'A cadência do tom menor: m7(b5), 7 e m.',
    gens: ['minorIIVI', 'minorIIVI', 'minorField'],
    lesson: [
      ['p', 'No tom menor, o II–V–I fica <b>IIm7(b5) – V7 – Im</b>. Em A menor: <b>Bm7(b5) – E7 – Am</b>.'],
      ['play', { label: 'Bm7(b5) – E7 – Am', kind: 'chords', chords: [seq('B2', 'D3', 'F3', 'A3'), seq('E2', 'G#2', 'B2', 'D3'), seq('A2', 'C3', 'E3')] }],
      ['p', 'O meio-diminuto no lugar do IIm7 é o sinal mais claro de que a música está indo para um acorde menor.'],
      ['tip', 'Na cifra, quando aparecer um m7(b5) seguido de um 7, procure um acorde menor logo depois.'],
    ],
  },
  {
    id: 'X6', s: 'Ex', name: 'Uma música em menor', kind: 'x', period: 6,
    desc: 'Analisar uma música em tom menor e achar os acordes que vêm da menor harmônica.',
    steps: [
      'Escolha uma música em tom menor do seu repertório.',
      'Cole os acordes no analisador e confirme o tom menor.',
      'Ache o V: ele é menor (natural) ou maior/7 (harmônica)?',
      'Procure II–V–I menores (m7(b5) – 7 – m).',
      'Toque a progressão no violão e a linha de tônicas no baixo.',
    ],
    analyzer: true,
  },

  // ── Período 7 · Ritmo ────────────────────────────────
  {
    id: '31', s: 'Fg', name: 'Figuras', kind: 't', period: 7,
    desc: 'Da semibreve à semicolcheia: quanto dura cada nota.',
    gens: ['figures'],
    lesson: [
      ['p', 'As <b>figuras</b> dizem quanto tempo cada nota dura. Cada uma vale metade da anterior:'],
      ['table', {
        head: ['Figura', 'Duração (em 4/4)', 'Cabem num compasso de 4/4'],
        rows: [['Semibreve', '4 tempos', '1'], ['Mínima', '2 tempos', '2'], ['Semínima', '1 tempo', '4'], ['Colcheia', '½ tempo', '8'], ['Semicolcheia', '¼ de tempo', '16']],
      }],
      ['rhythm', { label: 'Semínimas (uma por tempo)', steps: [1, 0, 1, 0, 1, 0, 1, 0], perBeat: 2 }],
      ['rhythm', { label: 'Colcheias (duas por tempo)', steps: [1, 1, 1, 1, 1, 1, 1, 1], perBeat: 2 }],
      ['tip', 'Nos diagramas de ritmo do app, cada quadrado é uma colcheia e os números marcam os tempos.'],
    ],
  },
  {
    id: '32', s: 'Cp', name: 'Compassos', kind: 't', period: 7,
    desc: '4/4, 2/4, 3/4 e 6/8: como o tempo se agrupa.',
    gens: ['meterFacts', 'meterEar', 'meterEar'],
    lesson: [
      ['p', 'O <b>compasso</b> agrupa os tempos. O número de cima diz quantos tempos; o de baixo, qual figura vale um tempo (4 = semínima, 8 = colcheia).'],
      ['table', {
        head: ['Compasso', 'Contagem', 'Onde aparece'],
        rows: [['4/4', 'UM dois três quatro', 'rock, pop, quase tudo'], ['2/4', 'UM dois', 'samba, marchinha, baião'], ['3/4', 'UM dois três', 'valsa, algumas baladas'], ['6/8', 'UM dois três QUA cinco seis', 'baladas, blues lento']],
      }],
      ['play', { label: 'Ouvir 4/4', kind: 'meter', beats: 4 }],
      ['play', { label: 'Ouvir 3/4', kind: 'meter', beats: 3 }],
      ['tip', 'O primeiro tempo é o mais forte. Achar o "1" é o primeiro passo para tocar junto com a banda.'],
    ],
  },
  {
    id: '33', s: 'Sb', name: 'Subdivisão', kind: 't', period: 7,
    desc: 'Contar em 2, 3 e 4 dentro de cada tempo.',
    gens: ['subdivisionEar', 'subdivisionFacts', 'subdivisionEar'],
    lesson: [
      ['p', '<b>Subdividir</b> é dividir cada tempo em partes iguais e contá-las mentalmente. É o que dá precisão ao ritmo.'],
      ['list', ['Em 2: <b>1 e 2 e 3 e 4 e</b> (colcheias)', 'Em 4: <b>1 e e a 2 e e a</b>... (semicolcheias)', 'Em 3: <b>1 e a 2 e a</b>... (tercinas)']],
      ['rhythm', { label: 'Tempos 1 e 3', steps: [1, 0, 0, 0, 1, 0, 0, 0], perBeat: 2 }],
      ['rhythm', { label: 'Galope', steps: [1, 0, 1, 1, 1, 0, 1, 1], perBeat: 2 }],
      ['tip', 'Pratique com metrônomo bem lento, contando em voz alta.'],
    ],
  },
  {
    id: '34', s: 'Sc', name: 'Síncope', kind: 't', period: 7,
    desc: 'A nota que antecipa o tempo forte.',
    gens: ['syncopeEar', 'syncopeVisual', 'syncopeEar'],
    lesson: [
      ['p', '<b>Síncope</b> é quando uma nota começa num tempo fraco (entre os tempos) e se prolonga por cima do tempo forte seguinte. O acento "desloca".'],
      ['rhythm', { label: 'Sem síncope', steps: [1, 0, 1, 0, 1, 0, 1, 0], perBeat: 2 }],
      ['rhythm', { label: 'Com síncope (3 + 3 + 2)', steps: [1, 0, 0, 1, 0, 0, 1, 0], perBeat: 2 }],
      ['p', 'O padrão 3 + 3 + 2 aparece em muita coisa: pop, rock, baião, reggaeton. A música brasileira em geral é cheia de síncopes.'],
    ],
  },
  {
    id: '35', s: 'Ct', name: 'Contratempo', kind: 't', period: 7,
    desc: 'Tocar entre os tempos: a base do reggae e do ska.',
    gens: ['offbeatEar', 'offbeatFacts', 'offbeatEar'],
    lesson: [
      ['p', '<b>Contratempo</b> é tocar só nos "e" (entre os tempos), deixando o tempo em silêncio.'],
      ['rhythm', { label: 'Contratempo', steps: [0, 1, 0, 1, 0, 1, 0, 1], perBeat: 2 }],
      ['p', 'No reggae e no ska, a guitarra ou o violão base faz esse "tchá" no contratempo, enquanto o baixo e a bateria seguram os tempos. A sensação de balanço vem desse encaixe.'],
      ['tip', 'Experimente: conte 1 e 2 e 3 e 4 e, e só toque o acorde no "e".'],
    ],
  },
  {
    id: 'X7', s: 'Ex', name: 'Onde cai a levada', kind: 'x', period: 7,
    desc: 'Marcar a levada de uma música de reggae ou ska: onde cai o contratempo.',
    steps: [
      'Escolha uma música com levada de reggae ou ska (Paralamas e Skank têm várias).',
      'Ouça e conte os tempos em voz alta (1 e 2 e 3 e 4 e).',
      'Marque onde a guitarra base toca: tempo ou contratempo?',
      'Toque a levada no violão, abafando as cordas entre as batidas.',
      'No baixo, toque as tônicas nos tempos enquanto ouve a música.',
    ],
    analyzer: false,
  },

  // ── Período 8 · Baixo ────────────────────────────────
  {
    id: '36', s: 'Fb', name: 'Função do baixo', kind: 'b', period: 8,
    desc: 'Ligar harmonia e ritmo: o que o baixo faz numa banda.',
    gens: ['bassRoleFacts'],
    lesson: [
      ['p', 'O baixo tem dois trabalhos ao mesmo tempo:'],
      ['list', ['<b>Harmonia</b>: a nota do baixo define como o ouvido percebe o acorde. Se o violão toca C e o baixo toca E, a banda soa C/E.', '<b>Ritmo</b>: junto com o bumbo da bateria, o baixo marca onde cai o peso de cada tempo.']],
      ['p', 'Uma boa linha de baixo é, antes de tudo, <b>firme</b>: nota certa, no lugar certo, com a duração certa. Enfeite vem depois.'],
      ['tip', 'Ouça uma música que você gosta prestando atenção só no baixo. Ele toca tônicas? Arpejos? Notas de passagem?'],
    ],
  },
  {
    id: '37', s: 'Tq', name: 'Tônica e quinta', kind: 'b', period: 8,
    desc: 'A base de quase toda linha de baixo.',
    gens: ['rootFifth', 'rootFifth'],
    lesson: [
      ['p', 'A 5ª justa serve para quase todo acorde (maior, menor, com 7ª). Tônica e 5ª são a base mais segura para uma linha de baixo.'],
      ['p', 'No baixo, a 5ª fica <b>uma corda acima, duas casas à frente</b>. A 5ª grave fica <b>na mesma casa, uma corda abaixo</b>.'],
      ['fret', { inst: 'baixo', notes: ['C', 'G'], root: 'C', degrees: true, fretMax: 7 }],
      ['play', { label: 'C – G – C – G (tônica e 5ª)', kind: 'seq', notes: seq('C2', 'G2', 'C2', 'G1') }],
      ['tip', 'Cuidado com acordes diminutos e meio-diminutos: neles a 5ª é diminuta, e a 5ª justa vai soar errada.'],
    ],
  },
  {
    id: '38', s: 'Na', name: 'Notas-alvo', kind: 'b', period: 8,
    desc: 'Escolher a nota de chegada em cada acorde.',
    gens: ['targetNote', 'targetNote'],
    lesson: [
      ['p', '<b>Nota-alvo</b> é a nota em que você quer chegar no tempo 1 de cada acorde. O caminho até ela pode variar; o destino precisa ser claro.'],
      ['list', ['A <b>tônica</b> é o alvo mais seguro.', 'A <b>3ª</b> deixa a linha mais melódica e define se o acorde é maior ou menor.', 'A <b>5ª</b> é neutra e estável.']],
      ['p', 'Pense na linha como uma conversa entre os acordes: no fim de cada um, você já está olhando para o alvo do próximo.'],
    ],
  },
  {
    id: '39', s: 'Ap', name: 'Aproximação cromática', kind: 'b', period: 8,
    desc: 'Chegar no próximo acorde por semitom.',
    gens: ['chromaticApproach', 'chromaticApproach'],
    lesson: [
      ['p', 'Uma das formas mais usadas de chegar à nota-alvo: tocar, logo antes dela, a nota <b>um semitom abaixo ou acima</b>.'],
      ['play', { label: 'C – C – C – F#, chegando em G', kind: 'seq', notes: seq('C2', 'C2', 'C2', 'F#2', 'G2') }],
      ['p', 'A nota de aproximação pode estar fora do acorde e até fora do tom: o que importa é que ela resolve um semitom depois.'],
      ['tip', 'Em todo walking bass e em muita linha de samba e funk você ouve isso no último tempo antes da troca de acorde.'],
    ],
  },
  {
    id: '40', s: 'Gv', name: 'Grooves por estilo', kind: 'b', period: 8,
    desc: 'O mesmo II–V–I tocado como rock, reggae, samba e funk.',
    gens: ['grooveFacts'],
    lesson: [
      ['p', 'Com as mesmas notas, o estilo muda pelo <b>ritmo</b> e pela <b>escolha das notas</b>:'],
      ['table', {
        head: ['Estilo', 'Característica'],
        rows: [['Rock', 'colcheias constantes na tônica'], ['Reggae', 'grave, melódico, com bastante espaço'], ['Samba', 'tônica e 5ª, imitando o surdo'], ['Funk e soul', 'semicolcheias sincopadas e notas abafadas'], ['Jazz (walking)', 'uma nota por tempo, caminhando entre os acordes']],
      }],
      ['rhythm', { label: 'Rock: colcheias', steps: [1, 1, 1, 1, 1, 1, 1, 1], perBeat: 2 }],
      ['rhythm', { label: 'Síncope de funk/pop', steps: [1, 0, 0, 1, 0, 0, 1, 0], perBeat: 2 }],
      ['tip', 'No Experimento deste período, você cria a linha de baixo de uma música sua, escolhendo o estilo.'],
    ],
  },
  {
    id: 'X8', s: 'Ex', name: 'Sua linha de baixo', kind: 'x', period: 8,
    desc: 'Criar a linha de baixo de uma música que você toca no violão.',
    steps: [
      'Escolha uma música que você toca bem no violão.',
      'Escreva a sequência de acordes (o analisador ajuda a ver graus e funções).',
      'Primeira versão: só tônicas, no ritmo da música.',
      'Segunda versão: tônica e 5ª.',
      'Terceira versão: escolha notas-alvo e use aproximações cromáticas nas trocas de acorde.',
      'Grave ou toque junto com a música original e ajuste.',
    ],
    analyzer: true,
  },

  // ── Período 9 · Avançado ─────────────────────────────
  {
    id: '41', s: 'Pt', name: 'Pentatônicas', kind: 't', period: 9,
    desc: 'A escala de cinco notas do rock e do blues.',
    gens: ['pentatonic', 'pentaFacts', 'pentatonic'],
    lesson: [
      ['p', 'A <b>pentatônica</b> tem 5 notas e nenhum semitom, por isso quase nada soa "errado".'],
      ['list', ['<b>Maior</b>: escala maior sem a 4ª e a 7ª. C: C D E G A.', '<b>Menor</b>: menor natural sem a 2ª e a 6ª. Am: A C D E G.']],
      ['p', 'A pentatônica de A menor tem as mesmas notas da de C maior: são relativas.'],
      ['fret', { inst: 'both', notes: ['A', 'C', 'D', 'E', 'G'], root: 'A', fretMax: 8 }],
      ['play', { label: 'A pentatônica menor', kind: 'seq', notes: seq('A2', 'C3', 'D3', 'E3', 'G3', 'A3') }],
    ],
  },
  {
    id: '42', s: 'Bl', name: 'Blues', kind: 't', period: 9,
    desc: 'A forma de 12 compassos e a blue note.',
    gens: ['blues', 'blues'],
    lesson: [
      ['p', 'O blues tradicional tem <b>12 compassos</b> e três acordes, todos dominantes (7):'],
      ['table', { head: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], rows: [['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7']] }],
      ['p', 'A <b>escala blues</b> é a pentatônica menor com uma nota a mais, a <b>5ª diminuta</b>, chamada blue note. Em A: A C D <b>Eb</b> E G.'],
      ['play', { label: 'A blues', kind: 'seq', notes: seq('A2', 'C3', 'D3', 'Eb3', 'E3', 'G3', 'A3') }],
      ['tip', 'Rock, pop e MPB pegam muito emprestado do blues: acordes dominantes no I e no IV e frases com a pentatônica.'],
    ],
  },
  {
    id: '43', s: 'Md', name: 'Modos', kind: 't', period: 9,
    desc: 'Dórico, mixolídio e os outros: a escala maior vista de outro ponto.',
    gens: ['modes', 'modes', 'modes'],
    lesson: [
      ['p', 'Tocar as notas de C maior começando em cada grau gera 7 <b>modos</b>, cada um com uma cor:'],
      ['table', {
        head: ['Grau', 'Modo', 'Exemplo', 'Cor'],
        rows: [['I', 'Jônio', 'C D E F G A B', 'a escala maior'], ['II', 'Dórico', 'D E F G A B C', 'menor com 6ª maior'], ['III', 'Frígio', 'E F G A B C D', 'menor com 2ª menor'], ['IV', 'Lídio', 'F G A B C D E', 'maior com 4ª aumentada'], ['V', 'Mixolídio', 'G A B C D E F', 'maior com 7ª menor'], ['VI', 'Eólio', 'A B C D E F G', 'a menor natural'], ['VII', 'Lócrio', 'B C D E F G A', 'menor com 5ª diminuta']],
      }],
      ['p', 'Os mais usados no pop, no rock e na MPB são o <b>mixolídio</b> (combina com acordes 7) e o <b>dórico</b> (menor mais "aberto").'],
    ],
  },
  {
    id: '44', s: 'Ep', name: 'Empréstimo modal', kind: 't', period: 9,
    desc: 'Acordes emprestados do tom menor dentro do tom maior.',
    gens: ['modalBorrowing', 'borrowingFacts', 'modalBorrowing'],
    lesson: [
      ['p', '<b>Empréstimo modal</b> é usar, no tom maior, acordes do tom menor com a <b>mesma tônica</b>. Em C maior, os empréstimos vêm de C menor.'],
      ['table', { head: ['Grau', 'IVm', 'bVI', 'bVII', 'bIII'], rows: [['Em C', 'Fm', 'Ab', 'Bb', 'Eb']] }],
      ['play', { label: 'C – F – Fm – C', kind: 'chords', chords: [seq('C3', 'E3', 'G3'), seq('C3', 'F3', 'A3'), seq('C3', 'F3', 'Ab3'), seq('C3', 'E3', 'G3')] }],
      ['p', 'O IVm (Fm em C) é um dos empréstimos mais usados no pop rock nacional e na MPB: traz uma sombra melancólica antes de voltar para casa.'],
      ['tip', 'No analisador, esses acordes aparecem como "empréstimo modal".'],
    ],
  },
  {
    id: '45', s: 'Tc', name: 'Tensões', kind: 't', period: 9,
    desc: '9, 11 e 13: as notas que dão cor ao acorde.',
    gens: ['tensions', 'tensionFacts', 'tensions'],
    lesson: [
      ['p', 'Acima da 7ª, continuando a empilhar 3ªs, vêm as <b>tensões</b>: <b>9</b>, <b>11</b> e <b>13</b>. São a 2ª, a 4ª e a 6ª, uma oitava acima.'],
      ['table', { head: ['Tensão', 'Em C', 'Alterações'], rows: [['9', 'D', 'b9 (Db), #9 (D#)'], ['11', 'F', '#11 (F#)'], ['13', 'A', 'b13 (Ab)']] }],
      ['list', ['Em acordes <b>7M</b>: 9 e #11 soam bem.', 'Em acordes <b>m7</b>: 9 e 11.', 'Em acordes <b>7</b>: quase todas, incluindo as alteradas (b9, #9, b13).']],
      ['play', { label: 'C7M(9)', kind: 'chord', notes: seq('C3', 'E3', 'G3', 'B3', 'D4') }],
      ['play', { label: 'G7(13)', kind: 'chord', notes: seq('G2', 'B2', 'F3', 'E4') }],
      ['tip', 'É esse tipo de acorde que dá o som característico de Djavan, Gil e boa parte da MPB.'],
    ],
  },
  {
    id: 'X9', s: 'Ex', name: 'O desafio Djavan', kind: 'x', period: 9,
    desc: 'Analisar uma música do Djavan: o desafio final, que usa quase tudo da trilha.',
    steps: [
      'Escolha uma música do Djavan e abra a cifra.',
      'Cole os acordes no analisador e veja o tom sugerido.',
      'Identifique: II–V, dominantes secundários, empréstimos e tensões.',
      'Marque os acordes que o analisador não explica e tente entender cada um.',
      'Toque a harmonia no violão e crie uma linha de baixo para o refrão.',
    ],
    analyzer: true,
  },
];

export const byId = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));
export const ORDER = ELEMENTS.map((e) => e.id);
export const NON_EXP = ELEMENTS.filter((e) => e.kind !== 'x');
export const inPeriod = (n) => ELEMENTS.filter((e) => e.period === n);

// Elementos cujo exercício usa o braço (e por isso tem nível por instrumento).
export function usesInstrument(e) {
  return e.kind === 'v' || e.kind === 'b' || e.kind === 'p' || !!e.inst;
}
