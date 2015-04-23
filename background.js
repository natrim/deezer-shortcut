chrome.app.runtime.onLaunched.addListener(function (launchData) {
	chrome.app.window.create(
		'browser.html', {
			id: 'mainDeezerWindow',
			frame: 'none',
			innerBounds: {
				width: 1350,
				height: 800,
				minWidth: 990,
				minHeight: 495
			}
		}
	);
});
