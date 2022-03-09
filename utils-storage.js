import log from './utils-log.js';
import { lastError } from './utils-chrome.js';

//get storage
export const getStorage = () => {

	//validation helpers
	const _is_obj = (o, k) => 'object' === typeof o && o && (k ? Object.keys(o).length : 1);
	const _is_str = o => 'string' === typeof o && o.trim().length;
	const _is_set = o => ![null, undefined, ''].includes(o);
	
	//storage helper
	const storage = {

		//get
		get: async keys => {
			
			//parse & validate keys
			let tmp = (Array.isArray(keys) ? keys : [keys]).filter(_is_str);
			log('debug', '> storage.get', {keys, tmp});
			if (tmp.length) keys = tmp;
			
			//failure
			else throw new Error(`${_is_set(keys) ? 'Invalid' : 'Undefined'} storage get keys.`);

			//keys value helper
			const _keys_val = o => {
				if (!_is_obj(o)) return;
				let val = keys.reduce((prev, curr) => {
					let res = {};
					if (_is_obj(prev)) res = prev;
					else if (_is_str(prev) && o.hasOwnProperty(prev)) res[prev] = o[prev];
					if (_is_str(curr) && o.hasOwnProperty(curr)) res[curr] = o[curr];
					return res;
				});
				if (Object.keys(val).length) return val;
			};

			//promise result
			return await new Promise((resolve, reject) => {
				try {
					
					//chrome storage sync get
					chrome.storage.sync.get(keys, items => {
						lastError('chrome.storage.sync.get', {keys, items});

						//set keys value
						let val = (Array.isArray(items) ? items : [items])
						.reduce((prev, curr) => {
							let res = [];
							if (Array.isArray(prev)) res.push(...prev);
							else res.push(prev);
							if (Array.isArray(curr)) res.push(...curr);
							else res.push(curr);
							return res;
						})
						.filter(_is_obj)
						.reduce((prev, curr) => Object.assign({}, _keys_val(prev), _keys_val(curr)));
						
						//success
						log('debug', '< storage.get', {val});
						return resolve(_is_obj(val, 1) ? val : null);
					});
				}
				catch (e){
					
					//failure
					return reject(`Chrome.storage.sync.get failure - ${e}`);
				}
			});
		},

		//set
		set: async data => {
			
			//validate data - failure
			log('debug', '> storage.set', {data});
			if (!_is_obj(data, 1)) throw new Error(`${_is_set(data) ? 'Invalid' : 'Undefined'} storage set data object.`);

			//promise result
			return await new Promise((resolve, reject) => {
				try {
					
					//chrome storage sync set
					chrome.storage.sync.set(data, () => {
						lastError('chrome.storage.sync.set', {data});

						//success
						log('debug', '< storage.set', {data});
						return resolve(data);
					});
				}
				catch (e){
					
					//failure
					return reject(`Chrome.storage.sync.set failure - ${e}`);
				}
			});
		},

		//remove
		remove: async keys => {
			
			//parse keys
			let tmp = (Array.isArray(keys) ? keys : [keys]).filter(_is_str);
			log('debug', '> storage.remove', {keys, tmp});
			
			//validate keys
			if (tmp.length) keys = tmp;
			else throw new Error(`${_is_set(keys) ? 'Invalid' : 'Undefined'} storage remove keys.`);

			//promise result
			return await new Promise((resolve, reject) => {
				try {
					
					//chrome storage sync remove
					chrome.storage.sync.remove(keys, () => {
						lastError('chrome.storage.sync.remove', {keys});

						//success
						log('debug', '< storage.remove', {keys});
						return resolve(keys);
					});
				}
				catch (e){
					
					//failure
					return reject(`Chrome.storage.sync.remove failure - ${e}`);
				}
			});
		},
	};

	//result
	return storage;
};

//storage
const Storage = getStorage();
export default Storage;