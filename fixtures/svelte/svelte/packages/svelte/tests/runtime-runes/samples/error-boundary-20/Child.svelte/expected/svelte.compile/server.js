import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let clicked = false;

		function increment() {
			clicked = true;
			count++;
		}

		$$renderer.push(`<button>${$.escape(count)}</button>`);
	});
}