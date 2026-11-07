import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let a = 1;
		let b = 1;
		let c = 1;

		function increment() {
			b += 1;
			c += 1;
			a += 1;
		}

		$$renderer.push(`<button>increment</button>`);
	});
}