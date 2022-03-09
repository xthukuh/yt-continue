import { addListener, sendMessage } from './utils-chrome.js';
import log from './utils-log.js';

(() => {
	
	//onMessage
	addListener('extension', 'onMessage', (request, sender, sendResponse) => {
		log('info', 'onMessage', {request, sender, sendResponse});
		sendResponse();
	}, 'background.js');

	//...
})();