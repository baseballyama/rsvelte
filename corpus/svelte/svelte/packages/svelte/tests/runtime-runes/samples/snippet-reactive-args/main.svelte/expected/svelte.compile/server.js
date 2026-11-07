import * as $ from 'svelte/internal/server';
import Inner from "./inner.svelte";

function foo($$renderer, { count }) {
	$$renderer.push(`<p>snippet: ${$.escape(count)}</p>`);
}

function bar($$renderer, props) {
	Inner($$renderer, $.spread_props([props]));
}

export default function Main($$renderer) {
	let count = 0;
	let show_foo = true;
	let snippet = $.derived(() => show_foo ? foo : bar);

	snippet()($$renderer, { count });
	$$renderer.push(`<!----> <button>toggle</button> <button>increase count</button>`);
}