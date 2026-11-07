import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let c = { a: 0 };

		$$renderer.push(`<button>toggle</button>`);
	});
}