// ==UserScript==
// @name         RisiCode
// @version      1.1
// @description  Utilisez vos stickers plus rapidement !
// @author       NocturneX
// @match        http://www.jeuxvideo.com/forums/*
// @icon         http://image.noelshack.com/fichiers/2017/48/7/1512337389-renardban17.png
// @downloadURL  https://github.com/NocturneJVC/jvc_script/raw/master/risicode.user.js
// @updateURL    https://github.com/NocturneJVC/jvc_script/raw/master/risicode.meta.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      risibank.fr
// ==/UserScript==

// Le script n'est pas compatible avec Greasemonkey. Utilisez Tampermonkey pour installer vos scripts.
// Pour effectuer les recherches de sticker, RisiCode utilise le site risibank.fr .
// Pour accélérer l'affiche des stickers de la partie "Recherche Risibank", RisiCode utilise les images du site jvsticker.com de Alexandre.

new class RisiCode {

	constructor () {
		this.pushStickersWebedia();
		this.pushStickersPerso();
		this.listener();
		this.textareaBar();
	}

	// Partie "textarea":

	getTextarea () {
		if(this.textarea !== undefined) {
			return this.textarea;
		}
		else {
			this.textarea = document.getElementById("message_topic");
			return this.textarea;
		}
	}

	listener () {
		this.getTextarea().addEventListener("keyup", () => this.onKeyUp());
	}

	onKeyUp () {
		if(this.stickers !== undefined) {
			this.replaceByArray(this.stickers);
        }

		if(this.stickersPerso !== undefined) {
			this.replaceByArray(this.stickersPerso);
        }

		this.checkRechercheRisibank();
        this.checkRechercheRisibankById();
	}

	checkRechercheRisibank () {
		let value = this.getTextarea().value;
		let regex = ":(r|recherche|risibank) ([A-zÀ-ú0-9 ]{1,100}):";
		let result = value.match(regex);
		if(result !== null) {
			this.rechercheRisibank(result[2], (json) => this.rechercheRisibankCallback(json, result[0]));
		}
	}

    checkRechercheRisibankById () {
    	let value = this.getTextarea().value;
        let regex = ":(rid) ([0-9]{1,8}):";
        let result = value.match(regex);
        if(result !== null) {
			this.rechercheRisibankById(result[2], (url) => {
                this.replace(result[0], url);
            });
		}
    }

	rechercheRisibankCallback (json, replace) {
		if(json.error) {
			this.replace(replace, "[Erreur...]");
		}
		else if(json.stickers[0] === undefined) {
			this.replace(replace, "[Aucun résultat sur Risibank]");
		}
		else {
			this.replace(replace, "http://image.noelshack.com/fichiers/" + json.stickers[0].link);
		}
	}

	replaceByArray (array2d) {
		for(let sticker of array2d)
		{
			this.replace(sticker[0], sticker[1]);
		}
	}

	replace (str1, str2) {
		this.getTextarea().value = this.getTextarea().value.replace(str1, str2);
	}

	insert (str) {
		this.getTextarea().focus();
		let startPos = this.getTextarea().selectionStart;
		let endPos = this.getTextarea().selectionEnd;
		this.getTextarea().value = this.getTextarea().value.substring(0, startPos) + " " + str + " " + this.getTextarea().value.substring(endPos, this.getTextarea().value.length);
	}

	// Partie "data":

	pushStickersWebedia () {
		// Stickers de base
		this.stickers = [
			[":pose:", "[[sticker:p/1kki]]"], [":prof:", "[[sticker:p/1kkn]]"], [":ananas:", "[[sticker:p/1kkh]]"], [":plage:", "[[sticker:p/1kkl]]"], [":onche:", "[[sticker:p/1kkm]]"], [":pls2:", "[[sticker:p/1kkk]]"], [":btg2:", "[[sticker:p/1kkj]]"], [":pls:", "[[sticker:p/1kks]]"], [":continue:", "[[sticker:p/1kkq]]"], [":haha:", "[[sticker:p/1kkt]]"], [":nudiste:", "[[sticker:p/1kkp]]"], [":panache:", "[[sticker:p/1kku]]"], [":bonnet:", "[[sticker:p/1kkr]]"], [":btg:", "[[sticker:p/1kkv]]"],
			[":masque:", "[[sticker:p/1kko]]"], [":malin:", "[[sticker:p/1jnd]]"], [":hein:", "[[sticker:p/1jne]]"], [":hahaha:", "[[sticker:p/1jnc]]"], [":billets:", "[[sticker:p/1jnj]]"], [":furie:", "[[sticker:p/1jng]]"], [":cigare:", "[[sticker:p/1jnf]]"], [":dehors3:", "[[sticker:p/1jni]]"], [":perplexe:", "[[sticker:p/1jnh]]"], [":dark:", "[[sticker:p/1kgx]]"], [":laser:", "[[sticker:p/1kh1]]"], [":christ:", "[[sticker:p/1kgz]]"],
			[":racaille:", "[[sticker:p/1kgv]]"], [":btg3:", "[[sticker:p/1kgw]]"], [":couronne:", "[[sticker:p/1kgy]]"], [":flamme:", "[[sticker:p/1kgu]]"], [":pls3:", "[[sticker:p/1kh0]]"], [":fete2:", "[[sticker:p/1kl6]]"], [":coeur2:", "[[sticker:p/1kl8]]"], [":coeur3:", "[[sticker:p/1klb]]"], [":koi:", "[[sticker:p/1kl1]]"], [":joue:", "[[sticker:p/1kl9]]"], [":cadeau:", "[[sticker:p/1kl7]]"], [":sleep3:", "[[sticker:p/1kl5]]"],
			[":heureux:", "[[sticker:p/1kl2]]"], [":perplexe3:", "[[sticker:p/1kl3]]"], [":fait chier:", "[[sticker:p/1kky]]"], [":dur2:", "[[sticker:p/1kkz]]"], [":tombe:", "[[sticker:p/1kla]]"], [":queue:", "[[sticker:p/1kl4]]"], [":nn:", "[[sticker:p/1kl0]]"], [":chevalier:", "[[sticker:p/1ljl]]"], [":hop:", "[[sticker:p/1ljj]]"], [":bide:", "[[sticker:p/1ljm]]"],
			[":photo:", "[[sticker:p/1ljn]]"], [":bescherelle:", "[[sticker:p/1ljo]]"], [":+1:", "[[sticker:p/1ljp]]"], [":master:", "[[sticker:p/1ljr]]"], [":thug:", "[[sticker:p/1ljq]]"], [":go mp:", "[[sticker:p/1rzs]]"], [":troll detector:", "[[sticker:p/1rzt]]"], [":first:", "[[sticker:p/1rzu]]"], [":jvc:", "[[sticker:p/1rzv]]"], [":tant pis:", "[[sticker:p/1rzw]]"], [":fort:", "[[sticker:p/1lgd]]"],
			[":question2:", "[[sticker:p/1lgc]]"], [":combat:", "[[sticker:p/1lgf]]"], [":grogne:", "[[sticker:p/1lgb]]"], [":grukk:", "[[sticker:p/1lgh]]"], [":perplexe2:", "[[sticker:p/1lgg]]"], [":trance:", "[[sticker:p/1lga]]"], [":pouce:", "[[sticker:p/1lge]]"], [":oklm:", "[[sticker:p/zu6]]"], [":oklm2:", "[[sticker:p/1f8e]]"], [":poker:", "[[sticker:p/1f89]]"], [":bud+1:", "[[sticker:p/zuc]]"],
			[":hahah:", "[[sticker:p/zu2]]"], [":dur:", "[[sticker:p/1f8a]]"], [":hin:", "[[sticker:p/zub]]"], [":zzz:", "[[sticker:p/zua]]"], [":grr:", "[[sticker:p/zu9]]"], [":oh:", "[[sticker:p/zu8]]"], [":argh:", "[[sticker:p/1f8d]]"], [":5min:", "[[sticker:p/1f8b]]"],
			[":bbq:", "[[sticker:p/1f8f]]"], [":sup:", "[[sticker:p/1f88]]"], [":burp:", "[[sticker:p/zu7]]"], [":colis:", "[[sticker:p/1f8c]]"], [":sombrero:", "[[sticker:p/1lmi]]"], [":sleep:", "[[sticker:p/1lml]]"], [":cute2:", "[[sticker:p/1lmh]]"], [":pote:", "[[sticker:p/1lmj]]"], [":triste:", "[[sticker:p/1lmk]]"], [":hotte:", "[[sticker:p/1lmm]]"], [":hey:", "[[sticker:p/1lmn]]"], [":titeuf:", "[[sticker:p/1lmo]]"], [":wc:", "[[sticker:p/1lmp]]"],
			[":magic:", "[[sticker:p/1mqv]]"], [":popcorn:", "[[sticker:p/1mqw]]"], [":hey2:", "[[sticker:p/1mqx]]"], [":feed:", "[[sticker:p/1mqy]]"], [":muscu:", "[[sticker:p/1mqz]]"], [":famoso:", "[[sticker:p/1mr0]]"], [":kebab:", "[[sticker:p/1mr1]]"], [":feel:", "[[sticker:p/1nua]]"], [":dehors2:", "[[sticker:p/1nu6]]"], [":papy:", "[[sticker:p/1nu9]]"],
			[":barbe:", "[[sticker:p/1nu8]]"], [":!:", "[[sticker:p/1nub]]"], [":fleurs:", "[[sticker:p/1nu7]]"], [":boom:", "[[sticker:p/1lmd]]"], [":hahaha3:", "[[sticker:p/1lmb]]"], [":ok2:", "[[sticker:p/1lm9]]"], [":burger:", "[[sticker:p/1lmf]]"], [":deprime:", "[[sticker:p/1lmc]]"], [":regard:", "[[sticker:p/1lme]]"], [":chasse:", "[[sticker:p/1lmg]]"], [":attaque:", "[[sticker:p/1lma]]"]
		];
	}

	pushStickersPerso () {
		this.stickersPerso = this.getStickersPerso();
	}

	getStickersPerso () {
		let s = this._getValue("perso");
		if(s == undefined || s == "undefined" || s == null) {
			this.defaultStickersPerso();
			return this.getStickersPerso();
		}

		let json;
		try {
			json = JSON.parse(s);
		}
		catch (e) {
			this.setStickersPerso([]);
			json = [];
		}
		return json;
	}

	addStickerPerso (code, text) {
		let data = this.getStickersPerso();
		let stop = false;
		for(let d of data)
		{
			if(d[0] == code) {
				stop = true;
			}
		}
		for(let sticker of this.stickers)
		{
			if(sticker[0] == code) {
				stop = true;
			}
		}
		if(stop) {
			return {e: false, s: "Le code est déjà utilisé."};
		}
		if(!/:([A-zÀ-ú0-9 ]+):/.test(code)) {
			return {e: false, s: "Le code doit commencer et finir par des doubles points \":\" et doit contenir uniquement des lettres, des chiffres et des espaces."};
		}
		data.push([code, text, Date.now()]);
		this.setStickersPerso(data);
		return {e: true, s: "Raccourci ajouté."};
	}

	removeStickerPerso (id) {
		let data = this.getStickersPerso();
		let newdata = [];
		for(let p of data)
		{
			if(id != p[2])
			{
				newdata.push(p);
			}
		}
		this.setStickersPerso(newdata);
	}

	setStickersPerso (data) {
		if(!Array.isArray(data))
		{
			data = [];
		}
		this._setValue("perso", JSON.stringify(data));
		this.pushStickersPerso();
	}

	defaultStickersPerso () {
		let t = Date.now();
		this._setValue("perso", JSON.stringify([
			[":risitas:", "http://image.noelshack.com/fichiers/2016/24/1466366197-risitas10.png", 1+t],
			[":jesus pose:", "http://image.noelshack.com/fichiers/2016/26/1467335935-jesus1.png", 2+t],
			[":chancla:", "http://image.noelshack.com/fichiers/2016/36/1473263957-risitas33.png", 3+t],
			[":sourire:", "http://image.noelshack.com/fichiers/2017/10/1489162412-1465686632-jesuus-risitas.gif", 4+t],
			[":larry:", "http://image.noelshack.com/fichiers/2017/04/1485484836-larry.png", 5+t]
		]));
	}

	rechercheRisibank (tags, callback) {
		this._xmlhttpRequest({
			method: "POST",
			url: "https://api.risibank.fr/api/v0/search",
			data: "search=" + encodeURIComponent(tags),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload: function(r) {
				let json = JSON.parse(r.responseText);
				callback(json);
			}
		});
	}

    rechercheRisibankById (id, callback) {
        this._xmlhttpRequest({
            method: "GET",
            url: "https://risibank.fr/stickers/"+id+"-slug",
            onload: function (r) {
                let html = (new DOMParser()).parseFromString(r.responseText, "text/html");
                let aStickerNoelshack = html.querySelector("a[data-clipboard-text]");
                if(aStickerNoelshack !== null) {
                    callback(aStickerNoelshack.href);
                    return;
                }
                callback("[erreur]");
            }
        })
    }

    updateRisibankPopular () {
        let self = this;

        let lastUpdate = this._getValue("risibankPopularLastUpdate", 0);

        let timestamp = Math.ceil(Date.now()/1000);

        let data = [];

        let next = () => {
            let liste = [];
            data.forEach((sticker, index) => {
                liste.push({
                    id: sticker.id,
                    image_noelshack: "http://image.noelshack.com/fichiers/" + sticker.link,
                    image_jvsticker: "https://i.jvsticker.com/" + sticker.id,
                    tags: sticker.tags
                });
            });
            this.htmlRisibankPopular(liste);
            this.clickableStickersRisibank();
        };

        if((timestamp - lastUpdate) > (60*60*24)) {
            this._xmlhttpRequest({
                method: "POST",
                url: "https://api.risibank.fr/api/v0/load",
                onload: function (r) {
                    console.log("request")
                    try {
                        let json = JSON.parse(r.responseText);
                        data = json.stickers.views;
                        self._setValue("risibankPopularLastUpdate", timestamp);
                        self._setValue("risibankPopularCache", data);
                    } catch (e) {
                        data = []
                    }
                    next();
                }
            });
        } else {
            data = this._getValue("risibankPopularCache", []);
            next();
        }
    }

    isModalMobile () {
        let modal = document.querySelector(".modal-generic-main");
        if(modal !== null) {
            if(modal.offsetWidth >= 800) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

	// Partie "GUI":

	textareaBar () {
		let div = document.createElement("div");
		div.innerHTML = `<button class="btn btn-jv-editor-toolbar" type="button" title="RisiCode" style="font-family: monospace;padding: 0;" id="risicode-bt-tb">:RisiCode:</button>`;
		div.classList.add("btn-group");
		document.querySelector(".jv-editor-toolbar").appendChild(div);
		div.onclick = () => this.modalPrincipal();
	}

	modalPrincipal () {
		let html = '';

		html += this.htmlStickersWebedia();
		html += this.htmlStickersPerso();
        html += this.htmlStickersRisibank();

		modal("afficher", {
			titre: "RisiCode",
			contenu: html,
			callback: () => {

				this.callbackStickersWebedia();
				this.callbackStickersPerso();
                this.callbackStickersRisibank();

				modal("centrer");

			}
		});
	}

	modalGerer () {

		let html = `<fieldset style="border: 1px groove;padding-right:15px;padding-left: 15px;"><legend style="color: unset;border-bottom: unset;width:  unset;margin-left:  15px;padding:  5px;">Ajouter</legend>`;
		html +=    `<span id="add_error_zone"></span>`;
		html +=    `<div class="form-group"><label class="label-control">Code:</label><input type="text" id="add_code" class="form-control" placeholder=":texte qui sera remplacé:"></div>`;
		html +=    `<div class="form-group"><label class="label-control">Contenu:</label><textarea id="add_str" class="form-control" style="width:100%" placeholder="http://image.noelshack.com/fichiers/..."></textarea></div>`;
		html +=    `<div class="form-group"><button class="btn btn-primary btn-sm" type="submit" id="add_btn">Valider</button></div>`;

		html +=    `</fieldset>`;

		html +=    `<fieldset style="border: 1px groove;padding-right:15px;padding-left: 15px;"><legend style="color: unset;border-bottom: unset;width:  unset;margin-left:  15px;padding:  5px;">Liste</legend><span id="gerer_liste"></span></fieldset>`;

		modal("afficher", {
			titre: "Gérer mes stickers perso",
			contenu: html,
			callback: () => {

				document.querySelector("#gerer_liste").innerHTML = this.htmlGererListe();

				document.querySelector("#add_btn").onclick = () => {
					let code = document.querySelector("#add_code").value.trim();
					if(code == "")
						return;
					let text = document.querySelector("#add_str").value.trim();
					if(text == "")
						return;
					let resp = this.addStickerPerso(code, text);
					if(resp.e) {
						document.querySelector("#add_error_zone").innerHTML = `
                        <div class="alert alert-success">
                              <div class="alert-row">${resp.s}</div>
                        </div>`;
						setTimeout(() => {
							modal("fermer");
							this.modalGerer();
						}, 1000);
					}
					else {
						document.querySelector("#add_error_zone").innerHTML = `
                         <div class="alert alert-warning">
                              <div class="alert-row">${resp.s}</div>
                        </div>`;
					}
				};

				this.callbackGererListe();

				modal("centrer");
			}
		});
	}

	htmlStickersWebedia () {
		let html = `<div style="margin-bottom: 5px; border-bottom: 1px solid; padding-bottom: 5px; font-size: 1.2em;">Stickers JVC <a style="float: right; cursor: pointer" data-str-1="[Afficher]" data-str-2="[Masquer]" id="toggle-stkswebedia">[Afficher]</a></div>`;
		html    += `<div id="stkswebedia" style="cursor: auto; display: none; flex-wrap: wrap; justify-content: space-between;">`;
		for(let sticker of this.stickers)
		{
			let afficher;
			if(/\[\[sticker:([0-9a-zA-Z\/]+)\]\]/.test(sticker[1]))
			{
				afficher = '<img src="http://jv.stkr.fr/'+RegExp.$1+'?f-ed=1" height="44px;">';
			}
			else
			{
				afficher = sticker[1];
			}
			html += `<div style="margin: 5px;  display: inline-block; min-width: 6%; padding:  5px;border: 1px dashed;border-radius:  3px; cursor: pointer" class="risicode-bt-st" data-stk="${sticker[1]}">
                          <div style="width: 100%; display: block; text-align: center; margin: 0">${afficher}</div>
                          <div style="width: 100%; display: block; text-align: center; margin: 0">${sticker[0]}</div>
                     </div>`;
		}
		html += `</div>`;
		return html;
	}

	callbackStickersWebedia () {
		let self = this;
		let twb = document.querySelector("#toggle-stkswebedia");

		let divwb = document.querySelector("#stkswebedia");

		if(this._getValue("twb", 1) == 2)
		{
			divwb.style.display = "flex";
			twb.innerHTML = twb.dataset["str-2"];
		}

		twb.onclick = function () {
			if(this.innerHTML == this.dataset["str-1"])
			{
				divwb.style.display = "flex";
				this.innerHTML = this.dataset["str-2"];
				self._setValue("twb", 2);
				modal("centrer");
			}
			else
			{
				divwb.style.display = "none";
				this.innerHTML = this.dataset["str-1"];
				self._setValue("twb", 1);
				modal("centrer");
			}
			return false;
		};

		for(let div of document.querySelectorAll(".risicode-bt-st"))
		{
			div.onclick = () => {
				this.insert(div.dataset.stk);
				modal("fermer");
			};
		}
	}

	htmlStickersPerso () {
		let html = `<div style="margin-bottom: 5px; border-bottom: 1px solid; padding-bottom: 5px; font-size: 1.2em;">Mes stickers <span style="float: right;"><a style="cursor: pointer" id="bt-gerer">[Gérer]</a> <a style="cursor: pointer" data-str-1="[Afficher]" data-str-2="[Masquer]" id="toggle-stksprs">[Afficher]</a></span></div>`;
		html    += `<div id="stksprs" style="cursor: auto; display: none; flex-wrap: wrap; justify-content: start;">`;

		for(let perso of this.stickersPerso)
		{
			html += `<div style="margin: 5px;  display: inline-block; min-width: 6%; padding:  5px;border: 1px dashed;border-radius:  3px;">
                          <div style="width: 100%; display: block; text-align: center; margin: 0">${this.htmlAfficherStickerPerso(perso)}</div>
                          <div style="width: 100%; display: block; text-align: center; margin: 0">${perso[0]}</div>
                     </div>`;
		}

		if(this.stickersPerso.length == 0)
		{
			html += `<div class="alert alert-danger" role="alert">Vous n'avez pas de stickers perso</div>`;
		}

		html    += `</div>`;
		return html;
	}

	htmlAfficherStickerPerso (perso) {
		let afficher;
		if(/^http(s)?:\/\/image.noelshack.com\/(fichiers|minis)\/([0-9]+)\/([0-9]+)\/([0-9]+)-([0-9a-zA-Z-]+).(png|jpg|jpeg|gif)$/.test(perso[1]) ||
		   /^http(s)?:\/\/image.noelshack.com\/(fichiers|minis)\/([0-9]+)\/([0-9]+)\/([0-9]+)\/([0-9]+)-([0-9a-zA-Z-]+).(png|jpg|jpeg|gif)$/.test(perso[1])) {
			afficher = '<img src="'+perso[1]+'" width="68" height="51" class="risicode-bt-st" data-stk="'+perso[1]+'" style="cursor:pointer">';
		}
		else if(/^http(s)?:\/\/www\.noelshack\.com\/([0-9]{4})-([0-9]{2})-([0-9]+)-([0-9a-z-]+)\.(png|gif|jpg|jpeg)$/.test(perso[1])) {
			let link = `http://image.noelshack.com/fichiers/${RegExp.$2}/${RegExp.$3}/${RegExp.$4}-${RegExp.$5}.${RegExp.$6}`;
			afficher = '<img src="'+link+'" width="68" height="51" class="risicode-bt-st" data-stk="'+link+'" style="cursor:pointer">';
		}
		else if(/^\[\[sticker:([0-9a-zA-Z\/]+)\]\]$/.test(perso[1])) {
			afficher = '<img src="http://jv.stkr.fr/'+RegExp.$1+'?f-ed=1" height="44px;">';
		}
		else {
			afficher = '<textarea readonly style="width: 68px;resize: none;">' + perso[1] + '</textarea>';
		}
		return afficher;
	}

	callbackStickersPerso () {
		let self  = this;
		let tpr   = document.querySelector("#toggle-stksprs");
		let divpr = document.querySelector("#stksprs");
		let btger = document.querySelector("#bt-gerer");

		if(this._getValue("tpr", 1) == 2)
		{
			divpr.style.display = "flex";
			tpr.innerHTML = tpr.dataset["str-2"];
		}

		tpr.onclick = function () {
			if(this.innerHTML == this.dataset["str-1"])
			{
				divpr.style.display = "flex";
				this.innerHTML = this.dataset["str-2"];
				self._setValue("tpr", 2);
				modal("centrer");
			}
			else
			{
				divpr.style.display = "none";
				this.innerHTML = this.dataset["str-1"];
				self._setValue("tpr", 1);
				modal("centrer");
			}
			return false;
		};

		btger.onclick = () => {
			modal("fermer");
			this.modalGerer();
		};
	}

	htmlGererListe () {
		let html = `<table class="table" style="margin-left: auto; margin-right: auto;">`;
		for(let sticker of this.stickersPerso.slice().reverse())
		{
			let d = new Date(sticker[2]);
			d = 'Ajouté le ' + d.toLocaleDateString()+' à '+d.toLocaleTimeString()+'';
			html += `<tr data-tr-sticker-id="${sticker[2]}"><td style="min-width:  100px; padding: 5px; text-align: center">${sticker[0]}</td> <td style="min-width:  100px; padding: 5px; text-align: center">${this.htmlAfficherStickerPerso(sticker)}</td> <td style="min-width:  100px; padding: 5px; text-align: center"><div class="btn btn-danger btn-sm gerer_remove" data-id="${sticker[2]}">Supprimer</div></td> <td>${d}</td></div>`;
		}
		html += `</table>`;
		return html;
	}

	callbackGererListe () {
		for(let btn of document.querySelectorAll(".gerer_remove"))
		{
			btn.onclick = () => {
				this.removeStickerPerso(btn.dataset.id);
				//document.querySelector("#gerer_liste").innerHTML = this.htmlGererListe();
				document.querySelector("*[data-tr-sticker-id='"+btn.dataset.id+"']").style.display = "none";
                modal("centrer");
			};
		}
	}

    htmlStickersRisibank () {
        let html = `<div style="margin-bottom: 5px; border-bottom: 1px solid; padding-bottom: 5px; font-size: 1.2em;">Recherche <a href="https://risibank.fr/" target="_blank">Risibank</a> <a style="float: right; cursor: pointer" data-str-1="[Afficher]" data-str-2="[Masquer]" id="toggle-stksrisibank">[Afficher]</a></div>`;
        html += `<div id="stksrisibank" style="cursor: auto; display: none;">`;

        html += `<div><input type="text" class="form-control" id="input-risibank-search" placeholder="Faire une recherche risibank"></div>`;

        html += `<div id="risibank-popular"></div>`;

        html += `<div id="risibank-search" style="display:none;"></div>`;

        html += `</div>`;
        return html;
    }

    callbackStickersRisibank () {
        let self  = this;
		let tri   = document.querySelector("#toggle-stksrisibank");
		let divri = document.querySelector("#stksrisibank");
        let inputSearch = document.querySelector("#input-risibank-search");
        let risibankPopularDiv = document.querySelector("#risibank-popular");
        let risibankSearchDiv = document.querySelector("#risibank-search");
        let isModalMobile = this.isModalMobile();

		if(this._getValue("tri", 1) == 2)
		{
			divri.style.display = "block";
			tri.innerHTML = tri.dataset["str-2"];
            this.updateRisibankPopular();
		}

		tri.onclick = function () {
			if(this.innerHTML == this.dataset["str-1"])
			{
				divri.style.display = "block";
				this.innerHTML = this.dataset["str-2"];
				self._setValue("tri", 2);
                self.updateRisibankPopular();
				modal("centrer");
			}
			else
			{
				divri.style.display = "none";
				this.innerHTML = this.dataset["str-1"];
				self._setValue("tri", 1);
				modal("centrer");
			}
			return false;
		};

        inputSearch.onkeyup = () => {
            let keys = inputSearch.value;
            if(keys.length > 0) {
                setTimeout(() => {
                    if(keys == inputSearch.value) {
                        this.rechercheRisibank(keys, (result) => {
                            if(keys == inputSearch.value) {
                                risibankPopularDiv.style.display = "none";
                                let html = `Recherche «${keys}» :<br>`;
                                result.stickers.forEach((sticker, index) => {
                                    if(32 > index || !isModalMobile) {
                                        html += this.htmlDivStickerRisibank({
                                            id: sticker.id,
                                            image_noelshack: "http://image.noelshack.com/fichiers/" + sticker.link,
                                            image_jvsticker: "https://i.jvsticker.com/" + sticker.id,
                                            tags: sticker.tags
                                        });
                                    }
                                });
                                risibankSearchDiv.innerHTML = html;
                                this.clickableStickersRisibank();
                                risibankSearchDiv.style.display = "block";
                            }
                        });
                    }
                }, 200);
            } else {
                risibankSearchDiv.style.display = "none";
                risibankPopularDiv.style.display = "block";
            }
        };


    }

    htmlDivStickerRisibank (sticker) {
        return `<div id="risibank-sticker-${sticker.id}" style="margin: 5px;  display: inline-block; min-width: 6%; padding:  5px;border: 1px dashed;border-radius:  3px; cursor: pointer" class="risicode-bt-risibank" data-stk="${sticker.image_noelshack}">
                          <div style="width: 100%; display: block; text-align: center; margin: 0"><img onerror="this.onerror = function () {this.parentNode.parentNode.remove()};this.src='${sticker.image_noelshack}';" src="${sticker.image_jvsticker}" width="64px" title="${sticker.tags}"></div>
                          <div style="width: 100%; display: block; text-align: center; margin: 0">:rid ${sticker.id}:</div>
                     </div>`;
    }

    htmlRisibankPopular (stickers) {
        let html = `Populaires :<br>`;
        stickers.forEach((sticker) => {
            html += this.htmlDivStickerRisibank(sticker);
        });
        let div = document.querySelector("#risibank-popular");
        if(div !== null) {
            div.innerHTML = html;
        }
    }

    clickableStickersRisibank () {
        for(let div of document.querySelectorAll(".risicode-bt-risibank")) {
            div.onclick = () => {
                this.insert(div.dataset.stk);
                modal("fermer");
            }
        }
    }

	// Partie "fonctions userscript":
    // NOTE: J'ai voulu rendre le script compatible avec Greasemonkey mais il me pose trop de problème à cause de leur système de "Promise" et j'ai la flemme de continuer. Je préfère Tampermonkey.

	_getValue (key, defaultval) {
		let r = null;
		if(typeof GM_getValue !== "undefined") {
			r = GM_getValue(key);
		}
		else if(typeof GM !== "undefined" && typeof GM.getValue !== "undefined") {
			r = GM.getValue(key);
		}

		if(typeof defaultval !== "undefined" && r === null) {
			r = defaultval;
		}
        if(r === undefined) {
            r = defaultval;
        }

		return r;
	}

	_setValue (key, value) {
		if(typeof GM_getValue !== "undefined") {
			GM_setValue(key, value);
		}
		else if(typeof GM !== "undefined" && typeof GM.getValue !== "undefined") {
			GM.setValue(key, value);
		}
	}

	_xmlhttpRequest (r) {
		if(typeof GM_xmlhttpRequest !== "undefined") {
			GM_xmlhttpRequest(r);
		}
		else if(typeof GM !== "undefined" && typeof GM.xmlHttpRequest !== "undefined") {
			GM.xmlHttpRequest(r);
		}
	}

};
