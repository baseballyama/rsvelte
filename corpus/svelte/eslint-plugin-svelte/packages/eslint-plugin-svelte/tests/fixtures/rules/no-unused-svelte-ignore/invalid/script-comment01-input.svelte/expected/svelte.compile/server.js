import * as $ from 'svelte/internal/server';

export default function Script_comment01_input($$renderer, $$props) {
	let count = 0;
	let doubled = $.derived(() => count * 2);

	// svelte-ignore static-state-reference
	console.log(count);

	function fn() {
		// svelte-ignore static-state-reference
		console.log(doubled());
	}

	$.bind_props($$props, { fn });
}