import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let tmp = {}, a = tmp.a;
	let b = $.derived(() => a.b);

	$$renderer.push(`<button>click me</button>`);
}