(() => {
	const update = document.getElementById('update');
	const status = document.getElementById('status');
	const check_interval = document.getElementById('check_interval');
	
	let currentCheckInterval = checkInterval(localStorage.getItem('check_interval'));
	let updateStatus, updateInterval = interval => {
		interval = interval || currentCheckInterval;
		currentCheckInterval = interval;
		localStorage.setItem('check_interval', interval);
		tabsMessage({text: 'change_interval', interval}, () => updateStatus());
	};
	let intervalChange = e => {
		let value = e.target.value;
		let interval = checkInterval(value);
		if (value !== String(interval)) e.target.value = String(interval);
		if (interval !== currentCheckInterval) updateInterval(interval);
	};
	check_interval.value = String(currentCheckInterval);
	check_interval.addEventListener('keypress', e => keypressNumber(e, 1, 1));
	check_interval.addEventListener('change', intervalChange);
	check_interval.addEventListener('keydown', e => {
		if (e.key.toLowerCase() === 'enter'){
			e.preventDefault();
			intervalChange(e);
		}
	});

	updateStatus = () => {
		update.setAttribute('busy', 'busy');
		status.innerHTML = '';
		const addStatus = html => {
			if (status.innerHTML === '') status.innerHTML += `<div class="status-title">Status Report: ${(new Date()).toLocaleString()}</div>`;
			status.innerHTML += `<div class="status-text">${html}</div>`;
		};
		const done = () => {
			update.removeAttribute('busy');
		};
		tabsMessage({text: 'report_status'}, (status, {index, count}) => {
			addStatus(status);
			if (index === (count - 1)) done();
		}, () => {
			addStatus('Youtube tabs not found.');
			done();
		});
	};
	update.addEventListener('click', e => {
		e.preventDefault();
		if (update.hasAttribute('busy')) return;
		updateStatus();
	}, false);

	setTimeout(() => updateStatus(), 500);
})();

function tabsMessage(message, onResponse, noTabsCallback){
	forEachTab((tab, index, count, tabs) => {
		chrome.tabs.sendMessage(tab.id, message, result => {
			if ('function' === typeof onResponse) onResponse(result, {tab, index, count, tabs});
		});
	}, noTabsCallback);
}

function forEachTab(tabCallback, noTabsCallback){
	if ('function' !== typeof tabCallback) return;
	chrome.tabs.query({url: 'https://*.youtube.com/*'}, function(tabs){
		const count = tabs.length;
		if (!count){
			if ('function' === typeof noTabsCallback) noTabsCallback();
			return;
		}
		tabs.forEach((tab, index, arr) => tabCallback(tab, index, count, arr));
	});
}

function checkInterval(val){
	val = Number.isInteger(val) ? val : parseInt(val);
	return !isNaN(val) && val >= 500 ? val : 2000;
}

function keypressNumber(e, nonegative=false, nodecimal=false){
	let curval = e.target.value;
	let newchar = e.key;
	let curval_arr = curval.split('');
	curval_arr.splice(e.target.selectionStart, (e.target.selectionEnd - e.target.selectionStart), newchar);
	let newval = curval_arr.join('');
	if (!nonegative && newval === '-') return true;
	if (newval.match(/\.$/)) newval += '0';
	let num = Number(newval);
	if (newchar === ' ' || isNaN(num) || (nonegative && num < 0) || (nodecimal && newchar == '.')){
		e.preventDefault();
		return false;
	}
	return true;
}