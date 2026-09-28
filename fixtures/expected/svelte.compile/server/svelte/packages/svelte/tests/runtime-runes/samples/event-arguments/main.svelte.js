import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function increment() {
		count += arguments.length;
	}

	$$renderer.push(`<button>${$.escape(count)}</button>`);
}