import * as $ from 'svelte/internal/server';

export default function Conditional_return_input($$renderer) {
	let a = { b: 1 };

	const foo = $.derived(() => {
		if (a.b > 0) {
			return a.b;
		}

		return 0;
	});

	$$renderer.push(`<!---->${$.escape(foo())}`);
}