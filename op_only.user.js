// ==UserScript==
// @name         OP only
// @version      1
// @description  Voir seulement les posts de l'auteur
// @author       NocturneX
// @match        http://www.jeuxvideo.com/forums/42-*
// @match        http://www.jeuxvideo.com/forums/1-*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @icon         http://image.noelshack.com/fichiers/2017/25/7/1498400760-puma-prepa-gif.gif
// @require      https://raw.githubusercontent.com/NocturneJVC/jvc_script/master/jvcapi.js
// ==/UserScript==

(function() {
	'use strict';
	let groupe = document.querySelectorAll(".group-two");
	let page_p = 0;
	let page_last = 0;
	let topicInfo = JVCAPI.topic.getUrlInfos();
	let auteur = "";
	let nb = 0;
	function getMessages(){
		desactiveTopicLive();
		let current_page = document.querySelector(".page-active");
		current_page = current_page !== null ? current_page.innerHTML.trim() : 1;
		if(page_p === 0)
		{
			document.querySelector(".conteneur-messages-pagi").innerHTML = `<div id="op-progress">Récupération des messages de l'auteur page <span>1</span></div><div id="zone-post"></div>`;
			page_p = 1;
		}
		if(page_p > page_last)
		{
			document.querySelector("#op-progress").innerHTML = "Récupération des messages de l'auteur terminé (nb: "+nb+").";
			JVCAREtoLINK();
			return;
		}
		let info = topicInfo;
		info.page = page_p;
		document.querySelector("#op-progress > span").innerHTML = page_p;
		JVCAPI.topic.getMessages(info, function (o) {
			if(o.error)
			{
				document.querySelector("#op-progress").innerHTML = o.error;
				return;
			}
			if(page_p == 1)
			{
				auteur = o.posts[0].pseudo.toLowerCase();
			}
			o.posts.forEach(function (post) {
				if(post.pseudo.toLowerCase() == auteur) {
					document.querySelector("#zone-post").innerHTML += postHTML(post);
					nb++;
				}
			});
			page_p++;
			getMessages();
		});
	}
	if(groupe !== null)
	{
		document.querySelector(".bloc-liste-num-page").querySelectorAll(".lien-jv").forEach(function (o) {
			let r = o.innerHTML.trim();
			if(r !== "»" && r !== "«")
				page_last = parseInt(r);
		});
		page_last = page_last === 0 ? 1 : page_last;
		groupe.forEach(function (g) {
			let bt = document.createElement("a");
			bt.innerHTML = `<!--
--><span class="btn btn-actu-new-list-forum"><!--
-->Auteur seulement<!--
--></span><!--
-->`;
			bt.onclick = function () {
				getMessages();
			};
			g.appendChild(bt);
		});
		GM_addStyle(`@import url('https://fonts.googleapis.com/css?family=ABeeZee');#op-progress{font-family: 'ABeeZee', sans-serif;text-align: center; font-size: 1.2em;}`);

	}


	function postHTML(post) {
		return `
<div class="bloc-message-forum " data-id="`+post.id+`">
<div class="conteneur-message">
<div class="bloc-avatar-msg">
<div class="back-img-msg">
<div>
<a href="http://www.jeuxvideo.com/profil/`+post.pseudo.toLowerCase()+`?mode=infos" target="_blank" class="xXx " sl-processed="1">
<img src="`+post.avatar+`" class="user-avatar-msg" alt="Avatar de `+post.pseudo+`">
</a>
</div>
</div>
</div>
<div class="inner-head-content">
<div class="bloc-header">
<a href="http://www.jeuxvideo.com/profil/`+post.pseudo.toLowerCase()+`?mode=infos" target="_blank" class="xXx bloc-pseudo-msg text-user" data-contextmenu-is-done-for-renickname="true" data-real-nickname="BlancMuslimLIVE" sl-processed="1">
`+post.pseudo+`
</a>
<div class="bloc-mp-pseudo">
<a href="//www.jeuxvideo.com/messages-prives/nouveau.php?all_dest=`+post.pseudo+`" target="_blank" class="xXx " sl-processed="1">
<span class="picto-msg-lettre" title="Envoyer un message privé"><span>MP</span></span>
</a>
</div>
<div class="bloc-options-msg"> </div>                    <div class="bloc-date-msg">
<a href="/`+post.pseudo.toLowerCase()+`/forums/message/`+post.id+`" target="_blank" class="xXx lien-jv" sl-processed="1">`+post.date+`</a> / Page original: `+post.page+`
</div>
</div>
<div class="bloc-contenu"><div class="txt-msg  text-enrichi-forum ">`+post.message+`</div>
</div>
</div>
`;
	}
	function JVCAREtoLINK()
	{
		document.querySelectorAll(".bloc-contenu").forEach(function (a) {
			a.querySelectorAll(".JvCare").forEach(function(o){
				o.innerHTML = `<a href="${o.title ? o.title : o.innerHTML}" target="_blank">${o.innerHTML}</a>`;
			});
		});
	}
	let desactiveTopicLiveFait = false;
	function desactiveTopicLive() // Pour éviter les problèmes avec TopicLive
	{
		if(desactiveTopicLiveFait) return;
		let nouveauxMessages = [];
		addEventListener("topiclive:newmessage", function(event){
			nouveauxMessages.push(event.detail.id);
		});
		let en = [];
		addEventListener("topiclive:doneprocessing", function(){
			nouveauxMessages.forEach(function (element, index, array){
				document.querySelector("div[data-id='"+element+"']").remove();
				console.log("[OP only] Message "+element+" supprimé");
			});
			nouveauxMessages = [];
		});
		desactiveTopicLiveFait = true;
	}
})();
