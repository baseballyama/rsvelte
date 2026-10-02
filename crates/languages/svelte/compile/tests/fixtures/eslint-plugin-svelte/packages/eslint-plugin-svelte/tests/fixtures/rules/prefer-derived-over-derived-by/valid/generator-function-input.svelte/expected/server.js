import * as $ from 'svelte/internal/server';

export default function Generator_function_input($$renderer) {
	let a = 1;

	const foo = $.derived(function* () {
		yield a;
	});

	$$renderer.push(`<!---->${$.escape(foo())}`);
}