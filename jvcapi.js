var JVCAPI = {};

JVCAPI.version = "0.5";

JVCAPI.page = {};

JVCAPI.page.is = {
    liste_des_sujets: function () {
        return document.querySelector(".conteneur-topic-pagi li[data-id]") !== null;
    },
    topic: function () {
        return document.querySelector(".bloc-message-forum[data-id]") !== null && document.querySelector(".page-active") !== null;
    },
    message: function () {
        return document.querySelector(".text-muted") !== null && document.querySelector(".bloc-message-forum[data-id]") !== null;
    }
};

JVCAPI.topic = {};

JVCAPI.topic.getUrlInfos = function (url) {
    if(url === undefined)
    {
        url = document.location.href;
    }
    let l1, l2, l3, l4;
    if (/http:\/\/www.jeuxvideo.com\/forums\/([0-9]+)-([0-9]+)-([0-9]+)-([0-9]+)-/.test(url)) {
        l1 = RegExp.$1, l2 = RegExp.$2, l3 = RegExp.$3, l4 = RegExp.$4;
    }
    return {
        topicID: l3,
        forumID: l2,
        code: l1,
        currentPage: l4
    };
};

JVCAPI.topic.getMessages = function (link, callback) {
    let local = false;
    if ((typeof link === "object") && (link !== null)) {
        if (link.local === undefined || !link.local) {
            if (link.code === undefined) {
                link.code = 42;
            }
            if (link.forumID === undefined) {
                link.forumID = 51;
            }
            if (link.page === undefined) {
                link.page = 1;
            }
            if (link.topicID === undefined) {
                callback({
                    error: "topicID manquant"
                });
                return;
            }
            link = "http://www.jeuxvideo.com/forums/" + link.code + "-" + link.forumID + "-" + link.topicID + "-" + link.page + "-0-1-0-0.htm";
        } else {
            local = true;
        }
    }

    function f(html) {
        let divs = JVCAPI.stringToHtml(html).querySelectorAll(".conteneur-message"),
            posts = [];
        divs.forEach(function (el) {
            let pseudo = "";
            if (/current-topic-author/.test(el.querySelector(".bloc-pseudo-msg").innerHTML.trim())) {
                pseudo = el.querySelector(".user-avatar-msg").getAttribute("alt");
            } else {
                pseudo = el.querySelector(".bloc-pseudo-msg").innerHTML.trim();
            }
            let avatar = "";
            try {
                avatar = el.querySelector(".bloc-avatar-msg").querySelector("img").getAttribute("data-srcset");
            } catch (e) {
                try {
                    avatar = el.querySelector(".bloc-avatar-msg").querySelector("img").getAttribute("src");
                }
                catch(e) {
                    avatar = "http://image.jeuxvideo.com/avatar/default.jpg";
                }
            }
            let date = "";
            try {
                date = el.querySelector(".bloc-date-msg").innerHTML.trim();
            } catch (e) {
                date = el.querySelector(".bloc-date-msg").querySelector("a").innerHTML.trim();
            }
            let message = "";
            try {
                message = el.querySelector(".txt-msg").innerHTML;
            } catch (e) {
                message = '<div class="text-blacklist">Ce pseudo figure dans votre blacklist</div><div class="liens-blacklist">' + el.querySelector(".msg-pseudo-blacklist-view").outerHTML + '</div>';
            }
            let signature = "";
            try {
                signature = el.querySelector(".signature-msg").innerHTML.trim();
            } catch (e) {
                signature = "";
            }
            let ddbLink = null;
            try {
                if(el.querySelector(".picto-msg-exclam") !== null)
                    ddbLink = el.querySelector(".picto-msg-exclam").dataset.selector;
            } 
            catch (e) {}
            posts.push({
                id: el.parentElement.getAttribute("data-id"),
                pseudo: pseudo,
                avatar: avatar,
                date: date,
                message: message,
                signature: signature,
                grade: el.querySelector(".text-modo") !== null ? "modo" : el.querySelector(".text-admin") !== null ? "admin" : "",
                page: JVCAPI.stringToHtml(html).querySelector(".page-active").innerHTML.trim()
            });
        });
        return posts;
    }
    if (!local) {
        try {
        let req = new XMLHttpRequest();
        req.onreadystatechange = function (event) {
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200) {
                    let html = this.responseText;
                    callback({
                        html: html,
                        posts: f(html)
                    });
                } else {
                    let status = this.status;
                    callback({
                        error: status
                    });
                }
            }
        };
        req.open('GET', link, true);
        req.send(null);
    }
    catch(e) {
        callback({
            error: "XMLHttpRequest error"
        });
    }
    } else {
        callback({
            html: document.documentElement.innerHTML,
            posts: f(document.documentElement.innerHTML)
        });
    }
};
JVCAPI.stringToHtml = function (s) {
    return (new DOMParser()).parseFromString(s, "text/html");
};

JVCAPI.query = function (q) {
    return document.querySelector(q);
}

var stringToHtml = JVCAPI.stringToHtml;
var query = JVCAPI.query;
