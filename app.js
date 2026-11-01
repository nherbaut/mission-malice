import { STORAGE_KEY, MISSIONS, freshGame, readGame, startGame, nextPlayer, eliminate, missionFor } from './game.js';
import { avatar, missionArt, heroArt, escapeHTML as esc } from './art.js';

const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
let state, loadError = false, view = 'home', selectedId = null, revealed = false, adminUnlocked = false, toastTimer;
try { state = readGame(localStorage); } catch { state = freshGame(); loadError = true; }

const colors = { hair: ['#57392d', '#1f2527', '#c68c40', '#b85d36', '#b5b4ad', '#f0e9da'], shirt: ['#e58b54', '#a7b5d9', '#a1bd91', '#e7a0af', '#edc74f', '#62a9ae', '#c2a2cc', '#e9dfca'], skin: ['#f2c9a1', '#e7ac83', '#b97e54', '#79513d'] };
const colorNames = { hair: ['Brun', 'Noir', 'Blond', 'Roux', 'Gris', 'Blanc'], shirt: ['Orange', 'Bleu', 'Vert', 'Rose', 'Jaune', 'Turquoise', 'Violet', 'Crème'], skin: ['Claire', 'Dorée', 'Brune', 'Foncée'] };
const getPlayer = id => state.players.find(p => p.id === id);
const livePlayers = () => state.players.filter(p => p.alive);
const stopAudio = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };

function toast(message) {
  const box = document.querySelector('#toast');
  box.textContent = message; box.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => box.classList.remove('visible'), 4500);
}

function commit(next) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  catch { toast('Sauvegarde impossible. Autorise le stockage du navigateur pour continuer.'); return false; }
  state = next; return true;
}

function openModal(html) {
  stopAudio(); modal.innerHTML = `<button type="button" class="modal-close" data-action="close-modal" aria-label="Fermer">×</button>${html}`;
  if (!modal.open) modal.showModal();
}

function playerCard(player, action = 'open-player', editable = false) {
  return `<button class="player-card ${!player.alive && state.phase !== 'setup' ? 'is-out' : ''}" data-action="${action}" data-id="${esc(player.id)}"><span class="player-art" style="--card-color:${esc(player.shirt)}">${avatar(player)}</span><span class="player-name">${esc(player.name)}</span><span class="player-caption">${editable ? 'Modifier mon avatar <span aria-hidden="true">↗</span>' : player.alive ? 'Voir ma mission <span aria-hidden="true">→</span>' : 'Bien joué !'}</span></button>`;
}

function render() {
  stopAudio();
  if (loadError) {
    app.innerHTML = `<section class="center-panel"><span class="eyebrow">La sauvegarde a un souci</span><h1>Une petite pause.</h1><p>Impossible de lire la partie enregistrée. Elle reste conservée dans ce navigateur.</p><button class="button" data-action="export-save">Récupérer la sauvegarde</button><p>Si le stockage est bloqué, autorise-le puis recharge la page. Pour effacer une sauvegarde abîmée, utilise ton code administrateur.</p><button class="button secondary" data-action="recover-reset">Réinitialiser avec le code</button></section>`;
    return;
  }
  if (view === 'admin') return renderAdmin();
  if (state.phase === 'setup') return renderSetup();
  if (state.phase === 'finished') return renderWinner();
  if (state.phase === 'distribution') {
    selectedId = state.players[state.distributionIndex].id;
    return renderPass();
  }
  if (view === 'pass') return renderPass();
  renderPlaying();
}

