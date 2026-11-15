// Trilha de violão e baixo (o conteúdo fica em ../content.js).

import { PERIODS, ELEMENTS, byId, NON_EXP, inPeriod, usesInstrument, KIND_LABEL, TAG } from '../content.js';
import { generate as gen } from '../exercises.js';

export { PERIODS, ELEMENTS, byId, NON_EXP, inPeriod, usesInstrument, KIND_LABEL, TAG };
export const LEGEND = [['V·B', 'ponte violão → baixo'], ['V', 'ramo violão'], ['B', 'ramo baixo'], ['EXP', 'experimento com música real']];
export const generate = (id, inst) => gen(id, inst);
