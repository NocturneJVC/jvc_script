// ==UserScript==
// @name         JVC Mosaïque to Image
// @version      2.1
// @description  Transforme les mosaïques en image
// @author       NocturneX
// @match        http://www.jeuxvideo.com/forums/42-*
// @match        https://www.jeuxvideo.com/forums/42-*
// @match        http://www.jeuxvideo.com/mosaiqueToImage
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      noelshack.com
// @connect      image.noelshack.com
// @icon         http://image.jeuxvideo.com/smileys_img/26.gif
// ==/UserScript==

(function() {
    'use strict';
	if(/\/forums\/42-/.test(document.location.href))
	{
		GM_addStyle('.img-mosa{margin-right: -0.3em;margin-bottom: -0.53em;}');
		document.querySelectorAll(".text-enrichi-forum img.img-shack").forEach(function (img) {
			if(/^http(s)?:\/\/image\.noelshack\.com\/fichiers\/([0-9]{4})\/([0-9]+)\/([0-9]+)\/([0-9]+)-([0-9]+)-([a-z0-9]{8})\.(png|gif|jpg|jpeg)$/.test(img.alt)||
			   /^http(s)?:\/\/image\.noelshack\.com\/fichiers\/([0-9]{4})\/([0-9]+)\/([0-9]+)-([0-9]+)-([a-z0-9]{8})\.(png|gif|jpg|jpeg)/.test(img.alt)||
			   /^http(s)?:\/\/www\.noelshack\.com\/([0-9]{4})-([0-9]+)-([0-9]+)-([0-9]+)-([0-9a-z]{1})\.(png|gif|jpg|jpeg)/.test(img.alt)
			  )
				img.classList.add("img-mosa");
		});
	}
	else if(/com\/mosaiqueToImage/.test(document.location.href))
	{
		let c = document.querySelector(".container.container-content");
		let html = `
<h3>Convertir une mosaique en image</h3>
<div>
<label for="mtitextarea">Liens noelshack</label><textarea style="width:100%;height:300px;" name="mtitextarea" id="mtitextarea"></textarea>
<button type="button" class="btn btn-primary btn-lg btn-block" id="mtivalider">Convertir en image</button><br><br>
<div id="mtiresult"></div>
</div>
`;
		c.innerHTML = html;
		document.title = "Convertir une mosaique en image";
		let occupe = false;
		let stk_size = {w:68,h:51};
		document.querySelector("#mtivalider").onclick = function () {
			if(occupe)
				return;
			occupe = true;
			let div_result = document.querySelector("#mtiresult");
			let textarea = document.querySelector("#mtitextarea");
			div_result.innerHTML = `<canvas id="mticanvas"></canvas>`;
			let canvas = document.querySelector("#mticanvas");
			let ctx = canvas.getContext('2d');
			let lignes = textarea.value.split("\n");
			let lignes_image = [];
			let largeur = 0;
			let hauteur = 0;
			lignes.forEach(function (ligne) {
				let images = [];
				ligne.split(" ").forEach(function (image) {
					let r = imageNoelshack(image);
					if(r.isNoelshack)
					{
						images.push(r.link);
					}
				});
				largeur = images.length > largeur ? images.length : largeur;
				lignes_image.push(images);
			});
			hauteur = lignes_image.length;
			let size = {h:hauteur*stk_size.h,w:largeur*stk_size.w};
			canvas.width = size.w;
			canvas.height = size.h;
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			lignes_image.forEach(function (ligne, h) {
				h *= stk_size.h;
				ligne.forEach(function (image, w) {
					w *= stk_size.w;
					var img = new Image();
					img.onload = function(){
						ctx.drawImage(img,w,h,stk_size.w,stk_size.h);
					};
					img.src = image;
				});
			});
			occupe = false;
		};
		let imageNoelshack = function (text) {
			text = text.trim();
			if(/^http(s)?:\/\/www\.noelshack\.com\/([0-9]{4})-([0-9]{2})-([0-9]{1,3})-([0-9]+)-([0-9a-z-]+)\.(png|gif|jpg|jpeg)$/.test(text))
			{
				let link = `http://image.noelshack.com/fichiers/${RegExp.$2}/${RegExp.$3}/${RegExp.$4}/${RegExp.$5}-${RegExp.$6}.${RegExp.$7}`;
				return {isNoelshack:true,link:link};
			}
			if(/^http(s)?:\/\/www\.noelshack\.com\/([0-9]{4})-([0-9]{2})-([0-9]+)-([0-9a-z-]+)\.(png|gif|jpg|jpeg)$/.test(text))
			{
				let link = `http://image.noelshack.com/fichiers/${RegExp.$2}/${RegExp.$3}/${RegExp.$4}-${RegExp.$5}.${RegExp.$6}`;
				return {isNoelshack:true,link:link};
			}
			if(/^http(s)?:\/\/image\.noelshack\.com\/(minis|fichiers)\/([0-9]{4})\/([0-9]{2})\/([0-9]{1,})\/([0-9]+)-([0-9a-z-]+)\.(png|gif|jpg|jpeg)$/.test(text))
			{
				return {isNoelshack:true,link:text};
			}
			if(/^http(s)?:\/\/image\.noelshack\.com\/(minis|fichiers)\/([0-9]{4})\/([0-9]{2})\/([0-9]+)-([0-9a-z-]+)\.(png|gif|jpg|jpeg)$/.test(text))
			{
				return {isNoelshack:true,link:text};
			}
			return {isNoelshack:false,link:null};
		};
	}
})();
