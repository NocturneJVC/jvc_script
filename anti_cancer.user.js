// ==UserScript==
// @name         Traitement contre le cancer (anti topic "post ou...")
// @version      1
// @description  N'attrapez plus le cancer !
// @author       NocturneX
// @match        http://www.jeuxvideo.com/forums/*
// @match        http://www.jeuxvideo.com/recherche/forums/*
// @grant        GM_xmlhttpRequest
// @icon         http://image.noelshack.com/fichiers/2016/36/1473604760-picsart-09-03-11-39-59.jpg
// ==/UserScript==

(function() {
	'use strict';
	const OUI = 1, oui = 1, NON = 0, non = 0;




	// Masquer les topics post ou XXX ?
	// Si OUI, les topics post ou XXX sont effacés de la liste des sujets
	// Si NON, les topics post ou XXX sont marqués en rouge dans la liste des sujets
	// OUI ou NON ? |||
	//              vvv
	const MASQUER = NON;
	///////////////////////////////////




	if(document.querySelector(".conteneur-topic-pagi li[data-id]") === null)
		return;
	document.querySelectorAll(".conteneur-topic-pagi li[data-id]").forEach(function (el) {
		let callback = function (r) {
			let doc = stringToHtml(r.responseText);
			if(/post ou/.test(doc.querySelector(".bloc-message-forum[data-id]").querySelector(".txt-msg").innerHTML.toLowerCase()))
			{
				let topic_id = doc.querySelector("*[data-topic-id]").getAttribute("data-topic-id");
				let element = document.querySelector(".conteneur-topic-pagi li[data-id='"+topic_id+"']");
				if(MASQUER === NON)
				{
					element = element.querySelector(".topic-title");
					element.innerHTML = `<span style="color: red">[POST OU]</span> ` + element.innerHTML.trim();
				}
				else
				{
					element.remove();
				}
			}
			console.log("ok "+el.dataset.id);
		};
		GM_xmlhttpRequest({
			method: "GET",
			url: el.querySelector(".topic-title").href,
			onload: callback
		});
	});
	function stringToHtml(s)
	{
		return (new DOMParser()).parseFromString(s, "text/html");
	}
})();