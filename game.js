export const STORAGE_KEY = 'mission-malice.v1';

const additionalMission = (id, title, text, short, emoji, type, caption = '', pose = 'normal') => ({
  id, title, text, short, emoji,
  color: { word: '#f6c6d3', animal: '#f9d867', gesture: '#c6decb', move: '#bcd9ed', rhythm: '#ccc5ee', give: '#fac6a9', carry: '#bcd9ed' }[type],
  visual: { type, symbol: emoji, caption, pose }
});

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
  { id: 'water', title: 'Un petit service', text: 'Fais porter un gobelet d’eau jusqu’à la table à {name}.', short: 'Porter un gobelet d’eau', emoji: '🥤', color: '#bcd9ed' },

  // Des mots faciles à reconnaître et à prononcer.
  additionalMission('word-banana', 'Peau de banane', 'Fais dire « banane » à {name}.', 'Dire « banane »', '🍌', 'word', 'BANANE !'),
  additionalMission('word-chocolate', 'Le mot gourmand', 'Fais dire « chocolat » à {name}.', 'Dire « chocolat »', '🍫', 'word', 'CHOCOLAT !'),
  additionalMission('word-butterfly', 'Un mot qui vole', 'Fais dire « papillon » à {name}.', 'Dire « papillon »', '🦋', 'word', 'PAPILLON !'),
  additionalMission('word-rainbow', 'Toutes les couleurs', 'Fais dire « arc-en-ciel » à {name}.', 'Dire « arc-en-ciel »', '🌈', 'word', 'ARC-EN-CIEL !'),
  additionalMission('word-pirate', 'À l’abordage', 'Fais dire « pirate » à {name}.', 'Dire « pirate »', '🏴‍☠️', 'word', 'PIRATE !'),
  additionalMission('word-unicorn', 'Un mot magique', 'Fais dire « licorne » à {name}.', 'Dire « licorne »', '🦄', 'word', 'LICORNE !'),
  additionalMission('word-carrot', 'Le mot du lapin', 'Fais dire « carotte » à {name}.', 'Dire « carotte »', '🥕', 'word', 'CAROTTE !'),
  additionalMission('word-tractor', 'En route à la ferme', 'Fais dire « tracteur » à {name}.', 'Dire « tracteur »', '🚜', 'word', 'TRACTEUR !'),
  additionalMission('word-dinosaur', 'Un très grand mot', 'Fais dire « dinosaure » à {name}.', 'Dire « dinosaure »', '🦕', 'word', 'DINOSAURE !'),
  additionalMission('word-frog', 'Le mot de la mare', 'Fais dire « grenouille » à {name}.', 'Dire « grenouille »', '🐸', 'word', 'GRENOUILLE !'),

  // Des cris d’animaux, sans accessoire.
  additionalMission('animal-dog', 'Un petit ouaf', 'Fais imiter un chien à {name} : ouaf ouaf !', 'Imiter un chien', '🐶', 'animal', 'OUAF OUAF !'),
  additionalMission('animal-cow', 'Meuh alors !', 'Fais imiter une vache à {name} : meuh !', 'Imiter une vache', '🐮', 'animal', 'MEUH !'),
  additionalMission('animal-sheep', 'Un mouton dans la maison', 'Fais imiter un mouton à {name} : bêê !', 'Imiter un mouton', '🐑', 'animal', 'BÊÊ !'),
  additionalMission('animal-duck', 'Le petit canard', 'Fais imiter un canard à {name} : coin coin !', 'Imiter un canard', '🦆', 'animal', 'COIN COIN !'),
  additionalMission('animal-pig', 'Drôle de groin', 'Fais imiter un cochon à {name} : groin groin !', 'Imiter un cochon', '🐷', 'animal', 'GROIN GROIN !'),
  additionalMission('animal-lion', 'Le roi des animaux', 'Fais rugir {name} comme un lion : grrr !', 'Rugir comme un lion', '🦁', 'animal', 'GRRR !'),
  additionalMission('animal-horse', 'Au petit galop', 'Fais imiter le cri d’un cheval à {name} : hiiii !', 'Imiter le cri d’un cheval', '🐴', 'animal', 'HIIII !'),
  additionalMission('animal-chick', 'Un tout petit piou', 'Fais imiter un poussin à {name} : piou piou !', 'Imiter un poussin', '🐤', 'animal', 'PIOU PIOU !'),

  // Des gestes représentés par la pose de l’avatar.
  additionalMission('gesture-head', 'Sur la tête', 'Demande à {name} de poser les mains sur sa tête.', 'Mettre les mains sur sa tête', '🧑', 'gesture', '', 'head'),
  additionalMission('gesture-ears', 'Grandes oreilles', 'Demande à {name} de toucher ses deux oreilles.', 'Toucher ses oreilles', '👂', 'gesture', '', 'ears'),
  additionalMission('gesture-cheeks', 'Jolies joues', 'Demande à {name} de poser les mains sur ses joues.', 'Mettre les mains sur ses joues', '😊', 'gesture', '', 'cheeks'),
  additionalMission('gesture-hips', 'La petite pose', 'Demande à {name} de mettre les mains sur ses hanches.', 'Mettre les mains sur ses hanches', '🧍', 'gesture', '', 'hips'),
  additionalMission('gesture-wave', 'Un petit coucou', 'Fais faire un signe de la main à {name} pour dire coucou.', 'Faire coucou de la main', '👋', 'gesture', 'COUCOU !', 'wave'),
  additionalMission('gesture-thumb', 'Super, super !', 'Demande à {name} de lever un pouce pour dire super.', 'Lever un pouce', '👍', 'gesture', '', 'thumb'),
  additionalMission('gesture-peekaboo', 'Caché, coucou !', 'Demande à {name} de cacher ses yeux avec ses mains, puis de les découvrir.', 'Faire un coucou caché', '🙈', 'gesture', '🙈 → 😊', 'peekaboo'),
  additionalMission('gesture-kiss', 'Un bisou qui vole', 'Demande à {name} d’envoyer un bisou avec sa main.', 'Envoyer un bisou de la main', '😘', 'gesture', '😘 → ♡', 'kiss'),

  // Des imitations et déplacements tout doux.
  additionalMission('move-robot', 'Bip boup !', 'Fais bouger {name} comme un robot.', 'Bouger comme un robot', '🤖', 'move', 'BIP BOUP !', 'robot'),
  additionalMission('move-penguin', 'Le petit pingouin', 'Fais marcher {name} comme un pingouin, avec de tout petits pas.', 'Marcher comme un pingouin', '🐧', 'move', '👣', 'penguin'),
  additionalMission('move-elephant', 'Une grande trompe', 'Fais imiter un éléphant à {name}, avec un bras pour faire la trompe.', 'Faire une trompe avec son bras', '🐘', 'move', '', 'elephant'),
  additionalMission('move-bird', 'Prêt à s’envoler', 'Fais battre les bras à {name} comme les ailes d’un oiseau.', 'Battre des bras comme un oiseau', '🐦', 'move', '↕', 'wings'),
  additionalMission('move-tiptoe', 'À pas de souris', 'Demande à {name} de faire quelques pas sur la pointe des pieds.', 'Marcher sur la pointe des pieds', '🩰', 'move', '👣 ↑', 'tiptoe'),
  additionalMission('move-march', 'En avant la troupe', 'Fais marcher {name} sur place comme dans un défilé.', 'Marcher sur place', '🥁', 'move', '👣', 'march'),
  additionalMission('move-turn', 'Un petit tour', 'Demande à {name} de faire un tour doucement sur place.', 'Faire un tour sur place', '🔄', 'move', '↻', 'turn'),

  // Des chansons et des rythmes simples.
  additionalMission('rhythm-frere-jacques', 'Sonnez les matines', 'Fais chanter un petit bout de Frère Jacques à {name}.', 'Chanter Frère Jacques', '🔔', 'rhythm', 'FRÈRE JACQUES'),
  additionalMission('rhythm-birthday', 'Comme à un anniversaire', 'Fais chanter Joyeux anniversaire à {name}.', 'Chanter Joyeux anniversaire', '🎂', 'rhythm', 'JOYEUX ANNIVERSAIRE'),
  additionalMission('rhythm-lala', 'Trois petites notes', 'Fais chanter « la la la » à {name}.', 'Chanter « la la la »', '🎶', 'rhythm', 'LA LA LA !'),
  additionalMission('rhythm-clap-twice', 'Deux petits bravos', 'Demande à {name} de taper deux fois dans ses mains.', 'Applaudir deux fois', '👏', 'rhythm', '👏 👏', 'clap'),
  additionalMission('rhythm-knees', 'Le tambour des genoux', 'Demande à {name} de tapoter ses genoux avec ses mains comme un tambour.', 'Tapoter ses genoux', '🥁', 'rhythm', '♪ ♫', 'knees'),

  // Des objets courants à donner ou à déplacer.
  additionalMission('give-teddy', 'Prête-moi ton doudou', 'Demande à {name} de te donner une peluche.', 'Donner une peluche', '🧸', 'give'),
  additionalMission('give-ball', 'À toi le ballon', 'Demande à {name} de te donner un ballon.', 'Donner un ballon', '⚽', 'give'),
  additionalMission('give-book', 'Une petite histoire', 'Demande à {name} de te donner un livre.', 'Donner un livre', '📕', 'give'),
  additionalMission('give-pencil', 'De quoi dessiner', 'Demande à {name} de te donner un crayon.', 'Donner un crayon', '✏️', 'give'),
  additionalMission('give-paper', 'Une page pour toi', 'Demande à {name} de te donner une feuille de papier.', 'Donner une feuille de papier', '📄', 'give'),
  additionalMission('give-sock', 'La chaussette voyageuse', 'Demande à {name} de te donner une chaussette.', 'Donner une chaussette', '🧦', 'give'),
  additionalMission('give-cap', 'Chapeau, le malin !', 'Demande à {name} de te donner une casquette.', 'Donner une casquette', '🧢', 'give'),
  additionalMission('give-shoe', 'La chaussure baladeuse', 'Demande à {name} de te donner une chaussure.', 'Donner une chaussure', '👟', 'give'),
  additionalMission('carry-book', 'Le livre à table', 'Demande à {name} de poser un livre sur la table.', 'Poser un livre sur la table', '📕', 'carry', 'table'),
  additionalMission('carry-teddy', 'Doudou se repose', 'Demande à {name} de poser une peluche sur une chaise.', 'Poser une peluche sur une chaise', '🧸', 'carry', 'chair'),
  additionalMission('carry-sock', 'La chaussette sur sa chaise', 'Demande à {name} de poser une chaussette sur une chaise.', 'Poser une chaussette sur une chaise', '🧦', 'carry', 'chair'),
  additionalMission('carry-spoon', 'On met le couvert', 'Demande à {name} de poser une cuillère sur la table.', 'Poser une cuillère sur la table', '🥄', 'carry', 'table')
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
