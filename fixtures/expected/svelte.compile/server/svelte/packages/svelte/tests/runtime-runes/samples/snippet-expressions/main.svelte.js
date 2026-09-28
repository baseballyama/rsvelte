import * as $ from 'svelte/internal/server';
import Child from './child.svelte';

function foo($$renderer) {
	$$renderer.push(`<p>foo</p>`);
}

function bar($$renderer) {
	$$renderer.push(`<p>bar</p>`);
}

export default function Main($$renderer) {
	let snippet = 'foo';
	let show = false;

	Child($$renderer, {
		snippets: { foo, bar },
		snippet,
		optional: show ? foo : undefined
	});

	$$renderer.push(`<!----> <button>toggle</button>`);
}