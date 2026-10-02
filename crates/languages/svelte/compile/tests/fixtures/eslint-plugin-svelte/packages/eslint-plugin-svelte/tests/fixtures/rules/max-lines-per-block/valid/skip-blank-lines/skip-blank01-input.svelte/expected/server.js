import * as $ from 'svelte/internal/server';

export default function Skip_blank01_input($$renderer) {
	let count = 0;

	function increment() {
		count++;
	}

	$$renderer.push(`<button>${$.escape(count)}</button>`);
}