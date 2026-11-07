import * as $ from 'svelte/internal/server';

function foo($$renderer, a, b) {
	$$renderer.push(`<!---->Hello world ${$.escape(a + b)}`);
}

export { foo };

export default function Child($$renderer) {}