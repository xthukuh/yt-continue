//validate number keypress event
export default function validateNumberKeypress(event, prevent_negative=false, prevent_decimal=false){
	let key = event.key;
	let value = event.target.value;
	let value_chars = value.split('');
	value_chars.splice(event.target.selectionStart, (event.target.selectionEnd - event.target.selectionStart), key);
	let next = value_chars.join('');
	if (!prevent_negative && next === '-') return true;
	if (next.match(/\.$/)) next += '0';
	let num = Number(next);
	let is_valid = !(
		key === ' ' ||
		isNaN(num) ||
		(prevent_negative && num < 0) ||
		(prevent_decimal && key === '.')
	);
	if(is_valid) return true;
	event.preventDefault();
	return false;
}