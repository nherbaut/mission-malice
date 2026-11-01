import { AVATAR_DEFAULTS } from './game.js';

export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const accessoryDrawings = {
  glasses: '<g fill="none" stroke="#34382b" stroke-width="3"><circle cx="75" cy="66" r="12"/><circle cx="105" cy="66" r="12"/><path d="M87 65Q90 62 93 65 M63 63L57 59 M117 63L123 59"/></g>',
  sunglasses: '<g fill="#34382b" stroke="#34382b" stroke-width="3"><rect x="61" y="57" width="27" height="19" rx="7"/><rect x="92" y="57" width="27" height="19" rx="7"/><path d="M88 62H92 M61 61L56 58 M119 61L124 58"/></g><path d="M67 61L72 65 M98 61L103 65" stroke="#fffdf5" stroke-width="2" opacity=".6"/>',
  hat: '<path d="M68 29L64 5H116L112 29Z" fill="#34382b"/><path d="M67 20H113V29H67Z" fill="#e58b54"/><ellipse cx="90" cy="30" rx="40" ry="6" fill="#34382b"/>',
  cap: '<path d="M57 35Q58 8 90 8Q121 8 123 35Z" fill="#527b8b"/><path d="M90 9Q103 15 104 34" fill="none" stroke="#396071" stroke-width="2"/><path d="M85 34Q117 29 140 38Q122 46 98 39Z" fill="#396071"/><circle cx="90" cy="9" r="3" fill="#396071"/>',
  bow: '<path d="M111 24Q87 4 91 29Q89 43 111 30 M115 24Q137 4 135 29Q137 44 115 30" fill="#cb6b88" stroke="#a14e6a" stroke-width="2"/><circle cx="113" cy="27" r="6" fill="#e5a0b8"/>'
};

