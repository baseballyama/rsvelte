import * as $ from 'svelte/internal/server';

export default function Arrow_with_params_input($$renderer) {
	let a = 1;
	const foo = $.derived((x) => x + a);

	$$renderer.push(`<!---->${$.escape(foo())}`);
}