import * as $ from 'svelte/internal/server';

export function foo() {
	return 42;
}

export default function Foo($$renderer) {
	$$renderer.push(`<button>foo</button>`);
}