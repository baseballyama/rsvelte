import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	let doubled = $.derived(() => count * 2);

	$$renderer.push(`<button>${$.escape(count)} | ${$.escape(doubled())}</button>`);
}