import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { STORAGE_KEY, freshGame, startGame, nextPlayer, missionFor } from '../game.js';

const html = (await readFile(new URL('../index.html', import.meta.url), 'utf8')).replace(/<script[^>]*>[\s\S]*?<\/script>/g, '').replace(/<link[^>]*>/g, '');
let sequence = 0;
async function mount(initial = null) {
  const window = new Window({ url: 'http://localhost:4173/family-killer/', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  window.document.write(html);
  for (const [key, value] of Object.entries({ window, document: window.document, localStorage: window.localStorage, FormData: window.FormData })) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const spoken = [];
  window.speechSynthesis = { cancel() {}, getVoices: () => [], speak: u => spoken.push(u.text) };
  globalThis.speechSynthesis = window.speechSynthesis;
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  if (initial !== null) window.localStorage.setItem(STORAGE_KEY, typeof initial === 'string' ? initial : JSON.stringify(initial));
  await import(`../app.js?test=${sequence++}`);
  const $ = selector => window.document.querySelector(selector);
  const click = selector => { assert.ok($(selector), `Élément absent : ${selector}`); $(selector).click(); };
  const input = (selector, value) => { assert.ok($(selector), selector); $(selector).value = value; $(selector).dispatchEvent(new window.Event('input', { bubbles: true })); };
  const submit = selector => $(selector).dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  const saved = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY));
  return { window, $, click, input, submit, saved, spoken };
}
function fixture() {
  return { ...freshGame(), pin: '2468', players: ['Mamie', 'Lou', 'Papa'].map((name, i) => ({ id: `p${i}`, name, kind: ['woman', 'girl', 'man'][i], hair: '#57392d', shirt: '#a7b5d9', skin: '#e7ac83', bald: false, alive: true })) };
}
function playingFixture() { let game = startGame(fixture()); while (game.phase === 'distribution') game = nextPlayer(game); return game; }

test('l’éditeur crée, modifie et retire des avatars ; un prénom HTML reste du texte', async () => {
  const ui = await mount();
  assert.match(ui.$('h1').textContent, /malins/);
  ui.click('[data-action="add-player"]');
  ui.input('#player-name', '<b>Lou</b>');
  ui.submit('#avatar-form');
  assert.equal(ui.$('.player-name').textContent, '<b>Lou</b>');
  assert.equal(ui.$('.player-name b'), null);
  assert.equal(ui.saved().players[0].name, '<b>Lou</b>');
  ui.click('[data-action="edit-player"]');
  ui.input('#player-name', 'Lou');
  ui.click('input[name="shirt"][value="#a1bd91"]');
  ui.click('input[name="bald"]');
  ui.submit('#avatar-form');
  assert.equal(ui.saved().players[0].shirt, '#a1bd91');
  assert.equal(ui.saved().players[0].bald, true);
  ui.click('[data-action="edit-player"]');
  ui.click('[data-action="delete-player"]');
  assert.equal(ui.saved().players.length, 0);
});

test('le lancement crée le code puis distribue les missions par deux taps ; l’audio ne fait pas avancer', async () => {
  const ui = await mount({ ...fixture(), pin: '' });
  ui.click('[data-action="launch"]');
  ui.input('#pin', '2468'); ui.input('#pin-confirm', '0000'); ui.submit('#pin-form');
  assert.match(ui.$('#pin-error').textContent, /différents/);
  ui.input('#pin-confirm', '2468'); ui.submit('#pin-form');
  ui.click('[data-action="confirm-launch"]');
  for (let i = 0; i < 3; i++) {
    assert.equal(ui.$('.cover-surface h1').textContent, ['Mamie', 'Lou', 'Papa'][i]);
    assert.equal(ui.$('.mission-instruction'), null);
    ui.click('[data-action="reveal"]');
    assert.ok(ui.$('.mission-instruction'));
    ui.click('[data-action="speak"]');
    assert.equal(ui.saved().distributionIndex, i);
    assert.ok(ui.$('.mission-instruction'));
    ui.click('.mission-instruction');
  }
  assert.equal(ui.saved().phase, 'playing');
  assert.equal(ui.spoken.length, 3);
  assert.equal(ui.window.document.querySelectorAll('.player-card').length, 3);
});

test('une mission révélée reprend masquée après rechargement', async () => {
  const first = await mount(startGame(fixture()));
  first.click('[data-action="reveal"]');
  assert.ok(first.$('.mission-instruction'));
  const resumed = await mount(first.saved());
  assert.equal(resumed.$('.mission-instruction'), null);
  assert.equal(resumed.$('.cover-surface h1').textContent, 'Mamie');
});

