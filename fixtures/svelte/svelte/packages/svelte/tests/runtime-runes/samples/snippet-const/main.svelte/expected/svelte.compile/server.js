import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function counter($$renderer) {
		const doubled = count * 2;

		$$renderer.push(`<button>${$.escape(doubled)}</button>`);
	}

	counter($$renderer);
}