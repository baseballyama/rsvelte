import * as $ from 'svelte/internal/server';

function foo($$renderer, n) {
	$$renderer.push(`<p>clicks: ${$.escape(n)}</p>`);
}

export default function Main($$renderer) {
	let count = 0;

	foo($$renderer, count);
	$$renderer.push(`<!----> <button>click me</button>`);
}