export function avatar(player, className = '', pose = 'normal') {
  const child = ['girl', 'boy'].includes(player.kind);
  const skirt = ['woman', 'girl'].includes(player.kind);
  const hair = escapeHTML(player.hair), shirt = escapeHTML(player.shirt), skin = escapeHTML(player.skin);
  const bottom = escapeHTML(player.bottom ?? AVATAR_DEFAULTS.bottom);
  const accessory = player.accessory ?? AVATAR_DEFAULTS.accessory;
  const armPath = {
    arms: 'M60 112 Q38 96 40 66 M120 112 Q142 96 140 66',
    clap: 'M60 112 Q45 130 83 119 M120 112 Q135 130 97 119',
    nose: 'M60 112 Q35 95 84 73 M120 112 L132 143',
    head: 'M60 112 Q28 65 77 30 M120 112 Q152 65 103 30',
    ears: 'M60 112 Q34 91 56 68 M120 112 Q146 91 124 68',
    cheeks: 'M60 112 Q38 96 70 77 M120 112 Q142 96 110 77',
    hips: 'M60 112 L45 131 L70 136 M120 112 L135 131 L110 136',
    wave: 'M60 112 Q31 101 41 71 M120 112 L136 145',
    thumb: 'M60 112 L44 145 M120 112 Q148 142 137 104',
    peekaboo: 'M60 112 Q32 90 77 67 M120 112 Q148 90 103 67',
    kiss: 'M60 112 Q37 98 86 82 M120 112 L136 145',
    robot: 'M60 112 H40 V90 M120 112 H140 V137',
    penguin: 'M60 112 L51 143 L43 145 M120 112 L129 143 L137 145',
    elephant: 'M60 112 L44 145 M120 112 Q146 70 103 74 L105 125',
    wings: 'M60 112 L31 97 M120 112 L149 97',
    march: 'M60 112 L43 126 M120 112 L135 95',
    knees: 'M60 112 Q43 139 77 156 M120 112 Q137 139 103 156'
  }[pose] || 'M60 112 L44 145 M120 112 L136 145';
  const hands = { nose: [[86, 74]], head: [[77, 30], [103, 30]], ears: [[56, 68], [124, 68]], cheeks: [[70, 77], [110, 77]], hips: [[70, 136], [110, 136]], peekaboo: [[77, 67], [103, 67]], kiss: [[86, 82]], knees: [[77, 156], [103, 156]] }[pose] || [];
  const legs = pose === 'march' ? 'M77 154 L65 167 L76 177 M103 154 L104 182' : pose === 'tiptoe' ? 'M77 154 L76 176 M103 154 L104 176' : 'M77 154 L76 182 M103 154 L104 182';
  const feet = pose === 'tiptoe' ? 'M76 176 L81 186 M104 176 L109 186' : pose === 'march' ? 'M76 178 L66 180 M104 184 L115 186' : 'M76 184 L66 186 M104 184 L115 186';
  return `<svg class="avatar ${className}" viewBox="0 0 180 205" role="img" aria-label="Avatar de ${escapeHTML(player.name || 'ton personnage')}">
    <ellipse cx="90" cy="192" rx="47" ry="6" fill="#303629" opacity=".08"/>
    <g transform="${child ? 'translate(14 29) scale(.84)' : 'translate(0 0)'}">
    ${!player.bald && skirt ? `<path d="M56 55 Q51 17 90 17 Q130 17 125 57 L132 101 Q112 117 51 99Z" fill="${hair}"/>` : ''}
    <path d="${legs}" stroke="${skin}" stroke-width="15" stroke-linecap="round" fill="none"/>
    <path d="${feet}" stroke="#38433a" stroke-width="12" stroke-linecap="round"/>
    ${skirt ? `<path data-avatar-part="bottom" d="M68 134 L112 134 L124 161 Q90 171 56 161Z" fill="${bottom}"/>` : `<path data-avatar-part="bottom" d="M63 134 H117 V${child ? '159' : '179'} H96 V151 H84 V${child ? '159' : '179'} H63Z" fill="${bottom}"/>`}
    <path d="${armPath}" fill="none" stroke="${skin}" stroke-width="13" stroke-linecap="round"/>
    <path d="M69 102 Q90 96 111 102 L124 118 L111 126 L110 144 H70 L69 126 L56 118Z" fill="${shirt}"/>
    <path d="M83 92 V103 Q90 111 97 103 V92" fill="${skin}"/>
    <circle cx="57" cy="68" r="8" fill="${skin}"/><circle cx="123" cy="68" r="8" fill="${skin}"/>
    <rect x="58" y="31" width="64" height="66" rx="29" fill="${skin}"/>
    ${player.bald ? '' : `<path d="M57 61 Q50 17 90 19 Q129 17 124 58 L111 45 Q94 52 77 40 L61 63Z" fill="${hair}"/>`}
    <path d="M76 65 V68 M104 65 V68" stroke="#34382b" stroke-width="4" stroke-linecap="round"/>
    <path d="M81 81 Q90 89 99 81" fill="none" stroke="#7c493b" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="69" cy="77" rx="6" ry="3" fill="#e68f7e" opacity=".4"/><ellipse cx="111" cy="77" rx="6" ry="3" fill="#e68f7e" opacity=".4"/>
    ${Object.hasOwn(accessoryDrawings, accessory) ? `<g class="avatar-accessory" data-accessory="${escapeHTML(accessory)}">${accessoryDrawings[accessory]}</g>` : ''}
    ${hands.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${skin}"/>`).join('')}
    </g></svg>`;
}

export function missionArt(mission, target) {
  if (mission.visual) return additionalMissionArt(mission, target);
  const pose = ['arms', 'clap', 'nose'].includes(mission.id) ? mission.id : 'normal';
  const extra = {
    word: '<div class="speech-bubble">🍭<small>SU-CETTE !</small></div>',
    cat: '<div class="speech-bubble">🐱<small>MIAOU !</small></div>',
    sing: '<div class="scene-prop notes">♫ ♪</div><div class="scene-caption">LA LA LA !</div>',
    clap: '<div class="scene-prop clap-lines">✦ 👏 ✦</div>',
    arms: '<div class="scene-prop up-arrow">↑ &nbsp; ↑</div>',
    nose: '<div class="scene-prop nose-arrow">↙</div>',
    jump: '<div class="scene-prop jump-arrow">↑</div><div class="jump-ground"></div>',
    dance: '<div class="scene-prop notes">♫ ♪</div>',
    spoon: '<div class="scene-prop held-object">🥄 <span>→</span> 🤲</div>',
    water: '<div class="scene-prop held-object">🥤 <span>→</span> 🪑</div>'
  }[mission.id];
  return `<div class="mission-art art-${mission.id}" style="--scene:${mission.color}">${avatar(target, 'scene-person', pose)}${extra}</div>`;
}

function additionalMissionArt(mission, target) {
  const { type, symbol, caption, pose } = mission.visual;
  let extra;
  if (type === 'word' || type === 'animal') {
    extra = `<div class="speech-bubble">${escapeHTML(symbol)}<small>${escapeHTML(caption)}</small></div>`;
  } else if (type === 'give' || type === 'carry') {
    const destination = type === 'give' ? '<span class="destination-hands">🤲</span>' : caption === 'chair' ? '<span class="destination-chair">🪑</span>' : '<svg class="destination-table" viewBox="0 0 70 60" aria-label="Une table" role="img"><rect x="3" y="14" width="64" height="9" rx="3" fill="#b58054"/><path d="M12 22V55 M58 22V55" stroke="#825738" stroke-width="7" stroke-linecap="round"/></svg>';
    extra = `<div class="scene-prop object-action"><span class="mission-object">${escapeHTML(symbol)}</span><span class="object-arrow" aria-hidden="true">→</span>${destination}</div>`;
  } else {
    const singing = type === 'rhythm' && pose === 'normal';
    extra = `<span class="scene-prop visual-symbol" aria-hidden="true">${escapeHTML(symbol)}</span>${caption ? `<span class="scene-prop visual-caption">${escapeHTML(caption)}</span>` : ''}${singing ? '<span class="scene-prop song-notes" aria-hidden="true">♫ ♪</span>' : ''}`;
  }
  return `<div class="mission-art art-${mission.id} visual-${type} pose-${pose}" style="--scene:${mission.color}" role="img" aria-label="${escapeHTML(target.name)} : ${escapeHTML(mission.short)}">${avatar(target, 'scene-person', pose)}${extra}</div>`;
}

export function heroArt() {
  const people = [
    { name: 'Une adulte', kind: 'woman', hair: '#6b4231', shirt: '#a7b5d9', skin: '#e7ac83' },
    { name: 'Un enfant', kind: 'boy', hair: '#57392d', shirt: '#e58b54', skin: '#d39268' },
    { name: 'Une enfant', kind: 'girl', hair: '#c68c40', shirt: '#a1bd91', skin: '#f2c9a1' }
  ];
  return `<div class="hero-art" aria-hidden="true"><span class="art-spark spark-one">✳</span><span class="art-spark spark-two">✦</span><span class="hero-bubble">Psst… <span>🤫</span></span><div class="hero-person hero-one">${avatar(people[0])}</div><div class="hero-person hero-two">${avatar(people[1], '', 'arms')}</div><div class="hero-person hero-three">${avatar(people[2])}</div><span class="hero-sticker">100 % complices</span><svg class="hero-squiggle" viewBox="0 0 100 50"><path d="M5 35 Q25 0 40 25 T80 20 L92 8 M79 9 L93 7 L92 23" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></div>`;
}
