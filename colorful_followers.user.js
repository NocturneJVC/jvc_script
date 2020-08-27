// ==UserScript==
// @name         JVC Colorful Followers
// @version      1.1
// @description  Colore les pseudos qui vous suivent et que vous suivez
// @author       NocturneX
// @icon         https://image.noelshack.com/fichiers/2019/28/6/1563019174-1406836919770.gif
// @match        *://www.jeuxvideo.com/forums/0-*
// @match        *://www.jeuxvideo.com/forums/1-*
// @match        *://www.jeuxvideo.com/forums/42-*
// @match        *://www.jeuxvideo.com/recherche/forums/0-*
// @grant        GM_addStyle
// ==/UserScript==

(async function() {
    'use strict';

    const useDarkJVC = window.getComputedStyle(document.querySelector(".jv-header-top"), null).getPropertyValue("background-color") == "rgb(41, 41, 41)"

    if(!useDarkJVC) {

        // Style pour JVC sans le thème DarkJVC
        GM_addStyle(
            `.colorful-abonne { color: #0b25e1 !important; }` +
            `.colorful-abonnement { color: #e97c0b !important; }` +
            `.colorful-abonne-et-abonnement { color: #293fe1 !important; text-shadow: 0px 0px 4px #01ffad; padding: 0 2px; }`
        )

    } else {

        // Style pour JVC avec le thème DarkJVC
        GM_addStyle(
            `.colorful-abonne { color: #71b0dc !important; }` +
            `.colorful-abonnement { color: #c68139 !important; }` +
            `.colorful-abonne-et-abonnement { color: #e7e7e7 !important; text-shadow: 0px 0px 4px #01ffad; padding: 0 2px; }`
        )

    }


    const currentPseudo = document.querySelector(".account-pseudo").textContent.trim().toLowerCase()

    if(currentPseudo == "mon compte") {
        return
    }

    const pageType = function () {
        if(/jeuxvideo\.com\/forums\/(42|1)-/.test(document.location.href)) {
            return 1
        } else if(/jeuxvideo\.com\/forums\/0-/.test(document.location.href) || /jeuxvideo\.com\/recherche\/forums\/0-/.test(document.location.href)) {
            return 2
        }
        return 0
    }()

    const getAbonnes = async function (pseudo = currentPseudo) {
        const pseudoList = []
        let page = 1
        let nextPageExist = false
        do {
            const response = await fetch(`https://www.jeuxvideo.com/profil/${pseudo}?mode=abonne&page=${page}`)
            const html = (new DOMParser()).parseFromString(await response.text(), "text/html")
            nextPageExist = !!html.querySelector(".pagi-fin-actif")
            html.querySelectorAll(".fiche-abonne .pseudo a:first-child").forEach(a => pseudoList.push(a.textContent.trim().toLowerCase()))
            page++
        } while(nextPageExist)
        return pseudoList
    }

    const getAbonnements = async function (pseudo = currentPseudo) {
        const response = await fetch(`https://www.jeuxvideo.com/profil/${pseudo}?mode=abonnements`)
        const html = (new DOMParser()).parseFromString(await response.text(), "text/html")
        const pseudoList = []
        html.querySelectorAll(".back-abo-perso a").forEach(a => pseudoList.push(a.textContent.trim().toLowerCase()))
        return pseudoList
    }

    const getPseudoInPage = async function () {
        const pseudoList = []
        switch(pageType) {
            case 1: document.querySelectorAll(".bloc-message-forum .user-avatar-msg").forEach(img => pseudoList.push(img.alt.toLowerCase())); break
            case 2: document.querySelectorAll(".topic-list a.topic-author").forEach(a => pseudoList.push(a.textContent.trim().toLowerCase())); break
        }
        return pseudoList
    }

    const abonnes = await getAbonnes()
    const abonnements = await getAbonnements()
    const pseudoList = {}
    for(let pseudo of await getPseudoInPage()) {
        if(!pseudoList.hasOwnProperty(pseudo)) {
            pseudoList[pseudo] = 0b00
            if(abonnes.indexOf(pseudo) > -1) {
                pseudoList[pseudo] += 0b01
            }
            if(abonnements.indexOf(pseudo) > -1) {
                pseudoList[pseudo] += 0b10
            }
        }
    }

    for(let pseudo in pseudoList) {
        const value = pseudoList[pseudo]
        let className = null
        switch(value) {
            case 0b01: className = "colorful-abonne"; break
            case 0b10: className = "colorful-abonnement"; break
            case 0b11: className = "colorful-abonne-et-abonnement"; break
        }

        document
            .querySelectorAll(`a.text-user[href='http://www.jeuxvideo.com/profil/${pseudo}?mode=infos'], a.text-user[href='https://www.jeuxvideo.com/profil/${pseudo}?mode=infos']`)
            .forEach(a => className ? a.classList.add(className) : null)
    }

})();
