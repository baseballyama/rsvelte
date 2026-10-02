import * as $ from 'svelte/internal/server';

function foo($$renderer, { count }) {
	$$renderer.push(`<p>clicks: ${$.escape(count)}</p>`);
}

export default function Main($$renderer) {
	let count = 0;

	foo($$renderer, { count });
	$$renderer.push(`<!----> <button>click me</button>`);
}