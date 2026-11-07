import * as $ from 'svelte/internal/server';

export default function Multi_statement_input($$renderer) {
	let a = { b: 1 };

	const foo = $.derived(() => {
		const c = a.b * 2;

		return c + 1;
	});

	$$renderer.push(`<!---->${$.escape(foo())}`);
}