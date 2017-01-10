/* global chrome, BrowserControl, TitleBar */
var viewIsLoaded = false;

window.onload = function () {
    // Used to replace some html entities into normal chars
    var htmlStr = function(str){
        return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot/g, '"');
    };

    var webview = document.querySelector('#deezerview');

    // Add listener for consolemessage from webview
    webview.addEventListener('consolemessage', function(e) {
        try {
            var result = JSON.parse(e.message);
            if (result){
                if (result.id === 'deezer_shortcut_handle_events'){
                    switch (result.action){
                        case 'change_music':
                            // Get image from Deezer
                            var xhr = new XMLHttpRequest();
                            xhr.open('GET', result.data.nextCover, true);
                            xhr.responseType = 'blob';
                            xhr.onload = function(e) {
                                // Create & show notification
                                chrome.notifications.create('music-changed',{
                                    type: 'basic',
                                    iconUrl: window.URL.createObjectURL(this.response),
                                    title: htmlStr(result.data.nextTitle),
                                    message: htmlStr(result.data.nextArtist)
                                });

                            };
                            xhr.send();
                            break;
                    }
                }
            }

        }catch (e){
            // Not for our purpose
        }

    });

    //block ads
    webview.request.onBeforeRequest.addListener(
        function (details) {
            return {
                cancel: true
            };
        }, {
            urls: ["*://*.googleadservices.com/*", "*://*.googlesyndication.com/*", "*://*.smartadserver.com/*"]
        }, ["blocking"]);

    var browserControl = new BrowserControl('#deezerview', webview.src);
    var titlebar = new TitleBar('left', 'assets/icon_16.png', 'Deezer Shortcut', true, browserControl);
    titlebar.bind();

	var isLoaded = false;
	var loadLimit = 10;
	var loading = setTimeout(function() {
		if (loadLimit >= 10) {
			document.querySelector('#dialog-title').innerHTML = 'Error';
			document.querySelector('#dialog-content').innerHTML = 'Cannot open Deezer! Check your internet connection and use Reload in titlebar.';
			document.querySelector('#dialog-cancel').style.display = 'none';
			document.querySelector('#dialog').showModal();
		} else {
			loadLimit++;
			document.querySelector('#mainwebview').reload();
		}
	}, 10000);

    webview.addEventListener('contentload', function () {
        if (loading) {
            clearTimeout(loading);
            loading = null;
        }
        if (!isLoaded) {
            isLoaded = true;
        }
        //remove empty ads boxes
        var source = "$('body').removeClass('has-ads-top has-ads-bottom');";
        document.querySelector('#deezerview').executeScript({
            code: "var script=document.createElement('script');script.textContent=\"" + source + "\";(document.head||document.documentElement).appendChild(script);script.parentNode.removeChild(script);"
        });

        // Send message into host to handle music changes
        webview.executeScript(
            {
                code: "Array.prototype.slice.call(document.querySelectorAll('div.player-track .player-track-link')).forEach(function(el){" +
                "el.addEventListener('DOMSubtreeModified', function(){" +
                "var nextCover, nextTitle, nextArtist = '';" +
                "window.setTimeout(function(){" +
                "nextCover = Array.prototype.slice.call(document.querySelectorAll('div.player-cover img'))[0].src;" +
                "nextTitle = Array.prototype.slice.call(document.querySelectorAll('h2.player-track-title a.player-track-link'))[0].innerHTML;" +
                "nextArtist = new Array();" +
                "Array.prototype.slice.call(document.querySelectorAll('h3.player-track-artist a.player-track-link')).forEach(function(el){" +
                "nextArtist.push(el.innerHTML)" +
                "});" +
                "nextArtist = nextArtist.join(', ');" +
                "console.log(JSON.stringify({id: 'deezer_shortcut_handle_events', action: 'change_music', data: {nextTitle: nextTitle, nextArtist: nextArtist, nextCover: nextCover}}));" +
                "}, 100);" +
                "});" +
                "});"
            }, function(result){
                console.log(result);
            });


    });
    webview.addEventListener('permissionrequest', function (e) {
        if (e.permission === 'download') {
            if (e.url.search('deezer.com') !== -1) {
                e.request.allow();
            }
        } else if (e.permission === 'fullscreen') {
            e.request.allow();
        } else if (e.permission === 'loadplugin') {
            if (e.request.identifier === 'adobe-flash-player') {
                e.request.allow();
            }
        }
    });
    webview.addEventListener('loadstart', function () {
        viewIsLoaded = false;
    });
    webview.addEventListener('loadstop', function () {
        viewIsLoaded = true;
    });
    webview.addEventListener('loadabort', function (e) { //open deezer app in chrome
        if (e.reason === 'ERR_UNKNOWN_URL_SCHEME' && e.url.search('dzr://') !== -1) {
            window.open(e.url);
        }
    });
    webview.addEventListener('newwindow', function (e) {
        e.preventDefault();
        if (e.targetUrl.search('accounts.google.com') !== -1) {
            document.querySelector('#dialog-title').innerHTML = 'Dialog Alert';
            document.querySelector('#dialog-cancel').style.display = 'none';
            document.querySelector('#dialog-content').innerHTML = 'Google sign-in not implemented!';
            document.querySelector('#dialog').showModal();
        } else if (e.targetUrl.search('facebook.com') !== -1) {
            document.querySelector('#dialog-title').innerHTML = 'Dialog Alert';
            document.querySelector('#dialog-cancel').style.display = 'none';
            document.querySelector('#dialog-content').innerHTML = 'Facebook sign-in not implemented!';
            document.querySelector('#dialog').showModal();
        } else {
            window.open(e.targetUrl);
        }
    });
    webview.addEventListener('dialog', function (e) {
        if (e.messageType === 'prompt') {
            console.error('prompt dialog not handled!');
            return;
        }

        document.querySelector('#dialog-title').innerHTML = 'Dialog ' + e.messageType;
        document.querySelector('#dialog-content').innerHTML = e.messageText;

        if (e.messageType === 'confirm') {
            document.querySelector('#dialog-cancel').style.display = 'inline';
        } else {
            document.querySelector('#dialog-cancel').style.display = 'none';
        }

        e.preventDefault();

        returnDialog = e.dialog;

        document.querySelector('#dialog').showModal();
    });

    var returnDialog = null;
    document.querySelector('#dialog').addEventListener('close', function () {
        if (returnDialog) {
            returnDialog.cancel();
            returnDialog = null;
        }
    });
    document.querySelector('#dialog-ok').addEventListener('click', function () {
        if (returnDialog) {
            returnDialog.ok();
            returnDialog = null;
        }
        document.querySelector('#dialog').close();
    });
    document.querySelector('#dialog-cancel').addEventListener('click', function () {
        if (returnDialog) {
            returnDialog.cancel();
            returnDialog = null;
        }
        document.querySelector('#dialog').close();
    });
};


