import * as $ from 'svelte/internal/server';

function foo($$renderer) {
	$$renderer.push(`<p>Hello World!</p>`);
}

export default function Ts_snippet_hoist_scope_input($$renderer) {
	const bar = foo;

	bar($$renderer);
}