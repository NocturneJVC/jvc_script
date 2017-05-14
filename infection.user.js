// ==UserScript==
// @name         JVC Infection
// @version      1.0
// @description  a
// @author       NocturneX
// @match        http://www.jeuxvideo.com/forums/42-51-*
// @grant        GM_xmlhttpRequest
// @connect      nocturnex.alwaysdata.net
// ==/UserScript==

(function() {
	'use strict';
	// SI DARKJVC EST PRESENT
	let DarkJVC = false;

	let element = document.getElementById('content'),
		style = window.getComputedStyle(element),
		s = style.getPropertyValue('background');
	if(s == "rgb(18, 18, 18) none repeat scroll 0% 0% / auto padding-box border-box")
	{
		DarkJVC = true;
	}
	/////////////////////////

	GM_xmlhttpRequest({
		method: "GET",
		url: "http://nocturnex.alwaysdata.net/infection/?topic=" + 'http://' + window.location.hostname + window.location.pathname,
		onload: function(response) {
			if(response.responseText != "hum")
			{
				etape2(JSON.parse(response.responseText));
			}
		}
	});

	function etape2(json)
	{
		document.querySelectorAll(".bloc-header").forEach(function (el) {
			let bloc = el.parentNode.parentNode.parentNode;
			let pseudo = el.querySelector(".bloc-pseudo-msg").textContent.trim().toLowerCase();
			let pourcentage = 0;
			if(json[pseudo] !== undefined)
			{
				pourcentage = parseInt(json[pseudo]);
				let node = document.createElement("div");
				node.classList.add("bloc-date-msg");
				node.setAttribute("style", `left: 87%;`);
				node.innerHTML = "Infection " + pourcentage + "%";
				el.appendChild(node);
				if(DarkJVC)
				{
					bloc.style.backgroundColor = "hsl(125, "+pourcentage+"%, 15%)";
				}
				else
				{
					bloc.style.backgroundColor = "rgb("+Math.trunc(255-(2.25*pourcentage))+", 255, "+Math.trunc(255-(pourcentage*2))+")";
				}
			}
		});
	}
})();
