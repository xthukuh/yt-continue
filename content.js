(() => {
	embed(() => {
		const YTContinue = {
			title: null,
			dialog: null,
			time_started: null,
			time_stopped: null,
			time_checked: null,
			checks: 0,
			actions: 0,
			stop: null,
			timer: null,
			interval: currentCheckInterval,
			getTextNode: function(txt, parent, cs){
				parent = parent || document.body;
				let children = parent.childNodes, s = cs ? txt.trim() : txt.trim().toLowerCase();
				for (let i = 0; i < children.length; i ++){
					let node = children[i];
					if (node.nodeType === Node.TEXT_NODE){
						let text = node.textContent.trim();
						text = cs ? text : text.toLowerCase();
						if (text === s) return node;
					}
					else if (node.nodeType === Node.ELEMENT_NODE){
						let res = this.getTextNode(txt, node, cs);
						if (res) return res;
					}
				}
			},
			getParentBtn: function(node, selector, depth=0){
				let parent = node.parentNode, btn;
				if (btn = parent.querySelector(selector)) return {btn, parent};
				if ((depth = depth + 1) > 4) return;
				return this.getParentBtn(parent, selector, depth);
			},
			status: function(){
				let html = [], keys = [
					'title','time_started','time_stopped',
					'time_checked','interval','checks','actions'
				];
				keys.forEach(key => {
					let val = this[key];
					if (val === 0) val = '';
					else if (val instanceof Date) val = val.toLocaleString();
					else if (val instanceof Boolean) val = val ? 'true' : 'false';
					else if (val === null || val === undefined) val = '';
					if (val !== '') html.push(`<strong>${key}:</strong> ${val}`);
				});
				return html.join('<br>');
			},
			check: function(){
				this.checks += 1;
				this.time_checked = new Date();
				this.title = document.title;
				let el = this.getTextNode('Video paused. Continue watching?');
				if (el){
					let res = this.getParentBtn(el, '[role=button]');
					this.dialog = res.parent;
					res.btn.click();
					this.actions += 1;
				}
			},
			start: function(update){
				if (this.stop) this.stop(update);
				this.timer = setInterval(() => YTContinue.check(), this.interval);
				if (!update) this.time_started = new Date();
				this.stop = update => {
					clearInterval(this.timer);
					if (!update) this.time_stopped = new Date();
				};
			},
		};
		YTContinue.start();
		window.YTContinue = YTContinue;
		window.addEventListener('message', e => {
			if (e.source !== window) return;
			if (e.data.type === 'POST_GET'){
				if (e.data.text === 'report_status'){
					window.postMessage({type: 'POST_GET_RESULT', text: YTContinue.status()}, '*');
				}
				else if (e.data.text === 'change_interval' && e.data.interval){
					YTContinue.interval = e.data.interval;
					YTContinue.start(1);
					window.postMessage({type: 'POST_GET_RESULT', text: String(YTContinue.interval)}, '*');
				}
			}
		}, false);
	});
	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		if (['report_status', 'change_interval'].includes(msg.text)){
			if (msg.text === 'change_interval'){
				let interval = checkInterval(msg.interval);
				localStorage.setItem('check_interval', String(interval));
				msg.interval = interval;
			}
			postGet(msg).then(sendResponse);
			return true;
		}
	});
})();

function checkInterval(val){
	val = Number.isInteger(val) ? val : parseInt(val);
	return !isNaN(val) && val >= 500 ? val : 2000;
}

function embed(fn){
	let currentCheckInterval = checkInterval(localStorage.getItem('check_interval'));
	let text = `(${fn.toString()})();`.replace('currentCheckInterval', String(currentCheckInterval));
	const script = document.createElement('script');
	script.text = text;
	document.documentElement.appendChild(script);
}

function postGet(data, timeout=2000){
	return new Promise(resolve => {
		let resolved = 0, stopListener = () => {}, resolveValue = value => {
			if (resolved) return;
			resolved = 1;
			stopListener();
			return resolve(value);
		};
		const handleMessage = e => {
			if (e.source !== window) return;
			if (e.data.type === 'POST_GET_RESULT') resolveValue(e.data.text);
		};
		window.addEventListener('message', handleMessage, false);
		window.postMessage({...Object.assign({}, data), type: 'POST_GET'}, '*');
		let timer, stopTimer = () => {
			if (!timer) return;
			clearInterval(timer);
			timer = null;
		};
		timer = setTimeout(() => {
			timeout -= 500;
			if (timeout <= 0){
				stopTimer();
				resolveValue('Timeout');
			}
		}, 500);
		stopListener = () => {
			window.removeEventListener('message', handleMessage);
			stopTimer();
		};
	});
}