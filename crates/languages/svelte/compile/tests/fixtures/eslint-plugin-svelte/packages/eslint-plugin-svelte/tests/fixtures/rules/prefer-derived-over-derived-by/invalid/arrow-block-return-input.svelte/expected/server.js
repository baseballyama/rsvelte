import * as $ from 'svelte/internal/server';

export default function Arrow_block_return_input($$renderer) {
	let a = { b: 1 };

	const foo = $.derived(() => {
		return a.b;
	});

	$$renderer.push(`<!---->${$.escape(foo())}`);
}