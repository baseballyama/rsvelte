import * as $ from 'svelte/internal/server';

function foo($$renderer, msg) {
	$$renderer.push(`<p>${$.escape(msg)}</p>`);
}

export default function Ts_snippet01_input($$renderer) {
	let msg = "";

	foo($$renderer, msg);
}