function renderSetup() {
  app.innerHTML = `<section class="hero"><div class="hero-copy"><span class="eyebrow"><span class="tiny-star">✦</span> LE JEU DES PETITS & GRANDS MALINS</span><h1>En famille,<br>jouez les <span class="word-mark">malins<svg viewBox="0 0 320 18" aria-hidden="true"><path d="M4 12 Q160 -4 313 10"/></svg></span>.</h1><p>Une mission secrète. Une personne à piéger.<br>Et beaucoup de petits sourires en coin.</p><div class="hero-tags"><span>◷ Dès 4 ans</span><span>♧ Un seul téléphone</span><span>✧ Zéro lecture obligatoire</span></div></div>${heroArt()}</section>
  <section class="crew-section" aria-labelledby="crew-title"><div class="section-heading"><div><span class="eyebrow">01 / LA BANDE</span><h2 id="crew-title">Qui joue aujourd’hui ?</h2><p>Créez un avatar pour chacun. Les grands jouent aussi !</p></div><span class="count-badge">${state.players.length} ${state.players.length === 1 ? 'joueur' : 'joueurs'}</span></div><div class="player-grid">${state.players.map(p => playerCard(p, 'edit-player', true)).join('')}<button class="add-player" data-action="add-player"><span class="add-symbol">+</span><strong>Ajouter un joueur</strong><span>Un prénom, un petit personnage</span></button></div></section>
  <section class="launch-panel"><div><span class="eyebrow">02 / C’EST PARTI</span><h2>Tout le monde est là ?</h2><p>${state.players.length < 2 ? 'Il faut au moins 2 joueurs pour partager un secret.' : 'On distribue les missions, puis on se passe le téléphone.'}</p></div><button class="button" data-action="launch" ${state.players.length < 2 ? 'disabled' : ''}>Distribuer les missions <span aria-hidden="true">↗</span></button></section>
  <section class="how-section"><div class="section-heading"><div><span class="eyebrow">LE PETIT MODE D’EMPLOI</span><h2>Un jeu d’enfant. Vraiment.</h2></div><button class="text-button" data-action="mission-list">Les 10 missions ↗</button></div><div class="how-grid"><article><span class="step-icon lilac">🤫</span><h3>1. Garde ton secret</h3><p>Découvre qui tu dois piéger et la petite action à lui faire faire.</p></article><article><span class="step-icon peach">👏</span><h3>2. Joue les malins</h3><p>Ta cible réalise l’action ? Attrapée ! Tu récupères sa mission.</p></article><article><span class="step-icon green">🏆</span><h3>3. Reste dans la partie</h3><p>Le dernier joueur encore en jeu remporte la partie !</p></article></div><p class="local-note"><span aria-hidden="true">⌂</span> Tout reste sur ce téléphone, dans ce navigateur. Pas de compte à créer.</p></section>`;
}

function renderPass() {
  const player = getPlayer(selectedId);
  if (!player?.alive) { view = 'home'; revealed = false; return render(); }
  const distribution = state.phase === 'distribution';
  if (!revealed) {
    app.innerHTML = `<section class="pass-section"><div class="pass-top"><span class="eyebrow">${distribution ? `DISTRIBUTION · ${state.distributionIndex + 1} / ${state.players.length}` : 'TON PETIT SECRET'}</span>${!distribution ? '<button class="text-button" data-action="home">← Les joueurs</button>' : ''}</div><button class="reveal-surface cover-surface" data-action="reveal"><span class="pass-instruction">${distribution ? 'Passe le téléphone à' : 'C’est bien toi ?'}</span><span class="cover-avatar" style="--card-color:${esc(player.shirt)}">${avatar(player)}</span><h1>${esc(player.name)}</h1><span class="tap-cue"><span aria-hidden="true">☝</span> Tapote pour découvrir ta mission</span><span class="secret-note">Les autres ferment les yeux !</span></button></section>`;
  } else {
    const info = missionFor(state, selectedId);
    app.innerHTML = `<section class="pass-section"><div class="pass-top"><span class="eyebrow">${esc(player.name).toUpperCase()} · MISSION SECRÈTE</span><button class="text-button" data-action="hide">🙈 Masquer</button></div><div class="reveal-surface mission-surface" data-action="advance" role="button" tabindex="0" aria-label="Masquer la mission${distribution ? ' et passer au joueur suivant' : ''}"><div class="mission-head"><span class="eyebrow">TA CIBLE</span><div class="target-chip">${avatar(info.target)}<strong>${esc(info.target.name)}</strong></div></div>${missionArt(info.mission, info.target)}<h1>${esc(info.mission.title)}</h1><p class="mission-instruction">${esc(info.text)}</p><button class="audio-button" data-action="speak" aria-label="Écouter ma mission"><span aria-hidden="true">🔊</span> Écouter ma mission</button><span class="tap-cue"><span aria-hidden="true">☝</span> ${distribution ? 'Tapote pour passer au suivant' : 'Tapote pour cacher ta mission'}</span></div>${!distribution ? '<button class="button success-button" data-action="claim">✓ Ma cible a réussi l’action !</button>' : ''}</section>`;
  }
}

