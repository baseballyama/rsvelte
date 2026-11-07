import * as $ from 'svelte/internal/server';

export default function Arrow_concise_input($$renderer) {
	let a = { b: 1 };
	const foo = $.derived(() => a.b);

	$$renderer.push(`<!---->${$.escape(foo())}`);
}