chrome.commands.onCommand.addListener(function (command) {
    if (!viewIsLoaded) return;
    var webview = document.querySelector('#deezerview');

    switch (command) {
    case 'NEXT-MK':
        //NEXT_MK
        webview.executeScript({
            code: "Array.prototype.slice.call(document.querySelectorAll('#player_control_next,button.control-next')).forEach(function(el) { el.click(); });"
        });
        break;
    case 'PREV-MK':
        //PREV_MK
        webview.executeScript({
            code: "Array.prototype.slice.call(document.querySelectorAll('#player_control_prev,button.control-prev')).forEach(function(el) { el.click(); });"
        });
        break;
    case 'PLAY-PAUSE-MK':
        //PLAY_MK
        webview.executeScript({
            code: "if ( document.querySelectorAll('#player_control_play,button.control-play').length > 0 ) Array.prototype.slice.call(document.querySelectorAll('#player_control_play,button.control-play')).forEach(function(el) { el.click(); }); else Array.prototype.slice.call(document.querySelectorAll('#player_control_pause,button.control-pause')).forEach(function(el) { el.click(); });"
        });
        break;
    case 'STOP-MK':
        //STOP_MK
        webview.executeScript({
            code: "Array.prototype.slice.call(document.querySelectorAll('#player_control_pause,button.control-pause')).forEach(function(el) { el.click(); });"
        });
        break;
    case 'LIKE-MK':
        //LIKE_MK
        webview.executeScript({
            code: "document.querySelectorAll('a[role=\"button\"].evt-over.evt-out.action:not(.action-hide)') .forEach(function(el) { el.click(); })"
        });
        break;
    }
});
