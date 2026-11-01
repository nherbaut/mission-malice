import test from 'node:test';
import assert from 'node:assert/strict';
import { MISSIONS, STORAGE_KEY, freshGame, startGame, nextPlayer, eliminate, missionFor, readGame, validateState } from '../game.js';
import { missionArt } from '../art.js';

export function roster(count = 6) {
  return { ...freshGame(), pin: '2468', players: Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `Joueur ${i + 1}`, kind: ['woman', 'man', 'girl', 'boy'][i % 4], hair: '#57392d', shirt: '#a7b5d9', skin: '#e7ac83', bald: false, alive: true })) };
}
const playing = state => { while (state.phase === 'distribution') state = nextPlayer(state); return state; };

test('les soixante missions sont distinctes et disposent de consignes et de repères visuels', () => {
  assert.equal(MISSIONS.length, 60);
  assert.equal(new Set(MISSIONS.map(m => m.id)).size, 60);
  assert.equal(new Set(MISSIONS.map(m => m.text)).size, 60);
  for (const m of MISSIONS) { assert.ok(m.text.includes('{name}')); assert.ok(m.emoji); assert.ok(m.color); }
});

test('les cinquante nouvelles missions ont une illustration complète avec l’avatar de la cible', () => {
  const target = roster().players[0];
  for (const mission of MISSIONS.slice(10)) {
    assert.ok(mission.visual.type);
    assert.ok(mission.visual.symbol);
    const art = missionArt(mission, target);
    assert.ok(art.includes(target.name));
    assert.ok(art.includes(mission.visual.symbol));
    assert.ok(art.includes(`pose-${mission.visual.pose}`));
    assert.ok(!art.includes('undefined'));
    assert.ok(!art.includes('null'));
  }
});

test('les dix missions historiques restent lisibles dans les sauvegardes existantes', () => {
  const ids = ['word', 'cat', 'sing', 'clap', 'arms', 'nose', 'jump', 'dance', 'spoon', 'water'];
  for (const missionId of ids) {
    const state = playing(startGame(roster(2)));
    state.assignments.p0.missionId = missionId;
    const restored = readGame({ getItem: () => JSON.stringify(state) });
    assert.equal(missionFor(restored, 'p0').mission.id, missionId);
  }
});

test('le lancement requiert au moins deux joueurs et un code', () => {
  assert.throws(() => startGame(roster(1)));
  assert.throws(() => startGame({ ...roster(), pin: '' }));
  assert.throws(() => startGame(startGame(roster())));
  assert.equal(startGame(roster(2)).phase, 'distribution');
});

test('chaque attribution forme une boucle unique sans auto-cible, même avec plus de soixante joueurs', () => {
  for (let count = 2; count <= 70; count++) {
    for (let sample = 0; sample < 10; sample++) {
      const state = startGame(roster(count));
      assert.ok(validateState(state));
      const targets = Object.values(state.assignments).map(a => a.targetId);
      assert.equal(new Set(targets).size, count);
      for (const [id, a] of Object.entries(state.assignments)) assert.notEqual(id, a.targetId);
      if (count <= MISSIONS.length) assert.equal(new Set(Object.values(state.assignments).map(a => a.missionId)).size, count);
    }
  }
});

test('la distribution conserve le même joueur jusqu’au tap suivant et se termine après le dernier', () => {
  let state = startGame(roster(3));
  assert.equal(state.distributionIndex, 0);
  const stored = JSON.parse(JSON.stringify(state));
  assert.deepEqual(state, stored);
  for (let i = 1; i <= 3; i++) {
    state = nextPlayer(state);
    assert.equal(state.distributionIndex, i);
    assert.equal(state.phase, i === 3 ? 'playing' : 'distribution');
    assert.ok(validateState(state));
  }
  assert.throws(() => nextPlayer(state));
});

test('une élimination transmet exactement la mission et la cible de la victime sans modifier la sauvegarde précédente', () => {
  const state = playing(startGame(roster()));
  const actor = state.players[0].id;
  const victim = state.assignments[actor].targetId;
  const inherited = { ...state.assignments[victim] };
  const original = JSON.stringify(state);
  const next = eliminate(state, actor);
  assert.equal(JSON.stringify(state), original);
  assert.equal(next.players.find(p => p.id === victim).alive, false);
  assert.deepEqual(next.assignments[actor], inherited);
  assert.equal(next.assignments[victim], undefined);
  assert.equal(next.events.length, 1);
  assert.ok(validateState(next));
  assert.throws(() => eliminate(next, victim));
});

test('des parties entières se terminent avec un seul gagnant et aucune mission résiduelle', () => {
  for (let count = 2; count <= 30; count++) {
    let state = playing(startGame(roster(count)));
    while (state.phase === 'playing') {
      const candidates = state.players.filter(p => p.alive);
      state = eliminate(state, candidates[Math.floor(Math.random() * candidates.length)].id);
      assert.ok(validateState(state));
    }
    assert.equal(state.players.filter(p => p.alive).length, 1);
    assert.equal(state.players.find(p => p.id === state.winnerId).alive, true);
    assert.deepEqual(state.assignments, {});
    assert.equal(state.events.length, count - 1);
    assert.throws(() => eliminate(state, state.winnerId));
  }
});

test('la mission nomme la bonne cible et peut être retrouvée après sauvegarde', () => {
  const state = playing(startGame(roster()));
  const storage = { getItem: key => key === STORAGE_KEY ? JSON.stringify(state) : null };
  const restored = readGame(storage);
  assert.deepEqual(restored, state);
  const info = missionFor(restored, restored.players[0].id);
  assert.ok(info.text.includes(info.target.name));
  assert.equal(missionFor(restored, 'inconnu'), null);
});

test('une sauvegarde manquante démarre la création et une sauvegarde abîmée est signalée', () => {
  assert.deepEqual(readGame({ getItem: () => null }), freshGame());
  for (const value of ['{', '{}', 'null', '"texte"', JSON.stringify({ ...roster(), players: [null] })]) assert.throws(() => readGame({ getItem: () => value }));
});

test('le validateur rejette les boucles cassées, les doublons et les attributs d’avatar invalides', () => {
  const state = playing(startGame(roster()));
  const broken = structuredClone(state);
  broken.assignments.p0.targetId = 'inconnu';
  assert.equal(validateState(broken), false);
  const duplicate = roster(); duplicate.players[1].id = duplicate.players[0].id;
  assert.equal(validateState(duplicate), false);
  const avatar = roster(); avatar.players[0].hair = 'red';
  assert.equal(validateState(avatar), false);
  const bottom = roster(); bottom.players[0].bottom = 'pink';
  assert.equal(validateState(bottom), false);
  const accessory = roster(); accessory.players[0].accessory = 'inconnu';
  assert.equal(validateState(accessory), false);
});

test('les détails de l’avatar restent valides pendant les missions et après une élimination', () => {
  let state = roster(3);
  state.players[0] = { ...state.players[0], bottom: '#e7a0af', accessory: 'hat' };
  state = playing(startGame(state));
  assert.ok(validateState(state));
  state = eliminate(state, 'p0');
  const restored = readGame({ getItem: () => JSON.stringify(state) });
  assert.equal(restored.players[0].bottom, '#e7a0af');
  assert.equal(restored.players[0].accessory, 'hat');
  const art = missionArt(MISSIONS[0], restored.players[0]);
  assert.ok(art.includes('fill="#e7a0af"'));
  assert.ok(art.includes('data-accessory="hat"'));
});
