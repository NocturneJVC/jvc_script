// ==UserScript==
// @name         JVCDV 2
// @version      2.3
// @description  Voir les profils des comptes bannis !
// @author       NocturneX
// @match        http://www.jeuxvideo.com/profil/*
// @match        https://www.jeuxvideo.com/profil/*
// @grant        GM_xmlhttpRequest
// @require      http://web.archive.org/web/20160330121012/http://crypto-js.googlecode.com/svn/tags/3.0.2/build/rollups/hmac-sha256.js
// @updateURL    https://github.com/NocturneJVC/jvc_script/raw/master/jvcdv2.user.js
// @connect      api.jeuxvideo.com
// ==/UserScript==

(function() {
	'use strict';

	let version_static_jvc;

	document.querySelectorAll("link[rel='stylesheet']").forEach(function (el) {
		if(/static.jvc.gg\/([0-9.]+)\/css\/skin-common.css/.test(el.href))
			version_static_jvc = RegExp.$1;
	});

	let staticl = "//static.jvc.gg/"+version_static_jvc+"/",
		img = "img/profils/badges/64px/",
		badges = [
			{nom:"",src:""},
			{nom:"Ambassadeur Respawn",src:staticl+img+"badge-ambassadeur-respawn.png"},
			{nom:"J'y étais",src:staticl+img+"badge-present-jv.png"},
			{nom:"Rang Bronze",src:staticl+img+"badge-rang-bronze.png"},
			{nom:"Rang Argent",src:staticl+img+"badge-rang-argent.png"},
			{nom:"Rang Or",src:staticl+img+"badge-rang-or.png"},
			{nom:"Rang Rubis",src:staticl+img+"badge-rang-rubis.png"},
			{nom:"Rang Saphir",src:staticl+img+"badge-rang-saphir.png"},
			{nom:"Rang Émeraude",src:staticl+img+"badge-rang-emeraude.png"},
			{nom:"Rang Diamant",src:staticl+img+"badge-rang-diamant.png"}
		];

	// Vérification
	if(document.querySelector(".img-erreur") !== null) return;

	var lien = document.location.href;

	var mode_infos = false;
	if(/^(http|https):\/\/www\.jeuxvideo.com\/profil\/(.+)?mode=infos/.test(lien)) mode_infos = true;
	if(!mode_infos) return;

	var msg_ban = document.querySelector(".alert-row");

	if(msg_ban === null) return;
	if(msg_ban.innerHTML.trim() != "Le pseudo est banni.") return;

    var iconBell = document.querySelector(".icon-bell-off")
    if(!iconBell) {
        if(document.querySelector(".icon-bell-on")) {
            let div = document.createElement("div")
            div.style.textAlign = "center";
            div.style.fontSize = "0.85em";
            div.innerHTML = "[JVCDV] Impossible de récupérer l'ID du pseudo. Désabonnez vous au pseudo pour régler le problème, vous pourrez vous réabonner juste après si vous le souhaitez.";
            document.querySelectorAll(".col-md-12")[1].appendChild(div);
        }
        return;
    }

    var idPseudo = iconBell.getAttribute("data-id");

	if(idPseudo === "") return;
	///////////////////////////

	// Fonction qui permet d'accéder à l'API JVC (fonction d'origne PHP que j'ai traduit en Javascript GM)
	function requeteJvcApi(url, donnees, callback) {
		var ts = new Date(Date.now()).toISOString();
		var methode = donnees === undefined ? "GET" : "POST";
		var signature = "550c04bf5cb2b\n" + ts + "\n" + methode + "\napi.jeuxvideo.com\n/v3/" + url + "\n";
		signature = CryptoJS.HmacSHA256(signature, "d84e9e5f191ea4ffc39c22d11c77dd6c");
		var header = "PartnerKey=550c04bf5cb2b, Signature=" + signature + ", Timestamp=" + ts;
		var req = {
			method: methode,
			headers: {
				'Jvc-Authorization': header,
				'Content-Type': 'application/json'
			},
			url: 'https://api.jeuxvideo.com/v3/' + url,
			onload: function(response) {
				callback(response.responseText);
			}
		};
		if(donnees !== undefined)
		{
			let data = '';
			for (var i in donnees) {
				if (donnees.hasOwnProperty(i)) {
					data += i+"="+donnees[i]+"&";
				}
			}
			req.data = data.substring(0, data.length - 1) + ";";
		}
		GM_xmlhttpRequest(req);
	}
	////////////////////////////////////


	// Fonctions du précédent JVCDV qui ne fonctionne plus
	function afficher(json)
	{
		var html = '<div class="col-md-6">';

		if(json.age !== undefined || json.genre !== undefined || json.pays !== undefined || json.ville !== undefined || json.creationDate !== undefined || json.lastVisitDate !== undefined || json.forum_nb !== undefined || json.comment_nb !== undefined || json.badges !== undefined)
		{
			html += '<div class="bloc-default-profil"><div class="header"><h2>Infos</h2></div><div class="body"><ul class="display-line-lib">';

			if(json.age !== undefined)
				html += '<li><div class="info-lib">Age :</div><div class="info-value">'+json.age+' ans</div></li>';

			if(json.genre !== undefined)
				html += '<li><div class="info-lib">Genre :</div><div class="info-value">'+json.genre+'</div></li>';

			if(json.pays !== undefined && json.ville !== undefined)
				html += '<li><div class="info-lib"> Pays / Ville : </div><div class="info-value"> '+json.pays+' / '+json.ville+' </div></li>';
			else if(json.pays !== undefined && json.ville === undefined)
				html += '<li><div class="info-lib"> Pays : </div><div class="info-value"> '+json.pays+' </div></li>';
			else if(json.pays === undefined && json.ville !== undefined)
				html += '<li><div class="info-lib"> Ville : </div><div class="info-value"> '+json.ville+' </div></li>';

			if(json.creationDate !== undefined)
			{
				var jour;
				if(json.nbJour !== undefined)
					jour = ' ('+json.nbJour+' jours)';
				else
					jour = '';

				html += '<li><div class="info-lib">Membre depuis :</div><div class="info-value">'+json.creationDate+' '+jour+'</div></li>';
			}

			if(json.lastVisitDate !== undefined)
				html += '<li><div class="info-lib">Dernier passage :</div><div class="info-value">'+json.lastVisitDate+'</div></li>';

			if(json.forum_nb !== undefined)
				html += '<li><div class="info-lib">Messages Forums :</div><div class="info-value">'+lisibilite_nombre(json.forum_nb)+' messages</div></li>';

			if(json.comment_nb !== undefined)
				html += '<li><div class="info-lib">Commentaires :</div><div class="info-value">'+lisibilite_nombre(json.comment_nb)+' commentaires</div></li>';

			html += '</ul> </div> </div>';

			if(json.badges !== undefined)
			{
				html += `<div class="bloc-default-profil"><div class="header"><h2>Badges JeuxVideo.com</h2></div><div class="body hauts-faits"><div class="liste-hauts-faits">`;

				for(let i = 0; i < json.badges.length; i++)
				{
					html += '<img src="'+json.badges[i].image+'" alt="'+json.badges[i].titre+'" title="'+json.badges[i].titre+'">';
				}

				html += `</div></div></div>`;
			}
		}

		html += '</div>';
		html += '<div class="col-md-6">';
		if(json.description !== undefined || json.machines !== undefined)
		{
			if(json.description !== undefined)
			{

				html += `<div class="bloc-default-profil"><div class="header"><h2>Description</h2></div><div class="body"><div class="bloc-description-desc txt-enrichi-desc-profil"><p id="goP">`+replaceEmoticons(linkify(json.description.replace(/\n/g, "<br>")))+`</p></div></div></div>`;
			}

			if(json.machines !== undefined)
			{

				html += `<div class="bloc-default-profil"><div class="header"><h2>Profil Gamer</h2></div><div class="body"><ul class="display-bloc-lib"><li><div class="info-lib">Machines :</div><div class="info-value machine-profil">`;

				for(var i = 0; i < json.machines.length; i++)
				{
					html += '<span class="label-machine label-'+label_machine(json.machines[i].nom)+'">'+json.machines[i].nom+'</span> ';
				}

				html += `</div></li><li></li></ul></div></div>`;
			}
		}
		html += `</div>`;



		if(!(json.age !== undefined || json.genre !== undefined || json.pays !== undefined || json.ville !== undefined || json.creationDate !== undefined || json.lastVisitDate !== undefined || json.forum_nb !== undefined || json.comment_nb !== undefined || json.description !== undefined || json.machines !== undefined  || json.badges !== undefined))
		{
			document.querySelector(".cdv_ban_body").innerHTML = '<center>CDV Complètement vide !</center>';
		}
		else
		{
			document.querySelector(".cdv_ban_body").innerHTML = html;
			miniature();
		}
		dispatchEvent(new CustomEvent('jvcdv:done', { 'idPseudo': idPseudo, 'assume' : (json.creationDate !== undefined ? true : false) }));
	}
	function lisibilite_nombre(nbr)
	{
		var nombre = ''+nbr;
		var retour = '';
		var count=0;
		for(var i=nombre.length-1 ; i>=0 ; i--)
		{
			if(count!==0 && count % 3 === 0)
				retour = nombre[i]+'.'+retour ;
			else
				retour = nombre[i]+retour ;
			count++;
		}
		return retour;
	}
	function linkify(inputText) { // http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
		var replacedText, replacePattern1, replacePattern2, replacePattern3;

		//URLs starting with http://, https://, or ftp://
		replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

		//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
		/*replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');*/

		//Change email addresses to mailto:: links.
		replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
		replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

		return replacedText;
	}
	function replaceEmoticons(text) { // http://stackoverflow.com/questions/3055515/replace-a-list-of-emoticons-with-their-images
		var emoticons = {
			':)' : '//image.jeuxvideo.com/smileys_img/1.gif',':snif:' : '//image.jeuxvideo.com/smileys_img/20.gif',':gba:' : '//image.jeuxvideo.com/smileys_img/17.gif',':g)' : '//image.jeuxvideo.com/smileys_img/3.gif',':-)' : '//image.jeuxvideo.com/smileys_img/46.gif',':snif2:' : '//image.jeuxvideo.com/smileys_img/13.gif',':bravo:' : '//image.jeuxvideo.com/smileys_img/69.gif',':d)' : '//image.jeuxvideo.com/smileys_img/4.gif',':hap:' : '//image.jeuxvideo.com/smileys_img/18.gif',':ouch:' : '//image.jeuxvideo.com/smileys_img/22.gif',':pacg:' : '//image.jeuxvideo.com/smileys_img/9.gif',':cd:' : '//image.jeuxvideo.com/smileys_img/5.gif',':-)))' : '//image.jeuxvideo.com/smileys_img/23.gif',':ouch2:' : '//image.jeuxvideo.com/smileys_img/57.gif',':pacd:' : '//image.jeuxvideo.com/smileys_img/10.gif',':cute:' : '//image.jeuxvideo.com/smileys_img/nyu.gif',':content:' : '//image.jeuxvideo.com/smileys_img/24.gif',':p)' : '//image.jeuxvideo.com/smileys_img/7.gif',':-p' : '//image.jeuxvideo.com/smileys_img/31.gif',':noel:' : '//image.jeuxvideo.com/smileys_img/11.gif',':oui:' : '//image.jeuxvideo.com/smileys_img/37.gif',':(' : '//image.jeuxvideo.com/smileys_img/45.gif',':peur:' : '//image.jeuxvideo.com/smileys_img/47.gif',':question:' : '//image.jeuxvideo.com/smileys_img/2.gif',':cool:' : '//image.jeuxvideo.com/smileys_img/26.gif',':-(' : '//image.jeuxvideo.com/smileys_img/14.gif',':coeur:' : '//image.jeuxvideo.com/smileys_img/54.gif',':mort:' : '//image.jeuxvideo.com/smileys_img/21.gif',':rire:' : '//image.jeuxvideo.com/smileys_img/39.gif',':-((' : '//image.jeuxvideo.com/smileys_img/15.gif',':fou:' : '//image.jeuxvideo.com/smileys_img/50.gif',':sleep:' : '//image.jeuxvideo.com/smileys_img/27.gif',':-D' : '//image.jeuxvideo.com/smileys_img/40.gif',':nonnon:' : '//image.jeuxvideo.com/smileys_img/25.gif',':fier:' : '//image.jeuxvideo.com/smileys_img/53.gif',':honte:' : '//image.jeuxvideo.com/smileys_img/30.gif',':rire2:' : '//image.jeuxvideo.com/smileys_img/41.gif',':non2:' : '//image.jeuxvideo.com/smileys_img/33.gif',':sarcastic:' : '//image.jeuxvideo.com/smileys_img/43.gif',':monoeil:' : '//image.jeuxvideo.com/smileys_img/34.gif',':o))' : '//image.jeuxvideo.com/smileys_img/12.gif',':nah:' : '//image.jeuxvideo.com/smileys_img/19.gif',':doute:' : '//image.jeuxvideo.com/smileys_img/28.gif',':rouge:' : '//image.jeuxvideo.com/smileys_img/55.gif',':ok:' : '//image.jeuxvideo.com/smileys_img/36.gif',':non:' : '//image.jeuxvideo.com/smileys_img/35.gif',':malade:' : '//image.jeuxvideo.com/smileys_img/8.gif',':fete:' : '//image.jeuxvideo.com/smileys_img/66.gif',':sournois:' : '//image.jeuxvideo.com/smileys_img/67.gif',':hum:' : '//image.jeuxvideo.com/smileys_img/68.gif',':ange:' : '//image.jeuxvideo.com/smileys_img/60.gif',':diable:' : '//image.jeuxvideo.com/smileys_img/61.gif',':gni:' : '//image.jeuxvideo.com/smileys_img/62.gif',':play:' : '//image.jeuxvideo.com/smileys_img/play.gif',':desole:' : '//image.jeuxvideo.com/smileys_img/65.gif',':spoiler:' : '//image.jeuxvideo.com/smileys_img/63.gif',':merci:' : '//image.jeuxvideo.com/smileys_img/58.gif',':svp:' : '//image.jeuxvideo.com/smileys_img/59.gif',':sors:' : '//image.jeuxvideo.com/smileys_img/56.gif',':salut:' : '//image.jeuxvideo.com/smileys_img/42.gif',':rechercher:' : '//image.jeuxvideo.com/smileys_img/38.gif',':hello:' : '//image.jeuxvideo.com/smileys_img/29.gif',':up:' : '//image.jeuxvideo.com/smileys_img/44.gif',':bye:' : '//image.jeuxvideo.com/smileys_img/48.gif',':gne:' : '//image.jeuxvideo.com/smileys_img/51.gif',':lol:' : '//image.jeuxvideo.com/smileys_img/32.gif',':dpdr:' : '//image.jeuxvideo.com/smileys_img/49.gif',':dehors:' : '//image.jeuxvideo.com/smileys_img/52.gif',':hs:' : '//image.jeuxvideo.com/smileys_img/64.gif',':banzai:' : '//image.jeuxvideo.com/smileys_img/70.gif',':bave:' : '//image.jeuxvideo.com/smileys_img/71.gif',':pf:' : '//image.jeuxvideo.com/smileys_img/pf.gif',':cimer:' : '//image.jeuxvideo.com/smileys_img/cimer.gif',':ddb:' : '//image.jeuxvideo.com/smileys_img/ddb.gif',':pave:' : '//image.jeuxvideo.com/smileys_img/pave.gif',':objection:' : '//image.jeuxvideo.com/smileys_img/objection.gif',':siffle:' : '//image.jeuxvideo.com/smileys_img/siffle.gif'
		}, patterns = [],
			metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g;

		// build a regex pattern for each defined property
		for (var i in emoticons) {
			if (emoticons.hasOwnProperty(i)){ // escape metacharacters
				patterns.push('('+i.replace(metachars, "\\$&")+')');
			}
		}

		// build the regular expression and replace
		return text.replace(new RegExp(patterns.join('|'),'g'), function (match) {
			return typeof emoticons[match] != 'undefined' ?
				'<img src="'+emoticons[match]+'"/>' :
			match;
		});
	}
	function miniature()
	{
		var p = document.getElementById("goP");
		var a = p.getElementsByTagName("a");
		for(var i = 0; i < a.length; i++)
		{
			var image_miniature;
			if(/http:\/\/image\.noelshack\.com\/fichiers\/([0-9]+)\/([0-9]+)\/([0-9]+)-([a-z0-9-]+)\.(png|PNG|gif|GIF|jpg|JPG|jpeg|JPEG)/g.test(a[i].href))
			{
				image_miniature = '//image.noelshack.com/minis/'+RegExp.$1+'/'+RegExp.$2+'/'+RegExp.$3+'-'+RegExp.$4+'.png';
				a[i].innerHTML = '<img class="img-shack" width="68" height="51" src="'+image_miniature+'" alt="'+image_miniature+'">';
			}
			else if(/http:\/\/www\.noelshack\.com\/([0-9]+)-([0-9]+)-([0-9]+)-([a-z0-9-]+)\.(png|PNG|gif|GIF|jpg|JPG|jpeg|JPEG)/g.test(a[i].href))
			{
				image_miniature = '//image.noelshack.com/minis/'+RegExp.$1+'/'+RegExp.$2+'/'+RegExp.$3+'-'+RegExp.$4+'.png';
				a[i].innerHTML = '<img class="img-shack" width="68" height="51" src="'+image_miniature+'" alt="'+image_miniature+'">';
			}
		}

		if(/\[\[youtube:([a-zA-Z0-9-_]+)\]\]/g.test(p.innerHTML))
		{
			p.innerHTML = p.innerHTML.replace('[[youtube:'+RegExp.$1+']]', '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+RegExp.$1+'" frameborder="0" allowfullscreen></iframe>');
		}
	}

	function label_machine(machine)
	{
		if(machine == "Wii U")
			return "wiiu";
		else if(machine == "Xbox One")
			return "one";
		else if(machine == "Xbox 360")
			return "360";
		else if(machine == "Nintendo 3DS")
			return "3ds";
		else if(machine == "Nintendo DS")
			return "ds";
		else if(machine == "Web")
			return "web";
		else if(machine == "Wii")
			return "wii";
		else if(machine == "PlayStation 3")
			return "ps3";
		else if(machine == "PlayStation 4")
			return "ps4";
		else if(machine == "PlayStation 2")
			return "ps2";
		else if(machine == "iOS")
			return "ios";
		else if(machine == "Mac")
			return "mac";
		else if(machine == "Android")
			return "android";
		else if(machine == "PlayStation Vita")
			return "vita";
		else if(machine == "PlayStation Portable")
			return "psp";
		else if(machine == "PC")
			return "pc";
		else
			return "jesaispas";
	}
	//////////////////// Fin des fonctions du précédent script

	// On commence
	document.getElementsByClassName("row")[1].innerHTML += '<div class="cdv_ban_body"></div>';
	document.querySelector(".cdv_ban_body").innerHTML = '<center>Chargement...</center>';


	function dateJVC(date)
	{
		let d = new Date(date);
		let r = d.getDate()+" ";
		let m = d.getMonth()+1;
		switch (m) {
			case 0:
				r += " ";
				break;
			case 1:
				r += "janvier";
				break;
			case 2:
				r += "février";
				break;
			case 3:
				r += "mars";
				break;
			case 4:
				r += "avril";
				break;
			case 5:
				r += "mai";
				break;
			case 6:
				r += "juin";
				break;
			case 7:
				r += "juillet";
				break;
			case 8:
				r += "août";
				break;
			case 9:
				r += "septembre";
				break;
			case 10:
				r += "octobre";
				break;
			case 11:
				r += "novembre";
				break;
			case 12:
				r += "décembre";
		}
		r += " " + d.getUTCFullYear();
		return r;
	}

	function machine(id)
	{
		let r = "";
		switch (id) {
			case 10:
				r = "PC";
				break;

			case 20:
				r = "PlayStation 4";
				break;

			case 30:
				r = "Xbox One";
				break;

			case 40:
				r = "Wii U";
				break;

			case 50:
				r = "PlayStation 3";
				break;

			case 60:
				r = "Xbox 360";
				break;

			case 70:
				r = "Nintendo 3DS";
				break;

			case 80:
				r = "PlayStation Vita";
				break;

			case 380:
				r = "Nintendo DS";
				break;

			case 460:
				r = "Wii";
				break;

			case 177539:
				r = "Nintendo Switch";
				break;

			case 280:
				r = "Mac";
				break;

			case 90:
				r = "iOS";
				break;

			case 100:
				r = "Android";
				break;

			case 110:
				r = "Web";
				break;

			case 120:
				r = "3DO";
				break;

			case 130:
				r = "Amiga";
				break;

			case 140:
				r = "Amstrad CPC";
				break;

			case 150:
				r = "Apple II";
				break;

			case 160:
				r = "Atari ST";
				break;

			case 170:
				r = "Atari 2600";
				break;

			case 570:
				r = "Atari 5200";
				break;

			case 500:
				r = "Atari 7800";
				break;

			case 670:
				r = "Box Free";
				break;

			case 640:
				r = "Box Orange";
				break;

			case 650:
				r = "Box SFR";
				break;

			case 660:
				r = "Box Bouygues";
				break;

			case 480:
				r = "CD-i";
				break;

			case 530:
				r = "Colecovision";
				break;

			case 180:
				r = "Commodore 64";
				break;

			case 190:
				r = "Dreamcast";
				break;

			case 490:
				r = "Famicom Disk System";
				break;

			case 550:
				r = "Game &amp; Watch";
				break;

			case 200:
				r = "Gameboy";
				break;

			case 210:
				r = "Gameboy Advance";
				break;

			case 560:
				r = "Gameboy Color";
				break;

			case 220:
				r = "Gamecube";
				break;

			case 230:
				r = "Game Gear";
				break;

			case 240:
				r = "Gizmondo";
				break;

			case 250:
				r = "GP32";
				break;

			case 510:
				r = "GX-4000";
				break;

			case 540:
				r = "Intellivision";
				break;

			case 260:
				r = "Jaguar";
				break;

			case 270:
				r = "Lynx";
				break;

			case 290:
				r = "Master System";
				break;

			case 300:
				r = "Megadrive";
				break;

			case 310:
				r = "Megadrive 32X";
				break;

			case 320:
				r = "Mega-CD";
				break;

			case 600:
				r = "MSX";
				break;

			case 330:
				r = "N-Gage";
				break;

			case 340:
				r = "Neo Geo";
				break;

			case 350:
				r = "Neo Geo Pocket";
				break;

			case 360:
				r = "Nes";
				break;

			case 370:
				r = "Nintendo 64";
				break;

			case 620:
				r = "Odyssey";
				break;

			case 390:
				r = "PlayStation";
				break;

			case 400:
				r = "PlayStation 2";
				break;

			case 410:
				r = "PlayStation Portable";
				break;

			case 420:
				r = "Saturn";
				break;

			case 430:
				r = "Super Nintendo";
				break;

			case 440:
				r = "PC Engine";
				break;

			case 520:
				r = "Vectrex";
				break;

			case 630:
				r = "Videopac";
				break;

			case 450:
				r = "Virtual Boy";
				break;

			case 580:
				r = "WonderSwan";
				break;

			case 590:
				r = "WonderSwan Color";
				break;

			case 470:
				r = "Xbox";
				break;

			case 610:
				r = "ZX Spectrum";
				break;

			case 171740:
				r = "Arcade";
				break;

			case 172235:
				r = "New Nintendo 3DS";
				break;

			case 173455:
				r = "OUYA";
				break;

			case 175794:
				r = "Linux";
				break;

			case 680:
				r = "Shield TV";
				break;
		}
		return r;
	}

	requeteJvcApi("accounts/"+idPseudo.trim()+"/profile", undefined, function (r) {
		let json = JSON.parse(r);
		console.log(json);
		let a = {};
		if(json.info)
		{
			a.comment_nb = json.info.commentCount;
			a.forum_nb = json.info.forumMessageCount;
			a.genre = json.info.gender;
			a.lastVisitDate = json.info.lastVisitDate ? dateJVC(json.info.lastVisitDate) : undefined;
			a.pays = json.info.country;
			a.ville = json.info.city;
			a.nbJour = json.info.creationSince;
			a.creationDate = json.info.creationDate ? dateJVC(json.info.creationDate) : undefined;
			a.age = json.info.age;
		}
		if(json.description)
		{
			a.description = json.description.raw;
		}
		if(json.machines)
		{
			a.machines = [];
			json.machines.forEach(function (el) {
				a.machines.push({
					nom : machine(el)
				});
			});
		}
		if(json.badges)
		{
			a.badges = [];
			json.badges.forEach(function(el){
                if(badges[el]) {
                    a.badges.push({
                        image : badges[el].src,
                        titre : badges[el].nom
                    });
                }
			});
		}
		afficher(a);
	});
})();