function renderPlaying() {
  app.innerHTML = `<section class="game-heading"><span class="eyebrow">À VOUS DE JOUER !</span><h1>Les malins sont<br>dans la <span class="word-highlight">place.</span></h1><p>Choisis ton avatar pour retrouver ta mission.<br>Garde le secret et ouvre l’œil !</p><span class="count-badge">${livePlayers().length} encore en jeu</span></section><section class="crew-section"><div class="player-grid">${livePlayers().map(p => playerCard(p)).join('')}</div>${state.players.some(p => !p.alive) ? `<div class="eliminated"><h3>Ils ont été attrapés</h3><div class="eliminated-list">${state.players.filter(p => !p.alive).map(p => `<span>${avatar(p)} ${esc(p.name)}</span>`).join('')}</div></div>` : ''}</section><p class="local-note">La partie est sauvegardée automatiquement sur ce téléphone.</p>`;
}

function renderWinner() {
  const winner = getPlayer(state.winnerId);
  app.innerHTML = `<section class="winner-section"><span class="eyebrow">✦ BRAVO À TOUTE LA BANDE ✦</span><div class="winner-art"><span class="winner-crown" aria-hidden="true">👑</span>${avatar(winner)}</div><h1>${esc(winner.name)},<br>quel petit malin !</h1><p>Le dernier membre de la famille encore en jeu.<br>Une victoire qui mérite des applaudissements !</p><button class="audio-button" data-action="speak-winner">🔊 Écouter</button><p class="local-note">Pour rejouer, ouvre le Coin des grands avec ton code.</p></section>`;
}

function renderAdmin() {
  if (!adminUnlocked) { view = 'home'; return render(); }
  app.innerHTML = `<section class="admin-section"><div class="section-heading"><div><span class="eyebrow">LE COIN DES GRANDS</span><h1>Les petits secrets.</h1><p>Les missions sont visibles ici. Attention aux regards curieux !</p></div><button class="button secondary" data-action="leave-admin">Fermer 🔒</button></div>${state.phase === 'setup' ? '<p>Les missions seront attribuées au lancement du jeu.</p>' : `<div class="admin-missions">${state.players.map(p => { const info = missionFor(state, p.id, true); return `<article class="admin-mission ${p.alive ? '' : 'is-out'}"><div class="admin-person">${avatar(p)}<div><strong>${esc(p.name)}</strong><small>${!p.alive ? 'Attrapé·e' : state.phase === 'finished' ? '🏆 Gagnant·e' : 'En jeu'}</small></div></div>${info ? `<span class="mission-mini" aria-hidden="true">${info.mission.emoji}</span><div><p>${esc(info.text)}</p><small>${p.alive ? "Cible" : "Dernière cible"} : ${esc(info.target.name)}</small></div>` : '<p>Plus de mission active.</p>'}</article>`; }).join('')}</div>`}<div class="admin-tools"><h2>Les commandes du jeu</h2><button class="button secondary" data-action="change-pin">Changer le code secret</button>${state.phase !== 'setup' ? '<button class="button secondary" data-action="restart">Rejouer avec la même bande</button>' : ''}<button class="button danger" data-action="reset">Tout remettre à zéro</button><p>La remise à zéro efface les joueurs, les missions et le code de ce navigateur.</p></div><p class="local-note">${state.events.length} ${state.events.length === 1 ? 'mission réussie' : 'missions réussies'} · Données enregistrées uniquement dans ce navigateur.</p></section>`;
}

