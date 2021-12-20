(() => {
	const update = document.getElementById('update');
	const status = document.getElementById('status');
	const updateStatus = () => {
		update.setAttribute('busy', 'busy');
		status.innerHTML = '';
		const addStatus = html => {
			if (status.innerHTML === '') status.innerHTML += `<div class="status-title">Status Report: ${(new Date()).toLocaleString()}</div>`;
			status.innerHTML += `<div class="status-text">${html}</div>`;
		};
		const done = () => {
			update.removeAttribute('busy');
		};
		chrome.tabs.query({url: 'https://*.youtube.com/*'}, function(tabs){
			const len = tabs.length;
			if (!len){
				addStatus('Youtube tabs not found.');
				return done();
			}
			tabs.forEach((tab, index) => {
				chrome.tabs.sendMessage(tab.id, {text: 'report_status'}, status => {
					addStatus(status);
					if (index === (len - 1)) return done();
				});
			});
		});
	};
	update.addEventListener('click', e => {
		e.preventDefault();
		if (update.hasAttribute('busy')) return;
		updateStatus();
	}, false);
	setTimeout(() => updateStatus(), 500);
})();