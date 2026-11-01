export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function avatar(player, className = '', pose = 'normal') {
  const child = ['girl', 'boy'].includes(player.kind);
  const skirt = ['woman', 'girl'].includes(player.kind);
  const hair = escapeHTML(player.hair), shirt = escapeHTML(player.shirt), skin = escapeHTML(player.skin);
  const raised = pose === 'arms', clap = pose === 'clap', nose = pose === 'nose';
  const armPath = raised ? 'M60 112 Q38 96 40 66 M120 112 Q142 96 140 66' : clap ? 'M60 112 Q45 130 83 119 M120 112 Q135 130 97 119' : nose ? 'M60 112 Q35 95 84 73 M120 112 L132 143' : 'M60 112 L44 145 M120 112 L136 145';
  return `<svg class="avatar ${className}" viewBox="0 0 180 205" role="img" aria-label="Avatar de ${escapeHTML(player.name || 'ton personnage')}">
    <ellipse cx="90" cy="192" rx="47" ry="6" fill="#303629" opacity=".08"/>
    <g transform="${child ? 'translate(14 29) scale(.84)' : 'translate(0 0)'}">
    ${!player.bald && skirt ? `<path d="M56 55 Q51 17 90 17 Q130 17 125 57 L132 101 Q112 117 51 99Z" fill="${hair}"/>` : ''}
    <path d="M77 154 L76 182 M103 154 L104 182" stroke="${skin}" stroke-width="15" stroke-linecap="round"/>
    <path d="M76 184 L66 186 M104 184 L115 186" stroke="#38433a" stroke-width="12" stroke-linecap="round"/>
    ${skirt ? '<path d="M68 134 L112 134 L124 161 Q90 171 56 161Z" fill="#586b8d"/>' : `<path d="M63 134 H117 V${child ? '159' : '179'} H96 V151 H84 V${child ? '159' : '179'} H63Z" fill="#586b8d"/>`}
    <path d="${armPath}" fill="none" stroke="${skin}" stroke-width="13" stroke-linecap="round"/>
    <path d="M69 102 Q90 96 111 102 L124 118 L111 126 L110 144 H70 L69 126 L56 118Z" fill="${shirt}"/>
    <path d="M83 92 V103 Q90 111 97 103 V92" fill="${skin}"/>
    <circle cx="57" cy="68" r="8" fill="${skin}"/><circle cx="123" cy="68" r="8" fill="${skin}"/>
    <rect x="58" y="31" width="64" height="66" rx="29" fill="${skin}"/>
    ${player.bald ? '' : `<path d="M57 61 Q50 17 90 19 Q129 17 124 58 L111 45 Q94 52 77 40 L61 63Z" fill="${hair}"/>`}
    <path d="M76 65 V68 M104 65 V68" stroke="#34382b" stroke-width="4" stroke-linecap="round"/>
    <path d="M81 81 Q90 89 99 81" fill="none" stroke="#7c493b" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="69" cy="77" rx="6" ry="3" fill="#e68f7e" opacity=".4"/><ellipse cx="111" cy="77" rx="6" ry="3" fill="#e68f7e" opacity=".4"/>
    ${nose ? `<circle cx="86" cy="74" r="6" fill="${skin}"/>` : ''}
    </g></svg>`;
}

export function missionArt(mission, target) {
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

export function heroArt() {
  const people = [
    { name: 'Une adulte', kind: 'woman', hair: '#6b4231', shirt: '#a7b5d9', skin: '#e7ac83' },
    { name: 'Un enfant', kind: 'boy', hair: '#57392d', shirt: '#e58b54', skin: '#d39268' },
    { name: 'Une enfant', kind: 'girl', hair: '#c68c40', shirt: '#a1bd91', skin: '#f2c9a1' }
  ];
  return `<div class="hero-art" aria-hidden="true"><span class="art-spark spark-one">✳</span><span class="art-spark spark-two">✦</span><span class="hero-bubble">Psst… <span>🤫</span></span><div class="hero-person hero-one">${avatar(people[0])}</div><div class="hero-person hero-two">${avatar(people[1], '', 'arms')}</div><div class="hero-person hero-three">${avatar(people[2])}</div><span class="hero-sticker">100 % complices</span><svg class="hero-squiggle" viewBox="0 0 100 50"><path d="M5 35 Q25 0 40 25 T80 20 L92 8 M79 9 L93 7 L92 23" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></div>`;
}
