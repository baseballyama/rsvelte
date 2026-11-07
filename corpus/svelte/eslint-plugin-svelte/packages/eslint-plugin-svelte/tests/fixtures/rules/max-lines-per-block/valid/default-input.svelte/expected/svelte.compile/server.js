import * as $ from 'svelte/internal/server';

export default function Default_input($$renderer) {
	let count = 0;

	function increment() {
		count++;
	}

	$$renderer.push(`<button class="svelte-1qqjdcz">Count: ${$.escape(count)}</button>`);
}