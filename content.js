(() => {

	//to datetime
	const datetime = (date, notime=false) => {
		let d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date(date);
		if (!(d instanceof Date && !isNaN(d.getTime()))) throw new Error('Invalid timestamp date value.');
		let str = d.getFullYear()
		+ '-' + ('00' + (d.getMonth() + 1)).slice(-2)
		+ '-' + ('00' + (d.getDate() + 1)).slice(-2);
		if (!notime){
			str += ' ' + ('00' + d.getHours()).slice(-2)
			+ ':' + ('00' + d.getMinutes()).slice(-2)
			+ ':' + ('00' + d.getSeconds()).slice(-2);
		}
		return str;
	};
	
	//embed script
	const embed = fn => {
		const script = document.createElement('script');
		script.text = `(${fn.toString()})();`
		document.documentElement.appendChild(script);
	};

	//embed function
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
			interval: null,
			duration: 1000,
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
					'time_checked','checks','actions'
				];
				keys.forEach(key => {
					let val = this[key];
					if (val === 0) val = '';
					else if (val instanceof Date) val = datetime(val);
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
			start: function(){
				if (this.stop) this.stop();
				this.interval = setInterval(() => YTContinue.check(), this.duration);
				this.time_started = new Date();
				this.stop = () => {
					clearInterval(this.interval);
					this.interval = null;
					this.time_stopped = new Date();
				};
			},
		};
		YTContinue.start();
		window.YTContinue = YTContinue;
		window.addEventListener('message', e => {
			if (e.source !== window) return;
			if (e.data.type === 'POST_GET' && e.data.text === 'report_status'){
				window.postMessage({type: 'POST_GET_RESULT', text: YTContinue.status()}, '*');
			}
		}, false);
	});

	//post get
	const postGet = (text, timeout) => new Promise(resolve => {
		timeout = Number.isInteger(timeout) && timeout >= 500 ? timeout : 500;
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
		window.postMessage({type: 'POST_GET', text}, '*');
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
	
	//message listener - post get
	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		if (['report_status'].includes(msg.text)){
			postGet(msg.text).then(sendResponse);
			return true;
		}
	});
})();

