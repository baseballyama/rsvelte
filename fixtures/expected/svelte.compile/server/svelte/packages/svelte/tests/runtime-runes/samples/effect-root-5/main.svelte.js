import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let obj = { count: 0 };

		$$renderer.push(`<button>+1</button> <button>null</button>`);
	});
}