function editor(id) {
  const existing = id ? getPlayer(id) : null;
  const player = existing ? { ...existing } : { id: crypto.randomUUID(), name: '', kind: 'girl', hair: colors.hair[0], shirt: colors.shirt[state.players.length % colors.shirt.length], skin: colors.skin[0], bald: false, alive: true };
  const swatches = (key, label) => `<fieldset class="color-field"><legend>${label}</legend><div class="swatches">${colors[key].map((color, i) => `<label class="swatch" style="--swatch:${color}"><input type="radio" name="${key}" value="${color}" ${player[key] === color ? 'checked' : ''}><span aria-hidden="true"></span><span class="sr-only">${colorNames[key][i]}</span></label>`).join('')}</div></fieldset>`;
  openModal(`<span class="eyebrow">LA FABRIQUE À MALINS</span><h2 id="modal-title">${existing ? 'Un petit changement ?' : 'Bienvenue dans la bande !'}</h2><form id="avatar-form"><div class="editor-layout"><div class="avatar-preview" id="avatar-preview" style="--card-color:${player.shirt}">${avatar(player)}<strong>${esc(player.name) || 'C’est toi !'}</strong></div><div class="editor-fields"><label class="field-label" for="player-name">Ton prénom</label><input id="player-name" name="name" maxlength="24" placeholder="Ex. : Mamie, Lou, Papa…" value="${esc(player.name)}" required autocomplete="off"><fieldset class="kind-field"><legend>Ton personnage</legend><div class="kind-choices">${[['woman', 'Femme'], ['man', 'Homme'], ['girl', 'Fille'], ['boy', 'Garçon']].map(([kind, label]) => `<label><input type="radio" name="kind" value="${kind}" ${player.kind === kind ? 'checked' : ''}>${avatar({ ...player, kind, name: label })}<span>${label}</span></label>`).join('')}</div></fieldset>${swatches('hair', 'Les cheveux')}<label class="bald-option"><input type="checkbox" name="bald" ${player.bald ? 'checked' : ''}> Sans cheveux</label>${swatches('shirt', 'Le t-shirt')}${swatches('skin', 'La peau')}</div></div><div class="form-actions">${existing ? '<button type="button" class="text-button danger-text" data-action="delete-player" data-id="' + esc(id) + '">Retirer ce joueur</button>' : ''}<button class="button" type="submit">${existing ? 'Enregistrer' : 'Ajouter à la bande'} <span aria-hidden="true">✓</span></button></div></form>`);
  const form = document.querySelector('#avatar-form');
  const update = () => {
    const data = new FormData(form);
    Object.assign(player, { name: String(data.get('name')).trim(), kind: data.get('kind'), hair: data.get('hair'), shirt: data.get('shirt'), skin: data.get('skin'), bald: data.has('bald') });
    const preview = document.querySelector('#avatar-preview');
    preview.style.setProperty('--card-color', player.shirt); preview.innerHTML = `${avatar(player)}<strong>${esc(player.name) || 'C’est toi !'}</strong>`;
  };
  form.addEventListener('input', update);
  form.addEventListener('submit', event => {
    event.preventDefault(); update();
    if (!player.name) return toast('Il manque le prénom.');
    if (state.players.some(p => p.id !== player.id && p.name.toLocaleLowerCase('fr') === player.name.toLocaleLowerCase('fr'))) return toast('Choisis un prénom différent pour reconnaître chaque joueur.');
    const players = existing ? state.players.map(p => p.id === id ? player : p) : [...state.players, player];
    if (commit({ ...state, players })) { modal.close(); render(); }
  });
}

function pinForm({ title, text, setup = false, onSuccess }) {
  openModal(`<span class="eyebrow">🔒 LE COIN DES GRANDS</span><h2 id="modal-title">${title}</h2><p>${text}</p><form id="pin-form"><label class="field-label" for="pin">${setup ? 'Choisis un code de 4 à 8 chiffres' : 'Ton code secret'}</label><input class="pin-input" id="pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" required autocomplete="off" autofocus>${setup ? '<label class="field-label" for="pin-confirm">Encore une fois pour vérifier</label><input class="pin-input" id="pin-confirm" name="confirm" type="password" inputmode="numeric" pattern="[0-9]{4,8}" required autocomplete="off">' : ''}<p id="pin-error" class="form-error" role="alert"></p><button class="button" type="submit">${setup ? 'Enregistrer le code' : 'Ouvrir'} →</button></form>`);
  document.querySelector('#pin-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.target), pin = data.get('pin');
    let expected = state.pin;
    if (loadError) { try { expected = JSON.parse(localStorage.getItem(STORAGE_KEY))?.pin; } catch { expected = null; } }
    if (setup ? pin !== data.get('confirm') : pin !== expected) { document.querySelector('#pin-error').textContent = setup ? 'Les deux codes sont différents.' : 'Ce n’est pas le bon code. Réessaie.'; return; }
    if (!/^\d{4,8}$/.test(pin)) return;
    onSuccess(pin);
  });
}

