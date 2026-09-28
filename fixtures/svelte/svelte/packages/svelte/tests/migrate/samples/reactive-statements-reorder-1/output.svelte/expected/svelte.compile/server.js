import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	let width = 0;
	let mobile = $.derived(() => width < 640);
	let x = $.derived(() => !mobile());

	$$renderer.push(`<!---->NaN`);
}