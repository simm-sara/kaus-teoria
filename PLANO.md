# Kaus Teoria — plano

Aplicação web para estudar teoria musical aplicada ao violão e ao baixo, com trilha gamificada e identidade visual da Kaus Lab. Uso principal: no computador.

## Para quem

Para mim: toco violão há anos de ouvido e com cifra, comecei no baixo há um ano e nunca estudei teoria de forma organizada. Repertório eclético: pop rock nacional (Skank, Lulu Santos, Paralamas, Cássia Eller, Nando Reis, CPM 22, Ana Carolina), MPB (Gilberto Gil, Djavan, 5 a Seco), pop e rock estrangeiros.

Objetivo: entender o porquê do que já toco no violão e usar isso para destravar o baixo.

## Princípios

- **Navegação muito simples**: 3 abas, nada mais.
- **Lições curtas**: um conceito por vez, logo seguido de prática.
- **Do violão para o baixo**: o violão é o que conheço, então serve de ponto de partida para o baixo.
- **Música real**: cada conceito aparece em músicas do meu repertório.
- **Errar não pune**: o erro só faz o assunto voltar mais cedo na revisão.

## Conceito visual

A identidade é a da Kaus Lab (design system "Kaus Lab" no claude.ai): papel e grafite, óxido como reagente, Archivo expandida e Martian Mono, tudo quadrado, desenho técnico.

**A trilha é uma tabela periódica da música.** Cada conceito é um elemento com número, sigla e nome (por exemplo, `Nt` Notas, `In` Intervalos, `Em` Escala maior, `Tr` Tríades, `Ch` Campo harmônico). A tabela vai se preenchendo conforme avanço.

- **Óxido = um ponto por tela**: o próximo elemento a estudar, a nota certa no braço, a resposta certa.
- **Desenho técnico = diagramas**: braços e pentagrama desenhados como prancha. Linhas de construção em musgo (intervalos, distâncias em casas), ponto de interesse em óxido.
- **Selo técnico** no rodapé com progresso, sequência de dias e XP.
- Sem emoji, sem sombra, texto direto em primeira pessoa.

## Navegação

1. **Trilha**: a tabela periódica. Toco no elemento, leio uma lição curta e faço os exercícios.
2. **Treino**: 5 minutos por dia, misturando revisão do que já vi (repetição espaçada).
3. **Consulta**: referência rápida (escalas, campos harmônicos, formas no braço).

Seletor de instrumento sempre visível no topo: **Ambos** (padrão), **Violão** ou **Baixo**.

### Tela da Trilha (computador)

- Topo: nome, as 3 abas, sequência de dias e XP, seletor de instrumento.
- Título e barra de progresso com os 45 elementos.
- À esquerda, a tabela inteira: 9 períodos em linhas, 5 elementos por linha e uma coluna à parte para o Experimento de cada período.
- À direita, o painel do elemento selecionado (descrição, domínio em cada instrumento, botão para começar ou revisar) e o resumo do Treino de hoje.

Protótipo: https://claude.ai/artifact/WcgN9WhkkouxeBeo7KuWNa

## Violão e baixo

Uma trilha só de teoria, não duas. A teoria é a mesma nos dois instrumentos; o que muda é a aplicação no braço.

A ponte física: **as 4 cordas do baixo têm a mesma afinação das 4 cordas mais graves do violão (Mi, Lá, Ré, Sol), uma oitava abaixo.** Notas, formas de escala e distâncias nessas cordas do violão valem igual no baixo.

```
                 TRONCO DE TEORIA (comum)
   notas · intervalos · escalas · acordes · harmonia · ritmo
                          │
         ┌────────────────┼────────────────┐
     RAMO VIOLÃO       PONTES          RAMO BAIXO
   formas de acorde   violão → baixo   linhas de baixo
   inversões          (elementos       notas-alvo
   tétrades no braço   de ligação)     condução, grooves
```

- **Tronco**: cada lição mostra o conceito nos dois braços, um embaixo do outro e alinhados pelas cordas em comum.
- **Pontes**: elementos próprios da tabela que fazem a passagem. Exemplos:
  - O baixo é a nota mais grave do acorde que eu faço no violão
  - Do acorde para o arpejo: tocar no baixo, nota por nota, o acorde que já faço
  - Cifra com barra (C/E): é a nota que o baixista toca
  - Ouvir um acorde e encontrar a tônica no baixo
- **Ramos**: o que só faz sentido num instrumento. Violão: formas, inversões, vozes. Baixo: construção de linhas, notas-alvo, aproximação cromática, grooves por estilo.
- **Domínio**: exercícios de braço valem para o instrumento escolhido; um elemento só fica "dominado" quando acerto nos dois.

## Trilha de conteúdo

