var viewIsLoaded = false;
window.onload = function () {
    var webview = document.querySelector('#deezerview');
	var browserControl = new BrowserControl('#deezerview', webview.src);
	var titlebar = new TitleBar('left', true, browserControl);
	titlebar.add('assets/icon_16.png', 'Deezer Shortcut');

	var isLoaded = false;
	var loading = setTimeout(function () {
		document.querySelector('#deezerview').reload();
	}, 10000);

	webview.addEventListener('contentload', function () {
		if (loading) {
			clearTimeout(loading);
			loading = null;
		}
		if (!isLoaded) {
			isLoaded = true;
		}
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

	deezerUnlimited();
	setInterval(deezerUnlimited, 5000);
};

function deezerUnlimited() {
	if (!viewIsLoaded) return;
	var source =
		"window.loadFacebox = function loadFacebox(page){console.log('no_pub');};" +
		"if(typeof naboo !== 'undefined')if(naboo.removeAds)naboo.removeAds();" +
		"if(typeof stopAudioAdsTimer === 'function')stopAudioAdsTimer();" +
		"adsTimeoutId=-1;" +
		"if(typeof dzPlayer !== 'undefined')if(dzPlayer.logListenId)clearTimeout(dzPlayer.logListenId);" +
		"if(typeof dzPlayer !== 'undefined')if(dzPlayer.setForbiddenListen)dzPlayer.setForbiddenListen(false);" +
		"if(typeof dzPlayer !== 'undefined')if(dzPlayer.user_status && dzPlayer.user_status.ads_display)dzPlayer.user_status = '';" +
		"if(typeof $ !== 'undefined') { $('.area_picto_t-b').html('<span class=\\\"h_icn_timer sprite_head\\\"></span>'); }" +
		"if(typeof $ !== 'undefined') { $('#header_content_restriction_hovercard').hide();" + "$('#header_content_restriction .header_hovercard').html(''); }" +
		"if(typeof $ !== 'undefined') { $('#header_content_restriction .remaining').css('width','100%').css('background-color','#3995CD'); }" +
		"if(typeof $ !== 'undefined') { $('#header_content_restriction').unbind('mouseover').bind('mouseover', function(){$('.header_hovercard').show();}); }";

	document.querySelector('#deezerview').executeScript({
		code: "var script=document.createElement('script');script.textContent=\"" + source + "\";(document.head||document.documentElement).appendChild(script);script.parentNode.removeChild(script);"
	});
}

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
	}
});
