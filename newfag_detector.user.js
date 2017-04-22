// ==UserScript==
// @name         Newfag detecor
// @version      1.0
// @description  Affiche l'ancienneté des pseudos qui le cachent
// @author       NocturneX
// @match        http://www.jeuxvideo.com/profil/*?mode=infos
// @match        https://www.jeuxvideo.com/profil/*?mode=infos
// @grant        GM_xmlhttpRequest
// @require      http://web.archive.org/web/20160330121012/http://crypto-js.googlecode.com/svn/tags/3.0.2/build/rollups/hmac-sha256.js
// @icon         http://image.noelshack.com/fichiers/2017/15/1491900495-7.png
// @connect      api.jeuxvideo.com
// ==/UserScript==

(function() {
	const PSEUDO_AVANT = 0, PSEUDO_APRES = 1;
	// Récupère l'ID du pseudo
	let idPseudo = document.querySelector(".picto-attention").getAttribute("data-selector");
	if(/\/profil\/gta\.php\?id=([0-9]+)&/g.test(idPseudo))
		idPseudo = RegExp.$1;
	else
		return;
	idPseudo = parseInt(idPseudo);
	if(idPseudo < 3000000)
		return; // Pseudo trop vieux...
	///////////////////////////

	// Vérifie si le pseudo est banni
	let msg_ban = document.querySelector(".alert-row");
	if(msg_ban !== null){
		if(msg_ban.innerHTML.trim() === "Le pseudo est banni.")
		{
			// Si banni, on lance que si le scipt JVCDV est présent
			addEventListener("jvcdv:done", function(r){
				if(r.detail.assume === false)
					main();
			});
		}
		else
			main();
	}
	else
		main();
	//////////////////////////////////

	function main() {
	// Vérifie si le pseudo assume ou pas son nombre de jour...
	let assume = false;
	document.querySelectorAll(".info-lib").forEach(function (el) {
		if(el.innerHTML.trim() == "Membre depuis :")
			assume = true;
	});
	if(assume)
		return; // Si il assume, on arrête le script.
	/////////////////////////////////////////////////////////////

	// Si il n'assume pas, on peut continuer :
	let avant = 1, après = 1;
	let dateAvant = "", dateAprès = "", nbAvant = 0, nbAprès = 0, déjàTrouver = false;
	function chercher(avantOuAprès)
	{
		let id = idPseudo;
		if(avantOuAprès == PSEUDO_AVANT) {
			id = id-avant;
			avant++;
		}
		else if(avantOuAprès == PSEUDO_APRES) {
			id = id+après;
			après++;
		}
		else return;
		requeteJvcApi("accounts/"+id+"/profile", undefined, function (r) {
			let json = JSON.parse(r);
			if(json.info !== undefined && json.info.creationDate !== undefined)
			{
				if(avantOuAprès == PSEUDO_AVANT) {
					dateAvant = json.info.creationDate;
					nbAvant = json.info.creationSince;
					console.log('%c[NEWFAG DETECTOR] [PSEUDO CREE AVANT] %c('+id+") " + json.alias + " " + dateJVC(json.info.creationDate) + " ("+json.info.creationSince+" jours)", 'background: #1d1d1d; color: #ff002d; font-size: 1.3em;', 'font-size: 1.3em; background: #1d1d1d; color: white');
				}
				else if(avantOuAprès == PSEUDO_APRES) {
					dateAprès = json.info.creationDate;
					nbAprès = json.info.creationSince;
					console.log('%c[NEWFAG DETECTOR] [PSEUDO CREE APRES] %c('+id+") " + json.alias + " " + dateJVC(json.info.creationDate) + " ("+json.info.creationSince+" jours)", 'background: #1d1d1d; color: #ff002d; font-size: 1.3em;', 'font-size: 1.3em; background: #1d1d1d; color: white');
				}
				if(dateAvant !== "" && dateAprès !== "" && !déjàTrouver)
					trouvé();
			}
			else
			{
				chercher(avantOuAprès);
			}
		});
	}

	chercher(PSEUDO_AVANT);
	chercher(PSEUDO_APRES);

	function trouvé() {
		déjàTrouver = true;
		let depuis = "";
		//console.log(dateJVC(dateAvant), nbAvant, dateJVC(dateAprès), nbAprès);
		if(dateJVC(dateAvant) == dateJVC(dateAprès))
		{
			depuis = dateJVC(dateAvant) + " ("+nbAvant+" jours)";
		}
		else
		{
			let timeAv = new Date(dateAvant), timeAp = new Date(dateAprès);
			let environ = moyenne(timeAv.getTime(), timeAp.getTime());
			let dateEnviron = new Date(environ);
			depuis = `<span title="environ">~</span>` + dateJVC(dateEnviron.toISOString()) + " ("+(nbAvant != nbAprès ? ("<span title=\"environ\">~</span>"+moyenne(nbAvant, nbAprès)) : nbAvant)+" jours)";
		}
		document.querySelectorAll(".col-md-6")[0].innerHTML += `
<div class="bloc-default-profil">
<div class="header">
<h2>Assume ton ancienneté !</h2>
</div>
<div class="body">
<ul class="display-line-lib">
<li><div class="info-lib">Membre depuis :</div><div class="info-value">${depuis}</div></li>
</ul>
</div>
</div>
`;
	}

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

	// Date JVC
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
	////////////

	function moyenne(nb1, nb2)
	{
		return Math.round((nb1+nb2)/2);
	}
}
})();
