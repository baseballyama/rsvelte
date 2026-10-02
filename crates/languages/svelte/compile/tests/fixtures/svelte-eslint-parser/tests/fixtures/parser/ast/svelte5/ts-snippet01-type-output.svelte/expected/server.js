import * as $ from 'svelte/internal/server';

function foo($$renderer, msg) {
	$$renderer.push(`<p>${$.escape(msg)}</p>`);
}

export default function Ts_snippet01_type_output($$renderer) {
	let msg = ""; // msg: string

	foo($$renderer, msg);
}