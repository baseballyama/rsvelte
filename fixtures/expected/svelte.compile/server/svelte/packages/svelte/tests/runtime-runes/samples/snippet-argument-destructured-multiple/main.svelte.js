import * as $ from 'svelte/internal/server';

function foo($$renderer, { count }, { doubled }) {
	$$renderer.push(`<p>clicks: ${$.escape(count)}, doubled: ${$.escape(doubled)}</p>`);
}

export default function Main($$renderer) {
	let count = 0;
	let doubled = $.derived(() => count * 2);

	foo($$renderer, { count }, { doubled: doubled() });
	$$renderer.push(`<!----> <button>click me</button>`);
}