import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	function increment() {
		inc();
	}

	let inc;

	$.bind_props($$props, { increment });
}