import * as $ from 'svelte/internal/server';

function foo($$renderer, n, doubled) {
	$$renderer.push(`<p>clicks: ${$.escape(n)}, doubled: ${$.escape(doubled)}</p>`);
}

export default function Main($$renderer) {
	let count = 0;
	let doubled = $.derived(() => count * 2);

	foo($$renderer, count, doubled());
	$$renderer.push(`<!----> <button>click me</button>`);
}