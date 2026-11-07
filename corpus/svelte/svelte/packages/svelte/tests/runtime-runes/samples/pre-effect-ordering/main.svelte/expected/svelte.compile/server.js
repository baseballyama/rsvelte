import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		function increment() {
			count += 1;
		}

		$$renderer.push(`<button>Count: ${$.escape(count)}</button>`);
	});
}