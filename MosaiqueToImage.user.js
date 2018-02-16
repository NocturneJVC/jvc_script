// ==UserScript==
// @name         JVC Mosaïque to Image
// @version      1
// @description  Transforme les mosaïques en image
// @author       NocturneX
// @match        http://www.jeuxvideo.com/forums/42-*
// @match        https://www.jeuxvideo.com/forums/42-*
// @grant        GM_addStyle
// @icon         http://image.jeuxvideo.com/smileys_img/26.gif
// ==/UserScript==

(function() {
    'use strict';
	GM_addStyle('.img-mosa{margin-right: -0.3em;margin-bottom: -0.53em;}');
	document.querySelectorAll(".text-enrichi-forum img.img-shack").forEach(function (img) {
		if(/^http(s)?:\/\/image\.noelshack\.com\/fichiers\/([0-9]{4})\/([0-9]+)\/([0-9]+)\/([0-9]+)-([0-9]+)-([a-z0-9]{8})\.(png|gif|jpg|jpeg)$/.test(img.alt)||
		   /^http(s)?:\/\/image\.noelshack\.com\/fichiers\/([0-9]{4})\/([0-9]+)\/([0-9]+)-([0-9]+)-([a-z0-9]{8})\.(png|gif|jpg|jpeg)/.test(img.alt)||
		   /^http(s)?:\/\/www\.noelshack\.com\/([0-9]{4})-([0-9]+)-([0-9]+)-([0-9]+)-([0-9a-z]{1})\.(png|gif|jpg|jpeg)/.test(img.alt)
		  )
			img.classList.add("img-mosa");
	});
})();
