import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 'one';
		const registry = new Set();

		$$renderer.push(`<button>go</button>`);
	});
}