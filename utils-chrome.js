import log from './utils-log.js';
import { URL_MATCHES } from './utils-constants.js';

//last error
export const lastError = (...args) => {
	let error = chrome.runtime.lastError;
	if (!error) return;
	log('warn', 'RuntimeLastError', error, ...args);
};

//query tabs
export const queryTabs = () => new Promise((resolve, reject) => {
	let abort = 0;
	let buffer = {};
	const complete = () => resolve(Object.keys(buffer).length ? buffer : null);
	try {

		//query matches
		let m_len = URL_MATCHES.length, m_last = m_len - 1;
		if (!m_len) return complete();
		for (let m = 0; m < m_len; m ++){

			//query tabs
			let url = URL_MATCHES[m];
			chrome.tabs.query({url}, tabs => {
				lastError('chrome.tabs.query', {url, tabs});

				//add tabs
				let t_len = tabs.length;
				for (let t = 0; t < t_len; t ++){

					//aborted
					if (abort) return;
					
					//buffer add tab
					let tab = tabs[t];
					let id = tab.id;
					if (!buffer.hasOwnProperty(id)) buffer[id] = {...tab, url_matches: []};
					if (!buffer[id].url_matches.includes(url)) buffer[id].url_matches.push(url);
				}
				if (m === m_last) return complete();
			});

			//aborted
			if (abort) return;
		}
	}
	catch (e){

		//failure
		abort = 1;
		return reject(`Chrome.tabs.query failure - ${e}`);
	}
});

//get uid
export const getUid = () => Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);

//send message
export const sendMessage = (type, arg1, arg2) => new Promise((resolve, reject) => {
	
	//send uid
	let uid = getUid();
	
	//send
	try {

		//validate type
		let tmp = 'string' === typeof type ? type.trim().toLowerCase() : null;
		log('debug', '> sendMessage', {uid, type, tmp, arg1, arg2});
		if (!(tmp && ['runtime', 'tabs', 'extension'].includes(tmp))) throw new Error('Invalid sendMessage type.');
		type = tmp;

		//send response
		const sendResponse = response => {
			lastError('sendResponse', {uid, type, tmp, arg1, arg2, response});
			
			//success
			log('debug', '< sendMessage', {uid, response});
			return resolve(response);
		};
		
		//send message
		chrome[type].sendMessage(arg1, arg2, sendResponse);
	}
	catch (e){
		
		//failure
		log('debug', '! sendMessage', {uid, e});
		return reject(`Chrome.tabs.query failure - ${e}`);
	}
});

//add listener
export const addListener = (event_type, event_name, event_handler, event_tag) => {
	
	//set params
	let params = {event_type, event_name, event_handler, event_tag};
	log('debug', '- addListener', params);
	event_type = 'string' === typeof event_type ? event_type.trim() : null;
	event_name = 'string' === typeof event_name ? event_name.trim() : null;
	event_handler = 'function' === typeof event_handler ? event_handler : null;
	event_tag = 'string' === typeof event_tag ? event_tag.trim() : null;
	params = {event_type, event_name, event_handler, event_tag};

	//error helper
	const _error = err => {
		log('error', `! addListener - ${err}`, params);
		throw new Error(err);
	};

	//validate event type - set type
	let err, type;
	if (!(
		event_type &&
		chrome.hasOwnProperty(event_type) &&
		'object' === typeof (type = chrome[event_type]) &&
		type
	)) return _error('Invalid addListener event type.');
		
	//validate event name - set event
	let event;
	if (!(
		event_name &&
		type.hasOwnProperty(event_name) &&
		'object' === typeof (event = type[event_name]) &&
		event &&
		event.hasOwnProperty('addListener') &&
		'function' === typeof event.addListener &&
		event.hasOwnProperty('removeListener') &&
		'function' === typeof event.removeListener
	)) return _error('Invalid addListener event name.');
	if ('function' !== typeof event_handler) log('warn', 'Invalid addListener event handler.', params);

	//set handler
	const handler = (...args) => {
		log('debug', '- addListener handle', {params, args});
		if ('function' === typeof event_handler) return event_handler(...args);
	};

	//add handler
	event.addListener(handler);

	//result - remove handler
	return () => event.removeListener(handler);
};

//activate tab
export const activateTab = id => new Promise((resolve, reject) => {
	try {
		
		//set options
		let options = {active: true, highlighted: true};
		
		//validate id
		let tmp = Number.isInteger(id) && id >= 1 ? id : null;
		log('debug', '> activateTab', {id, tmp, options});
		if (!tmp) throw new Error('Invalid activateTab Id.');
		else id = tmp;

		//chrome tabs update
		chrome.tabs.update(id, options, tab => {
			lastError('chrome.tabs.update', {id, options, tab});

			//success
			log('debug', '< activateTab', {id, options, tab});
			return resolve(tab);
		});
	}
	catch (e){
		
		//failure
		log('debug', '! activateTab', {uid, e});
		return reject(`Chrome.tabs.update failure - ${e}`);
	}
});