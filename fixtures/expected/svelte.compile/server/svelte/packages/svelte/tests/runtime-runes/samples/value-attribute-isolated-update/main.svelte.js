import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	let value = "";
	let checked = false;

	$$renderer.push(`<input type="text"${$.attr('value', value)}/> <textarea>`);

	const $$body = $.escape(value);

	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}

	$$renderer.push(`</textarea> <input type="checkbox"${$.attr('checked', checked, true)}/> <button>${$.escape(count)}</button>`);
}