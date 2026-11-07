import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	let toggle = false;

	$$renderer.push(`<h1>Hello world!</h1> <button>Toggle: ${$.escape(toggle)}</button>`);
}