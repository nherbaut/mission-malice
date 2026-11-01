export const STORAGE_KEY = 'mission-malice.v1';

export const MISSIONS = [
  { id: 'word', title: 'Le mot magique', text: 'Fais dire « sucette » à {name}.', short: 'Dire « sucette »', emoji: '🍭', color: '#f6c6d3' },
  { id: 'cat', title: 'Un petit miaou', text: 'Fais imiter un chat à {name} : miaou !', short: 'Imiter un chat', emoji: '🐱', color: '#f9d867' },
  { id: 'sing', title: 'La star du jour', text: 'Fais chanter une chanson à {name}.', short: 'Chanter une chanson', emoji: '🎤', color: '#ccc5ee' },
  { id: 'clap', title: 'Bravo, bravo !', text: 'Fais taper dans ses mains à {name}.', short: 'Applaudir', emoji: '👏', color: '#c6decb' },
  { id: 'arms', title: 'Tout là-haut', text: 'Fais lever les deux bras en l’air à {name}.', short: 'Lever les deux bras', emoji: '🙌', color: '#bcd9ed' },
  { id: 'nose', title: 'Bout du nez', text: 'Fais toucher son nez à {name}.', short: 'Toucher son nez', emoji: '👃', color: '#fac6a9' },
  { id: 'jump', title: 'Petit kangourou', text: 'Fais faire un petit saut sur place à {name}.', short: 'Faire un petit saut', emoji: '🦘', color: '#f9d867' },
  { id: 'dance', title: 'Ça se déhanche', text: 'Fais danser {name}.', short: 'Danser', emoji: '💃', color: '#f6c6d3' },
  { id: 'spoon', title: 'À la cuillère', text: 'Demande à {name} de te donner une cuillère.', short: 'Donner une cuillère', emoji: '🥄', color: '#ccc5ee' },
  { id: 'water', title: 'Un petit service', text: 'Fais porter un gobelet d’eau jusqu’à la table à {name}.', short: 'Porter un gobelet d’eau', emoji: '🥤', color: '#bcd9ed' }
];

export const freshGame = () => ({ version: 1, phase: 'setup', pin: '', players: [], assignments: {}, distributionIndex: 0, events: [], winnerId: null });

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function startGame(state, random = Math.random) {
  if (state.phase !== 'setup' || state.players.length < 2 || !/^\d{4,8}$/.test(state.pin)) throw new Error('Ajoute au moins deux joueurs et un code de 4 à 8 chiffres.');
  const ring = shuffle(state.players, random);
  let deck = [];
  const assignments = {};
  ring.forEach((player, index) => {
    if (!deck.length) deck = shuffle(MISSIONS, random);
    assignments[player.id] = { targetId: ring[(index + 1) % ring.length].id, missionId: deck.pop().id };
  });
  return { ...state, phase: 'distribution', players: state.players.map(p => ({ ...p, alive: true })), assignments, distributionIndex: 0, events: [], winnerId: null };
}

export function nextPlayer(state) {
  if (state.phase !== 'distribution') throw new Error('La distribution est terminée.');
  const distributionIndex = state.distributionIndex + 1;
  return { ...state, distributionIndex, phase: distributionIndex >= state.players.length ? 'playing' : 'distribution' };
}

export function eliminate(state, actorId) {
  if (state.phase !== 'playing') throw new Error('Le jeu doit être en cours.');
  const actor = state.players.find(p => p.id === actorId && p.alive);
  const assignment = state.assignments[actorId];
  const target = state.players.find(p => p.id === assignment?.targetId && p.alive);
  if (!actor || !target || actor.id === target.id) throw new Error('Cette mission n’est plus active.');
  const players = state.players.map(p => p.id === target.id ? { ...p, alive: false } : p);
  const assignments = { ...state.assignments, [actorId]: { ...state.assignments[target.id] } };
  delete assignments[target.id];
  const finished = players.filter(p => p.alive).length === 1;
  if (finished) delete assignments[actorId];
  return { ...state, players, assignments, phase: finished ? 'finished' : 'playing', winnerId: finished ? actorId : null, events: [...state.events, { actorId, targetId: target.id, assignment: { ...state.assignments[target.id] }, at: Date.now() }] };
}

export function missionFor(state, playerId, includeEliminated = false) {
  const assignment = state.assignments[playerId] || (includeEliminated ? state.events.find(event => event.targetId === playerId)?.assignment : null);
  if (!assignment) return null;
  const target = state.players.find(p => p.id === assignment.targetId);
  const mission = MISSIONS.find(m => m.id === assignment.missionId);
  return { target, mission, text: mission.text.replace('{name}', target.name) };
}

export function validateState(value) {
  if (!value || value.version !== 1 || !['setup', 'distribution', 'playing', 'finished'].includes(value.phase) || !Array.isArray(value.players) || !Array.isArray(value.events) || typeof value.pin !== 'string' || !value.assignments || !Number.isInteger(value.distributionIndex)) return false;
  const ids = new Set();
  for (const p of value.players) {
    if (!p || typeof p.id !== 'string' || ids.has(p.id) || typeof p.name !== 'string' || !p.name.trim() || p.name.length > 24 || !['woman', 'man', 'girl', 'boy'].includes(p.kind) || !/^#[a-f\d]{6}$/i.test(p.hair) || !/^#[a-f\d]{6}$/i.test(p.shirt) || !/^#[a-f\d]{6}$/i.test(p.skin) || typeof p.bald !== 'boolean' || typeof p.alive !== 'boolean') return false;
    ids.add(p.id);
  }
  for (const event of value.events) {
    if (!event || !ids.has(event.actorId) || !ids.has(event.targetId) || !Number.isFinite(event.at) || !event.assignment || !ids.has(event.assignment.targetId) || !MISSIONS.some(m => m.id === event.assignment.missionId)) return false;
  }
  if (value.phase === 'setup') return value.pin === '' || /^\d{4,8}$/.test(value.pin);
  if (value.players.length < 2 || !/^\d{4,8}$/.test(value.pin)) return false;
  const alive = value.players.filter(p => p.alive);
  if (value.phase === 'finished') return alive.length === 1 && alive[0].id === value.winnerId && Object.keys(value.assignments).length === 0;
  if (alive.length < 2 || (value.phase === 'distribution' && (value.distributionIndex < 0 || value.distributionIndex >= value.players.length))) return false;
  if (Object.keys(value.assignments).length !== alive.length) return false;
  const seen = new Set();
  let cursor = alive[0].id;
  for (let i = 0; i < alive.length; i++) {
    if (seen.has(cursor)) return false;
    seen.add(cursor);
    const a = value.assignments[cursor];
    if (!a || !alive.some(p => p.id === a.targetId) || !MISSIONS.some(m => m.id === a.missionId)) return false;
    cursor = a.targetId;
  }
  return cursor === alive[0].id;
}

export function readGame(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return freshGame();
  const value = JSON.parse(raw);
  if (!validateState(value)) throw new Error('La sauvegarde est illisible.');
  return value;
}
