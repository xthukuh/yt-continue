import { LOG_TYPES, LOG_METHOD } from './utils-constants.js';

//allow log
export const allowLog = type => LOG_TYPES.includes('all') || type && LOG_TYPES.includes(type);

//log
export default function log(type, ...args){
	
	//set type
	let log_type, is_type = 0;
	if ('string' === typeof type) log_type = type.trim().toLowerCase();
	if (!log_type.match(/^[a-z]+$/)) log_type = null;
	else if (log_type === 'all'){
		is_type = 1;
		log_type = null;
	}

	//log allow
	if (!allowLog(log_type)) return;
	
	//set method
	let log_method;
	if (log_type && window.console.hasOwnProperty(log_type) && 'function' === typeof window.console[log_type]){
		log_method = window.console[log_type];
		is_type = 1;
	}
	else log_method = window.console[LOG_METHOD];

	//set params
	let params = [];
	if (!is_type) params.push(type);
	params.push(...args);

	//call method
	return log_method(...params);
}