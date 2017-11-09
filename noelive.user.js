// ==UserScript==
// @name         NOELIVE
// @version      0.1
// @description  Topic live pour avenoel
// @author       NocturneX
// @match        http://avenoel.org/topic/*-*-*
// @match        https://avenoel.org/topic/*-*-*
// @grant        GM_xmlhttpRequest
// @connect      avenoel.org
// @icon         http://image.noelshack.com/fichiers/2017/34/1/1503324934-risitas-rire1.png
// ==/UserScript==

(function() {
    'use strict';

    class NOELIVE {
		constructor () {

			this.nbSecondeUpdate = 2;

			this.pageLive = this.getCurrentPage();
			if(this.check() === 0) return;
			this.symboles = [
				"",
				"⚪",
				"⚫"
			];
			//this.test();
			this.start();
		}
		check () {
			if(this.pageLive < 1) return 0;
			if(this.pageLive < this.getLastPage()) return 0;
			if(this.getTopicId() < 1) return 0;
			return 1;
		}
		getUrl () {
			return window.location.hostname + window.location.pathname;
		}
		getCurrentPage () {
			if(/^avenoel.org\/topic\/([0-9]+)-([0-9]+)-/.test(this.getUrl()))
			{
				return RegExp.$2;
			}
			return 0;
		}
		getLastPage (doc) {
			if(doc === undefined) doc = document;
			let p = doc.querySelector(".pagination-topic").querySelectorAll("li");
			return p [ p.length - 2 ].querySelector("a").innerHTML.trim();
		}
		getTopicId () {
			if(/^avenoel.org\/topic\/([0-9]+)-([0-9]+)-/.test(this.getUrl()))
			{
				return RegExp.$1;
			}
			return 0;
		}
		createURL (topicId, page) {
			return `https://avenoel.org/topic/${topicId}-${page}-slug`;
		}

		getTitleForm () {
			if(this.titleForm === undefined)
			{
				this.titleForm = document.querySelector(".bloc-title").innerHTML.trim();
			}
			return this.titleForm;
		}

		changeSymbolTitleForm (symboleId) {
			document.querySelector(".bloc-title").innerHTML = this.getTitleForm() + " " + this.symboles[symboleId];
		}

		checkErreur (doc) {
			if(doc === undefined || doc.querySelector("article") === null)
			{
				return true;
			}
			else
			{
				return false;
			}
		}

		checkPage (doc) {
			let p = this.getLastPage(doc);
			if(p > this.pageLive)
			{
				if( (p - this.pageLive) > 5)
				{
					this.pageLive = p;
				}
				else
				{
					this.pageLive++;
				}
				console.log("[NOELIVE] Change de page "+this.pageLive);
			}
		}

		getPosts (callback) {
			var self = this;
			GM_xmlhttpRequest({
				method: "GET",
				url: this.createURL(this.getTopicId(), this.pageLive),
				onload: function(response) {
					let doc = (new DOMParser()).parseFromString(response.responseText, "text/html");
					if(self.checkErreur(doc))
					{
						console.log("[NOELIVE] Une erreur est survenue.");
						console.log(doc.title);
						callback([]);
						return 0;
					}
					self.checkPage(doc);
					let posts = [];
					doc.querySelectorAll("article").forEach(function (el) {
						posts.push(el);
					});
					callback(posts);
				},
			});
		}

		affichePosts (posts) {
			console.log("[NOELIVE] " + posts.length + " posts récupérés.");
			this.changeSymbolTitleForm(2);
			posts.forEach(function (post) {
				let postId = post.getAttribute("id");
				if(document.querySelector("article[id='"+postId+"']") === null)
				{
					console.log("[NOELIVE] nouveau "+postId);
					document.querySelector(".topic-messages").appendChild(post);
				}
			});
			this.changeSymbolTitleForm(0);
		}

		start () {
			var self = this;
			function boucle() {
				self.changeSymbolTitleForm(1);
				self.getPosts(function (posts) {
					self.affichePosts(posts);
					setTimeout(function () {
						boucle();
					}, self.nbSecondeUpdate * 1000);
				});
			}
			boucle();
		}

		test () {

		}
	}

	new NOELIVE();

})();
