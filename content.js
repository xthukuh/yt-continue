(() => {
	
	//init
	console.debug('init - content.js');

	//embed main
	let path = 'content-main.js';
	const script = document.createElement('script');
	script.setAttribute('id', 'inject-content');
	script.setAttribute('type', 'module');
	// script.setAttribute('src', chrome.extension.getURL(path));
	script.setAttribute('src', chrome.runtime.getURL(path));
	const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
	head.insertBefore(script, head.lastChild);

	//runtime message listener
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		console.debug('> content - onMessage', {request, sender});
		sendResponse();
	});

	//runtime send message
	chrome.runtime.sendMessage({text: 'content_send_message'}, null, res => {
		console.debug('> content - sendMessage', {res});
	});

	//...
})();

// document.querySelector('head').appendChild(
//   Object.assign(document.createElement('script'), {
//     type: 'module',
//     src: chrome.runtime.getURL('./src/index.mjs'),
//   }),
// );