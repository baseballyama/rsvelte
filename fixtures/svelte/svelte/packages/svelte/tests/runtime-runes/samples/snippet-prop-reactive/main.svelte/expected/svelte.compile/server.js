import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';

function foo($$renderer) {
	$$renderer.push(`<p>foo</p>`);
}

function bar($$renderer) {
	$$renderer.push(`<p>bar</p>`);
}

export default function Main($$renderer) {
	let show_foo = true;

	Inner($$renderer, { snippet: show_foo ? foo : bar });
	$$renderer.push(`<!----> <button>show bar</button>`);
}