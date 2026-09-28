import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let a = 0, b = $.derived(() => a * 2);
	let c = 0;
	let d = $.derived(() => c * 2);
	let e = 0, f = e;

	$$renderer.push(`<!---->000000 <button>a</button>`);
}