| Período | Elementos | Para que serve |
|---|---|---|
| 1. Fundamentos | Notas, braço do violão, braço do baixo, tom e semitom, sustenido e bemol | Achar qualquer nota no braço sem contar |
| 2. Intervalos | 2ª a 8ª, maior, menor e justo, intervalo no braço, de ouvido | A base de tudo; no baixo, é o que se toca |
| 3. Escala maior | Fórmula T T S T T T S, graus, tonalidades, ciclo de quintas | Saber em que tom a música está |
| 4. Acordes | Tríades, tétrades (7M, 7, m7, m7(b5), °), leitura de cifra | Entender o que cada cifra significa |
| 5. Harmonia | Campo harmônico maior, funções (T, SD, D), cadências, II–V–I, dominantes secundários | Entender por que uma progressão "anda" e prever o próximo acorde |
| 6. Menor | Menor natural, harmônica e melódica, campo menor | Músicas em tom menor e acordes que vêm "de fora" |
| 7. Ritmo | Figuras, compassos (4/4, 2/4, 3/4, 6/8), síncope, subdivisão, contratempo | Ler e sentir o ritmo em qualquer estilo |
| 8. Baixo | Função do baixo, tônica e quinta, notas-alvo, aproximação cromática, condução entre acordes, linhas por estilo | Sair das tônicas |
| 9. Avançado | Pentatônicas, blues, modos, empréstimo modal, diminutos de passagem, tensões (9, 11, 13) | Depois, sem pressa |

Elementos de ponte e dos ramos entram ao longo dos períodos, assim que o tronco der base para eles.

## O repertório como degraus

| Degrau | Estilos e artistas | O que a teoria explica ali | Períodos |
|---|---|---|---|
| 1. Rock e pop | CPM 22, pop e rock estrangeiros | Power chords, tríades, progressões de 4 acordes | 1–4 |
| 2. Pop rock nacional | Skank, Paralamas, Lulu Santos, Nando Reis, Cássia Eller, Ana Carolina | Campo harmônico, acordes emprestados do menor, reggae e ska (contratempo) | 4–7 |
| 3. MPB contemporânea | 5 a Seco, Ana Carolina, Nando Reis | Tétrades, acordes com 9ª, baixo que caminha | 4–6, 8 |
| 4. MPB | Gilberto Gil, Djavan | Dominantes secundários, II–V, tensões, ritmos brasileiros, grooves de soul e funk | 5–9 |

Djavan fica no fim da tabela, como desafio final: a harmonia dele usa quase tudo da trilha ao mesmo tempo.

No baixo: Paralamas e Skank para linhas de reggae e ska (baixo quase melódico); rock para tempo e firmeza; Gil e Djavan para síncope, notas-alvo e cromatismo.

**Regra de conteúdo**: toda análise de música (acordes, graus, funções) é conferida antes de entrar no app. Nada de análise inventada.

## Exercícios

Poucos tipos, reaproveitados em toda a trilha:

- **Múltipla escolha**: conceitos, graus, funções
- **Toque no braço**: "ache a 5ª de Ré", no violão, no baixo ou nos dois
- **Monte o acorde ou a escala**: escolher as notas
- **Ouvido**: o app toca, eu identifico o intervalo ou o acorde
- **Ritmo**: ouvir e marcar onde cai a síncope ou o contratempo
- **Complete a progressão**: campo harmônico, cadências, II–V–I
- **Experimento** (fim de cada período): analisar a cifra de uma música real, marcando graus, funções e acordes emprestados. Posso adicionar minhas próprias músicas como novos Experimentos.

## Gamificação

- Elementos da tabela se acendem conforme avanço
- 3 marcas de domínio por elemento (vista, praticada, dominada), desenhadas como cotas no tile
- Sequência de dias e XP discretos no selo técnico
- Revisão espaçada: o que erro volta mais cedo no Treino
- Sem vidas e sem punição

## Tecnologia

- Aplicação web pensada para o computador (tela larga, mouse e teclado), funcionando também em telas menores
- Atalhos de teclado nos exercícios (por exemplo, 1 a 4 para responder, espaço para ouvir de novo)
- Conteúdo das lições em arquivos de texto (Markdown com dados dos exercícios), fáceis de editar e ampliar
- Diagramas de braço e pentagrama gerados em SVG
- Som sintetizado no navegador (Web Audio), sem arquivos de áudio
- Progresso salvo no aparelho, com exportar e importar
- Site estático no Netlify

## Fases

1. **MVP**
   - 3 abas, seletor Ambos / Violão / Baixo
   - Tabela periódica com os períodos 1 a 4 e as primeiras pontes
   - Exercícios: múltipla escolha, toque no braço, monte o acorde
   - Progresso salvo
2. **V2**
   - Exercícios de ouvido e ritmo
   - Períodos 5 a 7
   - Treino com revisão espaçada
   - Experimentos com músicas reais (degraus 1 e 2)
3. **V3**
   - Período 8 e ramo do baixo completo
   - Período 9
   - Experimentos dos degraus 3 e 4
   - Adicionar minhas próprias músicas

## Próximo passo

1. Validar o protótipo da tela da Trilha.
2. Protótipo da tela de lição com exercício de braço (violão e baixo alinhados).
3. Construir o MVP.
