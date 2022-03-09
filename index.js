import { APP_VERSION, APP_TITLE, APP_DESCRIPTION } from './utils-constants.js';
import { addListener, sendMessage, queryTabs } from './utils-chrome.js';
import log from './utils-log.js';

(() => {
	
	//init
	log('debug', 'init - index.js');

	//set elements
	const AppTitle = document.getElementById('app-title');
	const AppVersion = document.getElementById('app-version');
	const AppDescription = document.getElementById('app-description');
	const AppStatus = document.getElementById('app-status');

	//init elements
	AppTitle.innerText = APP_TITLE;
	AppVersion.innerText = `v${APP_VERSION}`;
	AppDescription.innerText = APP_DESCRIPTION;
	
	//status helper
	const _status = txt => (AppStatus.innerText = txt);
	_status('Test...');

	//get settings
	sendMessage('runtime', {type: 'get_settings'})
	.then(res => log('info', 'sendMessage - get_settings', {res}))
	.catch(err => log('error', err));

	//query tabs
	queryTabs()
	.then(res => {
		if (!res) return;
		Object.values(res).forEach(tab => {
			sendMessage('tabs', tab.id, {type: 'get_tab_info'})
			.then(res => log('info', 'sendMessage - get_tab_info', {res}))
			.catch(err => log('error', err));
		});
	})
	.catch(err => log('error', err));

	//tab - on activated
	addListener('tabs', 'onActivated', (...args) => {
		log('info', 'onActivated', {args});
	}, 'index.js');

	//...
})();