test('chaque joueur peut revoir et réécouter sa mission sans code, sans la modifier, même après réouverture', async () => {
  const initial = playingFixture();
  const ui = await mount(initial);
  assert.equal(ui.$('#missions-trigger').hidden, false);
  for (const id of ['p0', 'p1', 'p0']) {
    ui.click('#missions-trigger');
    assert.equal(ui.$('#modal').open, false);
    assert.equal(ui.$('.mission-instruction'), null);
    ui.click(`[data-action="open-player"][data-id="${id}"]`);
    assert.equal(ui.$('.mission-instruction'), null);
    ui.click('[data-action="reveal"]');
    const info = missionFor(initial, id);
    assert.equal(ui.$('.mission-instruction').textContent, info.text);
    assert.equal(ui.$('.target-chip strong').textContent, info.target.name);
    ui.click('[data-action="speak"]');
    assert.ok(ui.spoken.at(-1).includes(info.text));
    ui.click('.mission-instruction');
    assert.equal(ui.$('.mission-instruction'), null);
    assert.equal(ui.window.document.querySelectorAll('.player-card').length, 3);
    assert.deepEqual(ui.saved(), initial);
  }
  const resumed = await mount(ui.saved());
  resumed.click('#missions-trigger');
  resumed.click('[data-action="open-player"][data-id="p0"]');
  resumed.click('[data-action="reveal"]');
  assert.equal(resumed.$('.mission-instruction').textContent, missionFor(initial, 'p0').text);
  resumed.click('#missions-trigger');
  assert.equal(resumed.$('.mission-instruction'), null);
});

test('une élimination transmet la mission, la suivante termine la partie et le gagnant persiste', async () => {
  const initial = playingFixture();
  const ui = await mount(initial);
  const inherited = initial.assignments[initial.assignments.p0.targetId];
  ui.click('[data-action="open-player"][data-id="p0"]');
  ui.click('[data-action="reveal"]');
  ui.click('[data-action="claim"]');
  ui.click('[data-action="confirm-claim"]');
  assert.deepEqual(ui.saved().assignments.p0, inherited);
  assert.equal(ui.$('.cover-surface h1').textContent, 'Mamie');
  ui.click('[data-action="reveal"]');
  assert.equal(ui.$('.mission-instruction').textContent, missionFor(ui.saved(), 'p0').text);
  ui.click('[data-action="claim"]');
  ui.click('[data-action="confirm-claim"]');
  assert.equal(ui.saved().phase, 'finished');
  assert.match(ui.$('.winner-section h1').textContent, /Mamie/);
  const resumed = await mount(ui.saved());
  assert.ok(resumed.$('.winner-section'));
});

test('le code protège les missions et le reset, le redémarrage conserve les avatars, le reset préserve les autres clés', async () => {
  const ui = await mount(playingFixture());
  ui.click('#admin-trigger');
  ui.input('#pin', '0000'); ui.submit('#pin-form');
  assert.match(ui.$('#pin-error').textContent, /pas le bon code/);
  assert.equal(ui.$('.admin-mission'), null);
  ui.input('#pin', '2468'); ui.submit('#pin-form');
  assert.equal(ui.window.document.querySelectorAll('.admin-mission').length, 3);
  ui.click('[data-action="restart"]'); ui.click('[data-action="confirm-restart"]');
  assert.equal(ui.saved().phase, 'setup');
  assert.equal(ui.saved().players.length, 3);
  assert.equal(ui.saved().pin, '2468');
  ui.click('#admin-trigger'); ui.input('#pin', '2468'); ui.submit('#pin-form');
  ui.click('[data-action="reset"]'); ui.click('[data-action="close-modal"]');
  assert.equal(ui.saved().players.length, 3);
  ui.window.localStorage.setItem('autre-application', 'à conserver');
  ui.click('[data-action="reset"]'); ui.click('[data-action="confirm-reset"]');
  assert.equal(ui.saved(), null);
  assert.equal(ui.window.localStorage.getItem('autre-application'), 'à conserver');
  assert.equal(ui.window.document.querySelectorAll('.player-card').length, 0);
});

test('une sauvegarde abîmée n’est pas écrasée et peut être réinitialisée avec le code enregistré', async () => {
  const broken = JSON.stringify({ version: 1, pin: '2468', players: 'cassés' });
  const ui = await mount(broken);
  assert.match(ui.$('h1').textContent, /petite pause/);
  assert.equal(ui.window.localStorage.getItem(STORAGE_KEY), broken);
  ui.click('[data-action="recover-reset"]'); ui.input('#pin', '2468'); ui.submit('#pin-form');
  ui.click('[data-action="confirm-reset"]');
  assert.equal(ui.saved(), null);
  assert.match(ui.$('h1').textContent, /malins/);
});

test('si la sauvegarde échoue, le jeu n’avance pas', async () => {
  const ui = await mount(startGame(fixture()));
  const original = ui.saved();
  ui.click('[data-action="reveal"]');
  globalThis.localStorage = { getItem: key => ui.window.localStorage.getItem(key), setItem: () => { throw new Error('Quota dépassé'); } };
  ui.click('.mission-instruction');
  assert.equal(ui.$('.pass-top .eyebrow').textContent, 'MAMIE · MISSION SECRÈTE');
  assert.match(ui.$('#toast').textContent, /Sauvegarde impossible/);
  assert.deepEqual(ui.saved(), original);
});
