import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	let value = { value: "" };
	let checked = { value: false };

	$$renderer.push(`<input type="text"${$.attr('value', value.value)}/> <textarea>`);

	const $$body = $.escape(value.value);

	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}

	$$renderer.push(`</textarea> <input type="checkbox"${$.attr('checked', checked.value, true)}/> <button>${$.escape(count)}</button>`);
}