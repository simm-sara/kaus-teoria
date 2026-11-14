# Kaus Teoria

Aplicação web para estudar teoria musical aplicada ao violão e ao baixo, em forma de trilha. Identidade visual da Kaus Lab.

O plano completo está em [PLANO.md](PLANO.md).

## O que tem

- **Trilha**: tabela periódica com 45 elementos em 9 períodos (Fundamentos, Intervalos, Escala maior, Acordes, Harmonia, Menor, Ritmo, Baixo, Avançado), mais 9 Experimentos com músicas reais.
- **Lições** curtas com braço do violão e do baixo alinhados, tabelas e exemplos sonoros.
- **Exercícios gerados automaticamente** a partir de um motor de teoria: as respostas são calculadas, então não existe gabarito errado nem pergunta repetida. Tipos: múltipla escolha, tocar no braço, marcar notas numa região, ouvido (intervalos e acordes) e ritmo.
- **Violão e baixo**: seletor Ambos / Violão / Baixo no topo. Elementos de ponte (V·B) ligam os dois instrumentos; ramos (V, B) são específicos de cada um. O domínio é registrado por instrumento.
- **Treino**: revisão espaçada (1, 3, 7, 14, 30 e 60 dias) do que você já praticou.
- **Consulta**: notas no braço, escalas, acordes, campo harmônico, ciclo de quintas e analisador de cifra.
- **Experimentos**: passos, analisador de cifra (tom, graus, funções, dominantes secundários e empréstimos) e anotações.
- **Progresso** salvo no navegador, com exportar e importar em Ajustes. Opção de trilha livre.
- **Atalhos**: 1 a 4 respondem, Enter confirma ou avança, Espaço toca de novo, T/R/C trocam de aba.

## Como progredir

- Abrir a lição: **vista**.
- Sessão com 70% ou mais: **praticada** (libera o próximo elemento).
- Nova sessão com 90% ou mais: **dominada**.
- "Já sei: teste rápido": 10 perguntas; com 90% o elemento fica dominado direto.
- Experimentos liberam quando os 5 elementos do período estão praticados.

## Rodar no computador

Não precisa instalar nada além de um servidor de arquivos estáticos (os módulos JavaScript não abrem direto do disco).

```bash
python3 -m http.server 5173
```

Depois abra http://localhost:5173. Ou, com Node instalado:

```bash
npx serve -l 5173 .
```

## Publicar

É um site estático, sem etapa de build. Funciona em GitHub Pages (Settings → Pages → publicar a partir da branch `main`, pasta raiz) ou no Netlify (conectar o repositório, sem comando de build).

## Testes

```bash
npm test
```

Testam o motor de teoria (escalas, intervalos, campos harmônicos, cifras, braço, análise) e geram centenas de perguntas de cada tipo para conferir que toda resposta está entre as opções e toda posição do braço é válida.

## Estrutura

```
index.html
css/app.css            identidade visual (tokens da Kaus Lab)
js/theory.js           motor de teoria musical
js/exercises.js        geradores de exercícios
js/content.js          períodos, elementos, lições e experimentos
js/progress.js         níveis, desbloqueio e próximo elemento
js/store.js            progresso no navegador, revisão espaçada
js/audio.js            som sintetizado (Web Audio)
js/ui/                 braço em SVG, blocos de lição, ritmo
js/views/              telas: trilha, lição, prática, experimento, consulta, ajustes
tests/                 testes (node --test)
```

Para acrescentar conteúdo, edite `js/content.js`: cada elemento tem a lição (lista de blocos) e os geradores de exercício que usa.
