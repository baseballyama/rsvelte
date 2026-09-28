import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	let fn = () => ({ n: count });

	let $$d = $.derived(fn),
		n = $.derived(() => $$d().n);

	$$renderer.push(`<button>clicks: ${$.escape(n())}</button>`);
}