import * as $ from 'svelte/internal/server';

export default function Function_expression_return_input($$renderer) {
	let a = { b: 1 };

	const foo = $.derived(function () {
		return a.b;
	});

	$$renderer.push(`<!---->${$.escape(foo())}`);
}