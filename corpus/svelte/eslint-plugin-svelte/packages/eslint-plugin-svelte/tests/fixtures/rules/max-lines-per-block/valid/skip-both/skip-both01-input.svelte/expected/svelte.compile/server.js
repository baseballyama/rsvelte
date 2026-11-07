import * as $ from 'svelte/internal/server';

export default function Skip_both01_input($$renderer) {
	// Comment line 1
	// Comment line 2
	/* Block comment */
	let count = 0;

	function increment() {
		count++;
	}

	$$renderer.push(`<button class="svelte-459dj6">${$.escape(count)}</button>`);
}