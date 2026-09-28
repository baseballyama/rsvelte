import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function increment() {
		count += 1;
	}

	$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
}