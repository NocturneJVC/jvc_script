// ==UserScript==
// @name         Traitement contre le cancer (anti topic "post ou...")
// @version      2.1.1
// @description  N'attrapez plus le cancer !
// @author       NocturneX
// @match        *://www.jeuxvideo.com/forums/*
// @match        *://www.jeuxvideo.com/recherche/forums/**
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @icon         http://image.noelshack.com/fichiers/2016/36/1473604760-picsart-09-03-11-39-59.jpg
// ==/UserScript==

// MÀJ 2.1: le script se souvient maintenant des topics "post ou ...", ce qui fait qu'il est beaucoup plus rapide
// MÀJ 2.0: prend maintenant en compte le sujet (exemple: sujet "cette meuf à la post" avec un message "ou cancer :)" sera détecté comme un topic "post ou ...")

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
			let sujetPost = false;
			if(/pos(t|te|té|tez)(")?$/.test(el.querySelector(".topic-title").title.toLowerCase()))
			{
				sujetPost = true;
			}
			let doc = stringToHtml(r.responseText);
			if(/pos(t|te|té|tez) ou/.test(doc.querySelector(".bloc-message-forum[data-id]").querySelector(".txt-msg").innerHTML.toLowerCase()) || (sujetPost && /^<p>( )?ou/.test(doc.querySelector(".bloc-message-forum[data-id]").querySelector(".txt-msg").innerHTML.toLowerCase())))
			{
				let topic_id = doc.querySelector("*[data-topic-id]").getAttribute("data-topic-id");
				let element = document.querySelector(".conteneur-topic-pagi li[data-id='"+topic_id+"']");
				marquer(element);
				GM_setValue("t"+topicID, sujetPost ? 2 : 1);
			}
			else
			{
				GM_setValue("t"+topicID, 0);
			}
		};
		let topicID = el.getAttribute("data-id");
		let cache = GM_getValue("t"+topicID);
		if(cache === undefined)
		{
			GM_xmlhttpRequest({
				method: "GET",
				url: el.querySelector(".topic-title").href,
				onload: callback
			});
		}
		else
		{
			if(cache == 1 || cache == 2)
			{
				marquer(el);
			}
		}
	});

	function stringToHtml(s)
	{
		return (new DOMParser()).parseFromString(s, "text/html");
	}

	function marquer(element)
	{
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
})();
