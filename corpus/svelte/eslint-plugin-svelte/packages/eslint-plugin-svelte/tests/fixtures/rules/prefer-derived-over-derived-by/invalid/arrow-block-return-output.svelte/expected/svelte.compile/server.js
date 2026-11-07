import * as $ from 'svelte/internal/server';

export default function Arrow_block_return_output($$renderer) {
	let a = { b: 1 };
	const foo = $.derived(() => a.b);

	$$renderer.push(`<!---->${$.escape(foo())}`);
}