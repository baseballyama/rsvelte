import * as $ from 'svelte/internal/server';

export default function Sub($$renderer, $$props) {
	let count = 0;

	function increment() {
		count += 1;
	}

	$$renderer.push(`<button>Count: ${$.escape(count)}</button>`);
	$.bind_props($$props, { increment });
}