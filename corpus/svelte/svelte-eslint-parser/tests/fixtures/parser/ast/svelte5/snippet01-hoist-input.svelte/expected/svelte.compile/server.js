import * as $ from 'svelte/internal/server';

function foo($$renderer) {
	$$renderer.push(`<p>Hello World!</p>`);
}

export default function Snippet01_hoist_input($$renderer) {
	const bar = foo;

	bar($$renderer);
}