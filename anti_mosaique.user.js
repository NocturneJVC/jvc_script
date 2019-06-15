// ==UserScript==
// @name         Anti-Mosaïque
// @version      1.1
// @description  Masque les mosaïques générés avec http://nocturnex.alwaysdata.net/mosajax/
// @author       NocturneX
// @match        *://www.jeuxvideo.com/forums/1-*
// @match        *://www.jeuxvideo.com/forums/42-*
// ==/UserScript==

(function () {
    const NB_MINIATURE_MINIMUM = 3 // nombre de miniature minimum pour qu'une mosaique soit masquée

    let mosaiques = {}
    for (let img of document.querySelectorAll(".img-shack")) {
        if (/^https?:\/\/image.noelshack\.com\/[0-9a-z\/]+\/[0-9]+-([0-9]{1,2})-([a-z0-9]{8})\.(png|gif)$/.test(img.src)) {
            if (mosaiques[RegExp.$2]) {
                if (mosaiques[RegExp.$2].indexOf(img.src) == -1) {
                    mosaiques[RegExp.$2].push(img.src)
                }
            } else {
                mosaiques[RegExp.$2] = [img.src]
            }
        }
    }
    for (let mosaique_id of Object.keys(mosaiques)) {
        if (mosaiques[mosaique_id].length >= NB_MINIATURE_MINIMUM) {
            for (let src of mosaiques[mosaique_id]) {
                for (let img of document.querySelectorAll("img[src='" + src + "']")) {
                    if (/-1-[a-z0-9]{8}\.(png|gif)$/.test(src)) {
                        img.parentElement.outerHTML = `<span style="color:purple">Mosaïque #${mosaique_id} masquée</span>`
                    } else {
                        img.parentElement.remove()
                    }
                }
            }
        }
    }
})()
