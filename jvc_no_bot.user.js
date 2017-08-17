// ==UserScript==
// @name         JVC_NO_BOT
// @version      1.1
// @description  Efface les messages et topics des bots
// @author       NocturneX
// @match        *://www.jeuxvideo.com/forums/42-*
// @match        *://www.jeuxvideo.com/forums/0-*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      nocturnex.alwaysdata.net
// @icon         http://img07.deviantart.net/1e74/i/2015/210/4/4/no_killer_robots_by_topher147-d93d3ut.png
// ==/UserScript==

(function() {
    'use strict';
	var liste_bot = {
		get: function (callback) {
			if(this.cache.time.get() === undefined || ((Date.now() / 1000) - this.cache.time.get()) > 60)
			{
				let self = this;
				GM_xmlhttpRequest({
					method: "GET",
					url: "http://nocturnex.alwaysdata.net/anti-bot/",
					onload: function(response) {
						if(response.responseText !== "hum")
						{
							let json = JSON.parse(response.responseText);
							self.cache.liste.set(json);
							self.cache.time.set((Date.now() / 1000));
							callback(json);
						}
					}
				});
			}
			else
			{
				callback(this.cache.liste.get());
			}
		},
		cache: {
			liste: {
				get: function () {
					return JSON.parse(GM_getValue("cache_liste"));
				},
				set: function (t) {
					GM_setValue("cache_liste", JSON.stringify(t));
				}
			},
			time: {
				get: function () {
					return GM_getValue("cache_time");
				},
				set: function (t) {
					GM_setValue("cache_time", t);
				}
			}
		}
	};

    if(/^http(s)?:\/\/www.jeuxvideo.com\/forums\/42-/.test(document.location.href))
	{
		let pseudos = [], IDs = [], affiche = false, panel = {
			init: function () {
				let span = document.createElement("span");
				span.innerHTML = `
<br>
<h4 class="titre-info-fofo">JVC_NO_BOT</h4>
<div id="JVC_NO_BOT_info"></div>
`;
				document.querySelector(".bloc-info-forum").appendChild(span);
			},
			update: function () {
				if(IDs.length === 0)
				{
					document.querySelector("#JVC_NO_BOT_info").innerHTML = "Aucun bot détecté, topic clean.";
				}
				else
				{
					let red = function (text){return`<span style="color:red">`+text+`</span>`;};
					document.querySelector("#JVC_NO_BOT_info").innerHTML = (pseudos.length > 1 ? red(pseudos.length) + " bots ont été détecté " : red(1) + " bot a été détecté" ) + " (" + pseudos.join(", ") + ").<br>" +
						(IDs.length > 1 ? red(IDs.length) + " messages ont été effacé." : red(1) + " message a été effacé.") +
						'<br><a style="cursor: pointer" class="JVC_NO_BOT_affiche">Afficher les messages des bots</a>';
					document.querySelector(".JVC_NO_BOT_affiche").onclick = function () {
						affiche = true;
						document.querySelectorAll(".bloc-message-forum").forEach(function (d) {
							if(IDs.indexOf(d.dataset.id) > -1)
							{
								d.style.display = "";
							}
						});
						this.style.display = "none";
						return false;
					};
				}
			}
		};
		liste_bot.get(function (json) {
			document.querySelectorAll(".bloc-pseudo-msg").forEach(function (div) {
				let pseudo = div.textContent.trim();
				if(json[pseudo.toLowerCase()] !== undefined)
				{
					div = div.parentNode.parentNode.parentNode.parentNode;
					div.style.display = "none";
					IDs.push(div.dataset.id);
					if(pseudos.indexOf(pseudo) == -1)
					{
						pseudos.push(pseudo);
					}
				}
			});
			panel.init();
			panel.update();
			let nouveauxMessages = [];
			addEventListener("topiclive:newmessage", function(event){
				nouveauxMessages.push(event.detail.id);
			});
			addEventListener("topiclive:doneprocessing", function(){
				nouveauxMessages.forEach(function (element, index, array){
					let div = document.querySelector("div[data-id='"+element+"']"), pseudo = div.querySelector(".bloc-pseudo-msg").textContent.trim();
					if(json[pseudo.toLowerCase()] !== undefined)
					{
						div.style.display = "none";
						IDs.push(div.dataset.id);
						if(pseudos.indexOf(pseudo) == -1)
						{
							pseudos.push(pseudo);
						}
						panel.update();
					}
				});
				nouveauxMessages = [];
			});
		});
	}
	else if(/^http(s)?:\/\/www.jeuxvideo.com\/forums\/0-/.test(document.location.href))
	{
		let IDs = [],
			red = function (text){return`<span style="color:red">`+text+`</span>`;},
			option_afficher = {
				get: function () {
					return GM_getValue("option_afficher") !== undefined ? GM_getValue("option_afficher") : 0;
				},
				set: function (b) {
					GM_setValue("option_afficher", b);
				}
			};
		liste_bot.get(function (json) {
			document.querySelectorAll(".topic-author").forEach(function (div) {
				if(json[div.textContent.trim().toLowerCase()] !== undefined)
				{
					if(option_afficher.get() == 1)
					{
						div.parentNode.style.display = "none";
					}
					IDs.push(div.parentNode.dataset.id);
					let title = div.parentNode.querySelector(".topic-subject").querySelector("a");
					title.innerHTML = `<span style="color:red">[BOT] </span>` + title.innerHTML;
				}
			});
			let span = document.createElement("span");
			span.innerHTML = `
<br>
<h4 class="titre-info-fofo">JVC_NO_BOT</h4>
<div id="JVC_NO_BOT_info">` + (IDs.length === 0 ? "Aucun bot détecté." : red(IDs.length) + " topics détectés.") +`
<br>
<select id="jvc_no_bot_select" style="border: blue; background-color: transparent">
<option value="0" ` + (option_afficher.get() == "0" ? "selected" : "") + ` style="background-color: #2a2a2a">Marquer les topics des bots avec des balises [BOT]</option>
<option value="1" ` + (option_afficher.get() == "1" ? "selected" : "") + ` style="background-color: #2a2a2a">Masquer les topics des bots</option>
</select>


</div>
`;
			span.querySelector("#jvc_no_bot_select").onchange = function () {
				option_afficher.set(this.value);
				let option = this.value;
				IDs.forEach(function (id) {
					if(option == "0")
					{
						document.querySelector("*[data-id='" + id + "']").style.display = "";
					}
					else
					{
						document.querySelector("*[data-id='" + id + "']").style.display = "none";
					}
				});
			};
			document.querySelector(".bloc-info-forum").appendChild(span);
		});
	}
})();
