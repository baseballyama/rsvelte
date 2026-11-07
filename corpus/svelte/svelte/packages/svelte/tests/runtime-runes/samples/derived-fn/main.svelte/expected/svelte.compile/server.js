import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	let double = $.derived(() => count * 2);

	$$renderer.push(`<button>${$.escape(double())}</button>`);
}