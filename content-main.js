import { addListener, sendMessage } from './utils-chrome.js';
import log from './utils-log.js';

(() => {
	
	//init
	log('debug', 'init - content-main.js');

	//TODO: embed...

	//onMessage
	/*
	addListener('runtime', 'onMessage', (request, sender, sendResponse) => {
		log('info', 'onMessage', {request, sender, sendResponse});
		sendResponse();
	}, 'content.js');
	*/

	//send - get content settings
	sendMessage('runtime', {type: 'get_content_settings'})
	.then(res => log('info', 'sendMessage - get_content_settings', {res}))
	.catch(err => log('error', err));

	//send - injected
	sendMessage('extension', {type: 'injected'})
	.then(res => log('info', 'sendMessage - injected', {res}))
	.catch(err => log('error', err));

	//...
})();