import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = null;

		$$renderer.push(`<button>Click to create error</button> ${$.escape(String(value))}`);
	});
}