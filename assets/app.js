var viewIsLoaded = false;

window.onfocus = function () {
	focusTitlebars(true);
};

window.onblur = function () {
	focusTitlebars(false);
};

window.onresize = function () {
	updateContentStyle();
};

window.onload = function () {
	var webview = document.querySelector('#deezerview');
	var returnDialog = null;
	var dialog = document.querySelector('#dialog');

	addTitlebar("left-titlebar", "assets/icon_16.png", "Deezer Shortcut");

	webview.addEventListener('loadstart', function () {
		viewIsLoaded = false;
	});

	webview.addEventListener('loadstop', function () {
		viewIsLoaded = true;
	});

	var isLoaded = false;
	var loading = setTimeout(function () {
		webview.reload();
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

	webview.addEventListener('newwindow', function (e) {
		e.preventDefault();
		window.open(e.targetUrl);
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

		dialog.showModal();
	});

	dialog.addEventListener('close', function () {
		if (returnDialog) {
			returnDialog.cancel();
			returnDialog = null;
		}
	});

	document.querySelector('#dialog-ok').addEventListener('click', function () {
		returnDialog.ok();
		returnDialog = null;
		dialog.close();
	});

	document.querySelector('#dialog-cancel').addEventListener('click', function () {
		returnDialog.cancel();
		returnDialog = null;
		dialog.close();
	});
};

function deezerUnlimited() {
	if (!viewIsLoaded) return;
	var webview = document.querySelector('#deezerview');
	var source =
		"window.loadFacebox = function loadFacebox(page){console.log('no_pub');};" +
		"if(naboo)if(naboo.removeAds)naboo.removeAds();" +
		"if(stopAudioAdsTimer)stopAudioAdsTimer();" +
		"adsTimeoutId=-1;" +
		"if(dzPlayer)if(dzPlayer.logListenId)clearTimeout(dzPlayer.logListenId);" +
		"if(dzPlayer)if(dzPlayer.setForbiddenListen)dzPlayer.setForbiddenListen(false);" +
		"if(dzPlayer)if(dzPlayer.user_status && dzPlayer.user_status.ads_display)dzPlayer.user_status = '';" +
		"$('.area_picto_t-b').html('<span class=\\\"h_icn_timer sprite_head\\\"></span>');" +
		"$('#header_content_restriction_hovercard').hide();" + "$('#header_content_restriction .header_hovercard').html('');" +
		"$('#header_content_restriction .remaining').css('width','100%').css('background-color','#3995CD');" +
		"$('#header_content_restriction').unbind('mouseover').bind('mouseover', function(){$('.header_hovercard').show();});";

	webview.executeScript({
		code: "var script=document.createElement('script');script.textContent=\"" + source + "\";(document.head||document.documentElement).appendChild(script);script.parentNode.removeChild(script);"
	});
}

deezerUnlimited();
setInterval(deezerUnlimited, 5000);

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
