import * as $ from 'svelte/internal/server';

export default function Async_arrow_input($$renderer) {
	let a = 1;
	const foo = $.derived(async () => await Promise.resolve(a));

	$$renderer.push(`<!---->${$.escape(foo())}`);
}