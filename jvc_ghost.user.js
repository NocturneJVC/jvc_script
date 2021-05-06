// ==UserScript==
// @name         JVC Ghost
// @version      0.1
// @description  Affiche les messages qui ont été 410 (fonctionne uniquement sur le 18-25)
// @author       NocturneX
// @match        *://www.jeuxvideo.com/forums/*
// @icon         https://image.noelshack.com/fichiers/2020/35/5/1598625703-ezgif-2-5cbf1db28502.gif
// @grant        GM_xmlhttpRequest
// @connect      jvarchive.com
// ==/UserScript==

(async function() {
    'use strict';

    if (!/www.jeuxvideo.com\/forums\/(1|42)-51-([0-9]+)-([0-9]+)-0-1-0-([a-z0-9-]+)\.htm/.test(document.location.href)) return;

    const topicType = parseInt(RegExp.$1);
    const topicId = parseInt(RegExp.$2);
    const currentPage = parseInt(RegExp.$3);
    const slug = RegExp.$4;

    const blacklist = /(cigarette\d+|exampleDePseudo|exampleDePseudo2)/i;

    let lastPage = 1
    for (let span of document.querySelectorAll('#forum-main-col .bloc-liste-num-page > span')) {
        const num = parseInt(span.textContent.trim());
        if (num != NaN && num > lastPage) {
            lastPage = num;
        }
    }

    const posts = {
        all () {
            return Array.from(document.querySelectorAll('.bloc-message-forum')).map((el) => {
                return {
                    el,
                    id: parseInt(el.getAttribute('data-id'))
                }
            });
        },
        first () {
            return this.all()[0]
        },
        last () {
            const posts = this.all();
            return posts[posts.length - 1];
        },
        createIfNotExist (id, auteur, date, text, docNextPage) {
            if (!document.querySelector(`.bloc-message-forum[data-id="${id}"]`) && (!docNextPage || !docNextPage.querySelector(`.bloc-message-forum[data-id="${id}"]`))) {
                console.log('JVC Ghost put message:', id);

                if (!auteur.avatar) auteur.avatar = 'https://image.jeuxvideo.com/avatar-sm/default.jpg';

                date = new Date(date);

                let month = '';
                switch (date.getMonth()) {
                    case 0: month = 'janvier'; break;
                    case 1: month = 'février'; break;
                    case 2: month = 'mars'; break;
                    case 3: month = 'avril'; break;
                    case 4: month = 'mai'; break;
                    case 5: month = 'juin'; break;
                    case 6: month = 'juillet'; break;
                    case 7: month = 'août'; break;
                    case 8: month = 'septembre'; break;
                    case 9: month = 'octobre'; break;
                    case 10: month = 'novembre'; break;
                    case 11: month = 'décembre'; break;
                }
                date = `${('0' + date.getDate()).slice(-2)} ${month} ${date.getFullYear()} à ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`

                const div = document.createElement('div');
                div.classList.add('bloc-message-forum');
                div.classList.add('msg-supprime');
                div.setAttribute('data-id', id);
                div.innerHTML = `
                                 <div class="conteneur-message">
                                     <div class="bloc-avatar-msg">
                                         <div class="back-img-msg">
                                             <div>
                                                 <a href="https://www.jeuxvideo.com/profil/${auteur.pseudo.toLowerCase()}?mode=infos" target="_blank" class="xXx ">
                                                     <img src="${auteur.avatar}"
                                                         class="user-avatar-msg" alt="${auteur.pseudo}">
                                                 </a>
                                             </div>
                                         </div>
                                     </div>
                                     <div class="inner-head-content">
                                         <div class="bloc-header">
                                             <a href="https://www.jeuxvideo.com/profil/${auteur.pseudo.toLowerCase()}?mode=infos" target="_blank"
                                                 class="xXx bloc-pseudo-msg text-user">
                                                 ${auteur.pseudo}
                                             </a>
                                             <div class="bloc-mp-pseudo">
                                                 <a href="https://www.jeuxvideo.com/messages-prives/nouveau.php?all_dest=${auteur.pseudo}"
                                                     target="_blank" class="xXx ">
                                                     <span class="picto-msg-lettre" title="Envoyer un message privé"><span>MP</span></span>
                                                 </a>
                                             </div>
                                             <div class="bloc-date-msg">
                                                 <a href="/forums/message/${id}" target="_blank" class="xXx lien-jv">${date}</a>
                                             </div>
                                         </div>
                                         <div class="bloc-contenu">
                                             <div class="txt-msg  text-enrichi-forum ">
                                                                              ${text}
                                             </div>
                                         </div>
                                     </div>
                                 </div>`;

                if (!div.querySelector('.txt-msg p, .txt-msg blockquote')) {
                    const text = div.querySelector('.txt-msg');
                    text.innerHTML = `<p>${text.innerHTML}</p>`;
                }
                for (let blockquote of div.querySelectorAll('blockquote')) {
                    blockquote.classList.add('blockquote-jv');
                }
                for (let blockquote of div.querySelectorAll('.txt-msg blockquote blockquote')) {
                    const nested = document.createElement('div');
                    nested.classList.add('nested-quote-toggle-box');
                    nested.onclick = () => {
                        const visible = blockquote.getAttribute('data-visible');
                        blockquote.setAttribute('data-visible', !!visible ? '' : 1);
                    };
                    blockquote.prepend(nested);
                    blockquote.classList.add('blockquote-jv');
                }
                if (blacklist.test(auteur.pseudo)) {
                    const d = div.querySelector('.txt-msg');
                    d.style.display = 'none';
                    const a = document.createElement('a');
                    a.href = '#';
                    a.innerHTML = 'Voir le message';
                    a.onclick = (e) => {
                        e.preventDefault();
                        d.style.display = '';
                        a.remove();
                    };
                    d.parentNode.appendChild(a);
                }

                let before = this.all().find((element, index, array) => {
                    const next = array[index + 1];
                    return (!next || (id > element.id && id < next.id));
                }) || this.last();

                before.el.parentNode.insertBefore(div, before.el.nextSibling);
            }
        }
    };

    const jvc = {
        request (path) {
            return new Promise((resolve, reject) => {
                const url = `https://www.jeuxvideo.com/${path}`;
                console.log('JVC Ghost request:', url);
                GM_xmlhttpRequest({
                    url: url,
                    onerror: reject,
                    onload (response) {
                        if (response.status !== 200) {
                            throw `topic ${response.status}`;
                        }
                        resolve(new DOMParser().parseFromString(response.responseText, "text/html"));
                    }
                });
            });
        },
        topic (type, id, page, slug) {
            return this.request(`/forums/${type}-51-${id}-${page}-0-1-0-${slug}.htm`).then(doc => {
                return {
                    firstPostId: parseInt(doc.querySelector('.bloc-message-forum').getAttribute('data-id')),
                    doc
                };
            });
        }
    };

    const jvarchive = {
        request (path) {
            return new Promise((resolve, reject) => {
                const url = `https://jvarchive.com/api/${path}`;
                console.log('JVC Ghost request:', url);
                GM_xmlhttpRequest({
                    url: url,
                    onerror: reject,
                    onload (response) {
                        const data = JSON.parse(response.responseText);
                        if (data.error) {
                            throw data;
                        } else {
                            resolve(data);
                        }
                    }
                });
            });
        },
        topic (id, page) {
            return this.request(`topics/${id}/messages?page=${page}`).then((data) => {
                if (!data.messages || !data.messages.length) {
                    throw 'No messages';
                }
                return data;
            })
        },
        async getPostsBetween (topicId, topicPage, firstPostId, lastPostId) {
            let firstFound = false;
            let lastFound = false;

            let p = topicPage;
            const response = await this.topic(topicId, p);

            if (response.nb_messages_enregistre <= 0) {
                return {};
            }

            const lastArchivePage = Math.ceil(response.nb_messages_enregistre / 20);

            const posts = {};
            let first = null;
            let last = null;
            const addPosts = (response) => {
                for (let post of response.messages) {
                    if (first === null || first > post.id) {
                        first = post.id;
                    }
                    if (last === null || last < post.id) {
                        last = post.id;
                    }
                    if (post.id == firstPostId) {
                        firstFound = true;
                    }
                    if (p >= lastArchivePage || (lastPostId !== null && post.id == lastPostId)) {
                        lastFound = true;
                    }
                    if (post.id >= firstPostId && (lastPostId === null || post.id < lastPostId)) {
                        posts[post.id] = post;
                    }
                }
            };

            addPosts(response);

            let nbTry = 20;
            if (first !== null) {
                if (!firstFound) {
                    let direction = 0;
                    if (firstPostId < first) {
                        direction = -1;
                    } else if (firstPostId > last) {
                        direction = 1;
                    }
                    while (true) {
                        if (firstFound) break;
                        nbTry--;
                        if (nbTry <= 0) return posts;
                        p += direction;
                        addPosts(await this.topic(topicId, p));
                    }
                }
                if (!lastFound) {
                    for (p = p + 1; p <= lastArchivePage; p++) {
                        if (lastFound) break;
                        nbTry--;
                        if (nbTry <= 0) return posts;
                        addPosts(await this.topic(topicId, p));
                    }
                }
            }

            return posts;
        }
    };


    try {
        const firstPostId = posts.first().id;
        let lastPostId = null;

        let nextPage;
        if (currentPage < lastPage) {
            nextPage = await jvc.topic(topicType, topicId, currentPage + 1, slug);
            lastPostId = nextPage.firstPostId;
        }

        const archives = await jvarchive.getPostsBetween(topicId, currentPage, firstPostId, lastPostId);

        console.log('JVC Ghost archives:', archives);

        Object.values(archives).forEach((post) => posts.createIfNotExist(post.id, post.auteur, post.date_post, post.texte, nextPage ? nextPage.doc : null));

    } catch (e) {
        console.error('JVC Ghost error:', e);
    }


})();
