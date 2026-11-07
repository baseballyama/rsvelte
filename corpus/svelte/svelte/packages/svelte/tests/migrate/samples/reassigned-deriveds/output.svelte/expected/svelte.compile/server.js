import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	let name = 'world';
	let upper = $.derived(() => name.toUpperCase());

	$$renderer.push(`<input${$.attr('value', name)}/> <input${$.attr('value', upper())}/> ${$.escape(upper())}`);
}