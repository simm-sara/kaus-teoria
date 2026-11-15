// Trilhas disponíveis e a trilha ativa (a do perfil escolhido).

import * as cordas from './tracks/cordas.js';
import * as gaita from './tracks/gaita.js';

export const TRACKS = {
  cordas: { id: 'cordas', name: 'Violão e baixo', symbol: 'Vb', instruments: true, ...cordas },
  gaita: { id: 'gaita', name: 'Gaita', symbol: 'Gt', instruments: false, ...gaita },
};

let active = TRACKS.cordas;
export const track = () => active;
export function setTrack(id) {
  active = TRACKS[id] || TRACKS.cordas;
}