function launch() {
  const run = () => {
    openModal(`<span class="eyebrow">TOUT LE MONDE EST PRÊT ?</span><h2 id="modal-title">Place aux petits secrets.</h2><p>Les ${state.players.length} joueurs recevront chacun une cible et une mission. Ensuite, passez-vous le téléphone.</p><p>Les avatars ne pourront plus être modifiés pendant la partie.</p><button class="button" data-action="confirm-launch">C’est parti ! ↗</button>`);
  };
  if (!state.pin) pinForm({ title: 'Un code pour les grands.', text: 'Il permet de revoir toutes les missions et de remettre le jeu à zéro. Garde-le en mémoire : il reste sur ce téléphone.', setup: true, onSuccess: pin => { if (commit({ ...state, pin })) run(); } });
  else run();
}

function speak(text) {
  if (!('speechSynthesis' in window)) return toast('La lecture audio n’est pas disponible dans ce navigateur.');
  stopAudio();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR'; utterance.rate = .85;
  const voice = speechSynthesis.getVoices().find(v => v.lang.startsWith('fr'));
  if (voice) utterance.voice = voice;
  utterance.onerror = event => { if (!['canceled', 'interrupted'].includes(event.error)) toast('La lecture audio est indisponible. Vérifie le son et la voix française du téléphone.'); };
  speechSynthesis.speak(utterance);
}

function confirmReset(recover = false) {
  openModal(`<span class="eyebrow">ON EFFACE TOUT ?</span><h2 id="modal-title">Une toute nouvelle page.</h2><p>Tous les avatars, les prénoms, les missions, la progression et le code secret seront effacés de ce navigateur.</p><div class="form-actions"><button class="button secondary" data-action="close-modal">Garder la partie</button><button class="button danger" data-action="confirm-reset" ${recover ? 'data-recover="true"' : ''}>Oui, tout effacer</button></div>`);
}

