// ==UserScript==
// @name         JVCDV 2
// @version      3.1
// @description  Voir les profils des comptes bannis !
// @author       NocturneX
// @match        *://www.jeuxvideo.com/profil/*
// @grant        GM_xmlhttpRequest
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js
// @updateURL    https://github.com/NocturneJVC/jvc_script/raw/master/jvcdv2.user.js
// @connect      api.jeuxvideo.com
// ==/UserScript==

(async () => {
  if (document.querySelector('.img-erreur')) return;

  if (!/^https?:\/\/www\.jeuxvideo.com\/profil\/(.+)?mode=infos$/.test(document.location.href)) return;

  const alertDanger = document.querySelector('#page-profil .alert.alert-danger');
  if (!alertDanger) return;
  if (alertDanger.textContent.trim() !== 'Le pseudo est banni.') return;

  // ---------------

  const bell = document.querySelector('#header-profil .icon-bell-off');
  const pictoAttention = document.querySelector('#header-profil .icon-report-problem');
  let pseudoId;

  if (bell) {
    pseudoId = bell.dataset.id;
  } else if (pictoAttention && /\/profil\/gta\.php\?id=([0-9]+)&/g.test(pictoAttention.dataset.selector)) {
    pseudoId = RegExp.$1.trim();
  }

  if (!pseudoId) {
    throw new Error('Impossible de récupérer l\'id du pseudo');
  }

  // ---------------

  let staticVersion;
  document.querySelectorAll("link[rel='stylesheet']").forEach((el) => {
    if (/static.jvc.gg\/([0-9.]+)\/css\/skin-common.css/.test(el.href)) {
      staticVersion = RegExp.$1;
    }
  });

  const badgeBaseUrl = `https://static.jvc.gg/${staticVersion}/img/profils/badges/256px/badges-web/`;
  const badgeUrl = (name) => `${badgeBaseUrl}badge-${name}.png`;

  const badges = {
    1: { name: 'Ambassadeur Respawn', url: badgeUrl('ambassadeur-respawn') },
    2: { name: 'J\'y étais', url: badgeUrl('present-jv') },
    3: { name: 'Rang Bronze', url: badgeUrl('rang-bronze') },
    4: { name: 'Rang Argent', url: badgeUrl('rang-argent') },
    5: { name: 'Rang Or', url: badgeUrl('rang-or') },
    6: { name: 'Rang Rubis', url: badgeUrl('rang-rubis') },
    7: { name: 'Rang Saphir', url: badgeUrl('rang-saphir') },
    8: { name: 'Rang Émeraude', url: badgeUrl('rang-emeraude') },
    9: { name: 'Rang Diamant', url: badgeUrl('rang-diamant') },
    10: { name: 'Paris Games Week 2015', url: badgeUrl('pgw-2015') },
    11: { name: 'Paris Games Week 2016', url: badgeUrl('pgw-2016') },
    12: { name: 'Paris Games Week 2017', url: badgeUrl('pgw-2017') },
    13: { name: 'JV Fan Contest Bronze', url: badgeUrl('challenge-season-1-bronze') },
    14: { name: 'JV Fan Contest Argent', url: badgeUrl('challenge-season-1-argent') },
    15: { name: 'JV Fan Contest Or', url: badgeUrl('challenge-season-1-or') },
    16: { name: 'JV Fan Contest Platine', url: badgeUrl('challenge-season-1-platine') },
    17: { name: 'JV Fan Contest Diamant', url: badgeUrl('challenge-season-1-diamant') },
    18: { name: 'JV Fan Contest Elite', url: badgeUrl('challenge-season-1-elite') },
    19: { name: 'JV Fan Contest Champion', url: badgeUrl('challenge-season-1-champion') },
    20: { name: 'JV Fan Contest Légende', url: badgeUrl('challenge-season-1-legend') },
    22: { name: 'Vous Ne Passerez Pas', url: badgeUrl('vous-ne-passerez-pas') },
  };

  const machines = {
    10: { name: 'PC', label: 'pc' },
    22: { name: 'PlayStation 5', label: 'ps5' },
    32: { name: 'Xbox Series', label: 'xbox-series' },
    177539: { name: 'Nintendo Switch', label: 'switch' },
    20: { name: 'PlayStation 4', label: 'ps4' },
    30: { name: 'Xbox One', label: 'one' },
    14: { name: 'Google Stadia', label: 'stadia' },
    40: { name: 'Wii U', label: 'wii-u' },
    50: { name: 'PlayStation 3', label: 'ps3' },
    60: { name: 'Xbox 360', label: '360' },
    70: { name: 'Nintendo 3DS', label: '3ds' },
    80: { name: 'PlayStation Vita', label: 'vita' },
    380: { name: 'Nintendo DS', label: 'ds' },
    460: { name: 'Wii', label: 'wii' },
    280: { name: 'Mac', label: 'mac' },
    90: { name: 'iOS', label: 'ios' },
    100: { name: 'Android', label: 'android' },
    110: { name: 'Web', label: 'web' },
    120: { name: '3DO', label: '3do' },
    130: { name: 'Amiga', label: 'amiga' },
    140: { name: 'Amstrad CPC', label: 'amstrad-cpc' },
    150: { name: 'Apple II', label: 'apple-ii' },
    160: { name: 'Atari ST', label: 'atari-st' },
    170: { name: 'Atari 2600', label: 'atari-2600' },
    570: { name: 'Atari 5200', label: 'atari-5200' },
    500: { name: 'Atari 7800', label: 'atari-7800' },
    660: { name: 'Box Bouygues', label: 'box-bouygues' },
    670: { name: 'Box Free', label: 'box-free' },
    640: { name: 'Box Orange', label: 'box-orange' },
    650: { name: 'Box SFR', label: 'box-sfr' },
    480: { name: 'CD-i', label: 'cd-i' },
    530: { name: 'Colecovision', label: 'colecovision' },
    180: { name: 'Commodore 64', label: 'commodore-64' },
    190: { name: 'Dreamcast', label: 'dreamcast' },
    490: { name: 'Famicom Disk System', label: 'famicom-disk-system' },
    550: { name: 'Game & Watch', label: 'game-watch' },
    200: { name: 'Gameboy', label: 'gameboy' },
    210: { name: 'Gameboy Advance', label: 'gameboy-advance' },
    560: { name: 'Gameboy Color', label: 'gameboy-color' },
    220: { name: 'Gamecube', label: 'gamecube' },
    230: { name: 'Game Gear', label: 'game-gear' },
    240: { name: 'Gizmondo', label: 'gizmondo' },
    250: { name: 'GP32', label: 'gp32' },
    510: { name: 'GX-4000', label: 'gx-4000' },
    540: { name: 'Intellivision', label: 'intellivision' },
    260: { name: 'Jaguar', label: 'jaguar' },
    270: { name: 'Lynx', label: 'lynx' },
    290: { name: 'Master System', label: 'master-system' },
    300: { name: 'Megadrive', label: 'megadrive' },
    310: { name: 'Megadrive 32X', label: 'megadrive-32x' },
    320: { name: 'Mega-CD', label: 'mega-cd' },
    600: { name: 'MSX', label: 'msx' },
    330: { name: 'N-Gage', label: 'n-gage' },
    340: { name: 'Neo Geo', label: 'neo-geo' },
    350: { name: 'Neo Geo Pocket', label: 'neo-geo-pocket' },
    360: { name: 'Nes', label: 'nes' },
    370: { name: 'Nintendo 64', label: 'nintendo-64' },
    620: { name: 'Odyssey', label: 'odyssey' },
    390: { name: 'PSone', label: 'psone' },
    400: { name: 'PlayStation 2', label: 'playstation-2' },
    410: { name: 'PlayStation Portable', label: 'playstation-portable' },
    420: { name: 'Saturn', label: 'saturn' },
    430: { name: 'Super Nintendo', label: 'super-nintendo' },
    440: { name: 'PC Engine', label: 'pc-engine' },
    520: { name: 'Vectrex', label: 'vectrex' },
    630: { name: 'Videopac', label: 'videopac' },
    450: { name: 'Virtual Boy', label: 'virtual-boy' },
    580: { name: 'WonderSwan', label: 'wonderswan' },
    590: { name: 'WonderSwan Color' },
    470: { name: 'Xbox', label: 'xbox' },
    610: { name: 'ZX Spectrum', label: 'zx' },
    171740: { name: 'Arcade', label: 'arcade' },
    172235: { name: 'New Nintendo 3DS', label: 'new-3ds' },
    173455: { name: 'OUYA', label: 'ouya' },
    174433: { name: 'Steam Machine', label: 'steam-machine' },
    175794: { name: 'Linux', label: 'linux' },
    680: { name: 'Shield TV', label: 'shield-tv' },
    190274: { name: 'Intellivision Amico', label: 'intellivision-amico' },
    200772: { name: 'Steam Deck', label: 'steam-deck' },
  };

  // ---------------

  const requestApiJvc = (url) => new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    const method = 'GET';
    const signature = CryptoJS.HmacSHA256(`550c04bf5cb2b\n${timestamp}\n${method}\napi.jeuxvideo.com\n/v3/${url}\n`, 'd84e9e5f191ea4ffc39c22d11c77dd6c');
    const header = `PartnerKey=550c04bf5cb2b, Signature=${signature}, Timestamp=${timestamp}`;
    GM_xmlhttpRequest({
      method,
      headers: {
        'Jvc-Authorization': header,
        'Content-Type': 'application/json',
      },
      url: `https://api.jeuxvideo.com/v3/${url}`,
      onload: (response) => resolve(JSON.parse(response.responseText)),
      onerror: (response) => reject(response),
    });
  });

  // ---------------

  const cdvBody = document.createElement('div');
  cdvBody.classList.add('jvcdv-body', 'row');
  cdvBody.innerHTML = '<p class="text-center">Chargement...</p>';

  alertDanger.parentNode.parentNode.after(cdvBody);

  // ---------------

  const profile = await requestApiJvc(`accounts/${pseudoId}/profile`);

  // ---------------

  const displayDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const displayNumber = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  let empty = true;

  let html = '';

  html += '<div class="col-lg-6">';

  if (profile.info) {
    empty = false;

    const addLine = (lib, value) => {
      html += `
        <li>
          <div class="info-lib">
            ${lib} :
          </div>
          <div class="info-value">
            ${value}
          </div>
        </li>`;
    };

    html += `
      <div class="bloc-default-profil">
        <div class="bloc-default-profil-header">
          <h2>Infos</h2>
        </div>
        <div class="bloc-default-profil-body">
          <ul class="display-line-lib">`;

    if (profile.info.age !== undefined) {
      addLine('Age', profile.info.age);
    }

    if (profile.info.genre) {
      addLine('Genre', profile.info.genre);
    }

    if (profile.info.country && profile.info.city) {
      addLine('Pays / Ville', `${profile.info.country} / ${profile.info.city}`);
    } else if (profile.info.country) {
      addLine('Pays', profile.info.country);
    } else if (profile.info.city) {
      addLine('Ville', profile.info.city);
    }

    if (profile.info.creationDate) {
      const since = profile.info.creationSince ? ` (${displayNumber(profile.info.creationSince)} jours)` : '';
      addLine('Membre depuis', `${displayDate(profile.info.creationDate)}${since}`);
    }

    if (profile.info.lastVisitDate) {
      addLine('Dernier passage', displayDate(profile.info.lastVisitDate));
    }

    if (profile.info.forumMessageCount !== undefined) {
      addLine('Messages Forums', `${displayNumber(profile.info.forumMessageCount)} messages`);
    }

    if (profile.info.commentCount !== undefined) {
      addLine('Commentaires', `${displayNumber(profile.info.commentCount)} commentaires`);
    }

    html += `
          </ul>
        </div>
      </div>`;
  }

  if (profile.badges && profile.badges.length) {
    empty = false;

    console.log(profile.badges);

    const badgesHtml = profile.badges.reduce(
      (result, badgeId) => result + (badges[badgeId] ? `<figure class="figure col-auto"><img src="${badges[badgeId].url}" alt="${badges[badgeId].name}" title="${badges[badgeId].name}"></figure>` : ''),
      '',
    );

    html += `
      <div class="bloc-default-profil">
        <div class="bloc-default-profil-header">
          <h2>Badges JeuxVideo.com</h2>
        </div>
        <div class="body hauts-faits">
          <div class="liste-hauts-faits justify-content-center row mt-5 m-auto js-list-badge">
             ${badgesHtml}
          </div>
        </div>
      </div>`;
  }

  html += '</div><div class="col-lg-6">';

  if (profile.description && profile.description.tree) {
    empty = false;

    const parseNoelshackUrl = (url) => {
      let fullname;
      let uploadedAt;
      let extension;

      if (/^https?:\/\/image\.noelshack\.com\/(fichiers|minis)\/((([0-9]+)\/([0-9]+)\/(([0-9]{10})-([a-z0-9-]+)))\.(png|jpg|jpeg|gif))$/.test(url)) {
        fullname = RegExp.$3;
        uploadedAt = parseInt(RegExp.$7, 10);
        extension = RegExp.$1 === 'fichiers' ? RegExp.$9 : null;
      } else if (/^https?:\/\/image\.noelshack\.com\/(fichiers|minis)\/(([0-9]+)\/([0-9]+)\/([0-9]+)\/(([0-9]{10})-([a-z0-9-]+)))\.(png|jpg|jpeg|gif)$/.test(url)) {
        fullname = RegExp.$2;
        uploadedAt = parseInt(RegExp.$7, 10);
        extension = RegExp.$1 === 'fichiers' ? RegExp.$9 : null;
      } else if (/^https?:\/\/www\.noelshack\.com\/([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})-(([0-9]{10})-([0-9a-z-]+))\.(png|jpg|jpeg|gif)$/.test(url)) {
        fullname = `${RegExp.$1}/${RegExp.$2}/${RegExp.$3}/${RegExp.$4}`;
        uploadedAt = parseInt(RegExp.$5, 10);
        extension = RegExp.$7;
      } else if (/^https?:\/\/www\.noelshack\.com\/([0-9]{4})-([0-9]{1,2})-(([0-9]{10})-([0-9a-z-]+))\.(png|jpg|jpeg|gif)$/.test(url)) {
        fullname = `${RegExp.$1}/${RegExp.$2}/${RegExp.$3}`;
        uploadedAt = parseInt(RegExp.$4, 10);
        extension = RegExp.$6;
      }

      return fullname ? {
        fullname,
        uploadedAt,
        extension,
      } : null;
    };

    const treeToHtml = (tree) => {
      let result = '';

      tree.forEach((node) => {
        switch (node.type) {
          case 'PARA':
            result += `<p>${treeToHtml(node.children)}</p>`;
            break;

          case 'STR':
            result += node.text;
            break;

          case 'STRONG':
            result += `<strong>${treeToHtml(node.children)}</strong>`;
            break;

          case 'EMPH':
            result += `<em>${treeToHtml(node.children)}</em>`;
            break;

          case 'UNDERLINE':
            result += `<u>${treeToHtml(node.children)}</u>`;
            break;

          case 'STRIKE':
            result += `<strike>${treeToHtml(node.children)}</strike>`;
            break;

          case 'BULLETLIST':
            result += `<ul class="liste-default-jv">${treeToHtml(node.children)}</ul>`;
            break;

          case 'ORDEREDLIST':
            result += `<ol class="liste-default-jv">${treeToHtml(node.children)}</ol>`;
            break;

          case 'LISTITEM':
            result += `<li>${treeToHtml(node.children)}</li>`;
            break;

          case 'LIST':
            result += treeToHtml(node.children);
            break;

          case 'PLAIN':
            result += `<span>${treeToHtml(node.children)}</span>`;
            break;

          case 'BLOCKQUOTE':
            result += `<blockquote class="blockquote-jv">${treeToHtml(node.children)}</blockquote>`;
            break;

          case 'SPOIL':
            result += `
              <span style="background: #f4d6da; color: #212121; padding: 0.1875rem;">
                ${treeToHtml(node.children)}
              </span>`;
            break;

          case 'SPOILBLOCK':
            result += `
              <div style="background: #f4d6da; color: #212121; padding: 0.1875rem; margin-bottom: 1.875rem;">
                ${treeToHtml(node.children)}
              </div>`;
            break;

          case 'CODE':
            result += `<code class="code-jv">${treeToHtml(node.children)}</code>`;
            break;

          case 'CODEBLOCK':
            result += `<pre class="code-jv"><code>${node.text}</code></pre>`;
            break;

          case 'SMILEY':
            result += `<img src="${node.url}" alt="${node.text}" data-code="${node.text}" title="${node.text}">`;
            break;

          case 'LINK':
            if (/^https?:\/\/(?:image\.|www\.)?noelshack\.com\//.test(node.url)) {
              const parsedUrl = parseNoelshackUrl(node.url);
              if (parsedUrl) {
                result += `
                  <a href="${node.url}" target="_blank" class="xXx">
                    <img class="img-shack" width="68" height="51" src="https://image.noelshack.com/minis/${parsedUrl.fullname}.png" alt="${node.url}">
                  </a>`;
                break;
              }
            }
            result += `<a href="${node.url}" target="_blank">${node.url}</a>`;
            break;

          case 'LINEBREAK':
            result += '<br>';
            break;

          default:
            if (node.text) result += node.text;
        }
      });

      return result;
    };

    html += `
    <div class="bloc-default-profil">
      <div class="bloc-default-profil-header">
        <h2>Description</h2>
      </div>
      <div class="bloc-default-profil-body">
        <div class="bloc-description-desc txt-enrichi-desc-profil">
          ${treeToHtml(profile.description.tree)}
        </div>
      </div>
    </div>`;
  }

  if (profile.machines) {
    empty = false;

    html += `
      <div class="bloc-default-profil">
        <div class="bloc-default-profil-header">
          <h2>Profil Gamer</h2>
        </div>
        <div class="bloc-default-profil-body">
          <ul class="display-bloc-lib">
            <li>
              <div class="info-lib">Machines :</div>
              <div class="info-value machine-profil">
                ${profile.machines.map((machineId) => (machines[machineId] ? `<span class="label-tag label-tag--${machines[machineId].label}">${machines[machineId].name}</span> ` : '')).join('')}
              </div>
            </li>
          </ul>
        </div>
      </div>`;
  }

  html += '</div>';

  if (empty) {
    html = '<p class="text-center">CDV complètement vide !</p>';
  }

  cdvBody.innerHTML = html;
})();