const actions = {
  'close-modal': () => modal.close(),
  'add-player': () => editor(),
  'edit-player': el => { if (state.phase === 'setup') editor(el.dataset.id); },
  'delete-player': el => { if (state.phase === 'setup' && commit({ ...state, players: state.players.filter(p => p.id !== el.dataset.id) })) { modal.close(); render(); } },
  launch,
  'confirm-launch': () => { if (commit(startGame(state))) { modal.close(); adminUnlocked = false; view = 'home'; revealed = false; render(); } },
  reveal: () => { revealed = true; render(); },
  hide: () => { revealed = false; render(); },
  advance: () => {
    if (state.phase === 'distribution') {
      if (!commit(nextPlayer(state))) return;
      if (state.phase === 'playing') toast('Tout le monde a sa mission ! À vous de jouer.');
    }
    revealed = false; view = 'home'; render();
  },
  home: () => { view = 'home'; revealed = false; render(); },
  'open-player': el => { selectedId = el.dataset.id; view = 'pass'; revealed = false; render(); },
  speak: () => { const info = missionFor(state, selectedId); if (info) speak(`${info.target.name} est ta cible. ${info.text}`); },
  'speak-winner': () => speak(`Bravo ${getPlayer(state.winnerId).name} ! Tu as gagné !`),
  claim: () => {
    const info = missionFor(state, selectedId);
    openModal(`<span class="eyebrow">MISSION ACCOMPLIE ?</span><h2 id="modal-title">Bien joué, ${esc(getPlayer(selectedId).name)} !</h2><div class="confirm-target">${avatar(info.target)}<strong>${esc(info.target.name)}</strong></div><p>${esc(info.text)}</p><p>Votre cible confirme ? Elle sera éliminée et vous récupérerez sa mission.</p><div class="form-actions"><button class="button secondary" data-action="close-modal">Pas encore</button><button class="button" data-action="confirm-claim">🤝 Oui, on confirme !</button></div>`);
  },
  'confirm-claim': () => {
    try {
      if (!commit(eliminate(state, selectedId))) return;
      modal.close(); revealed = false; view = state.phase === 'finished' ? 'home' : 'pass'; render();
      if (state.phase !== 'finished') toast('Mission récupérée ! Tapote pour découvrir ta nouvelle cible.');
    } catch (error) { toast(error.message); }
  },
  'leave-admin': () => { adminUnlocked = false; view = 'home'; revealed = false; render(); },
  'change-pin': () => { if (adminUnlocked) pinForm({ title: 'Un nouveau code.', text: 'Choisis le nouveau code du Coin des grands.', setup: true, onSuccess: pin => { if (commit({ ...state, pin })) { modal.close(); toast('Le nouveau code est enregistré.'); } } }); },
  reset: () => { if (adminUnlocked) confirmReset(); },
  'confirm-reset': el => {
    if (!adminUnlocked && el.dataset.recover !== 'true') return;
    try { localStorage.removeItem(STORAGE_KEY); } catch { return toast('Impossible d’effacer les données du navigateur.'); }
    state = freshGame(); loadError = false; adminUnlocked = false; selectedId = null; revealed = false; view = 'home'; modal.close(); render(); toast('Tout est prêt pour une nouvelle bande !');
  },
  restart: () => {
    if (!adminUnlocked) return;
    openModal(`<h2 id="modal-title">On rejoue ensemble ?</h2><p>Les avatars et le code sont conservés. Les missions et les éliminations seront effacées. Tu pourras modifier la bande avant de relancer.</p><button class="button" data-action="confirm-restart">Préparer une nouvelle partie</button>`);
  },
  'confirm-restart': () => { if (adminUnlocked && commit({ ...freshGame(), pin: state.pin, players: state.players.map(p => ({ ...p, alive: true })) })) { modal.close(); adminUnlocked = false; revealed = false; view = 'home'; render(); } },
  'mission-list': () => openModal(`<span class="eyebrow">POUR TOUS LES PETITS MALINS</span><h2 id="modal-title">10 façons de piéger.</h2><p>Des actions simples, dès 4 ans. Les missions sont attribuées au hasard au lancement.</p><div class="mission-catalog">${MISSIONS.map(m => `<div><span style="background:${m.color}" aria-hidden="true">${m.emoji}</span><div><strong>${esc(m.title)}</strong><p>${esc(m.short)}</p></div></div>`).join('')}</div>`),
  'export-save': () => {
    try {
      const url = URL.createObjectURL(new Blob([localStorage.getItem(STORAGE_KEY) || '{}'], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'mission-malice-sauvegarde.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { toast('Le stockage du navigateur est inaccessible.'); }
  },
  'recover-reset': () => pinForm({ title: 'Ton code administrateur.', text: 'Utilise le code de cette partie pour effacer la sauvegarde abîmée.', onSuccess: () => confirmReset(true) })
};

document.addEventListener('click', event => {
  const el = event.target.closest('[data-action]');
  if (!el || el.disabled) return;
  if (modal.open && !modal.contains(el)) return;
  actions[el.dataset.action]?.(el);
});

app.addEventListener('keydown', event => {
  if (event.target.matches('.mission-surface') && ['Enter', ' '].includes(event.key)) { event.preventDefault(); actions.advance(); }
});

document.querySelector('#admin-trigger').addEventListener('click', () => {
  revealed = false; render();
  if (adminUnlocked) { view = 'admin'; return render(); }
  if (!state.pin && !loadError) pinForm({ title: 'Un code pour les grands.', text: 'Crée le code qui protégera les missions et la remise à zéro.', setup: true, onSuccess: pin => { if (commit({ ...state, pin })) { modal.close(); adminUnlocked = true; view = 'admin'; render(); } } });
  else pinForm({ title: 'Les secrets, c’est par ici.', text: 'Entre le code administrateur pour consulter les missions ou remettre le jeu à zéro.', onSuccess: () => { modal.close(); adminUnlocked = true; view = 'admin'; render(); } });
});

document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); adminUnlocked = false; revealed = false; view = 'home'; render(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopAudio(); revealed = false; adminUnlocked = false; view = 'home'; render(); if (modal.open) modal.close(); } });
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  try { state = readGame(localStorage); loadError = false; } catch { loadError = true; }
  revealed = false; adminUnlocked = false; view = 'home'; modal.close(); render(); toast('La partie a été mise à jour dans un autre onglet.');
});
render();
