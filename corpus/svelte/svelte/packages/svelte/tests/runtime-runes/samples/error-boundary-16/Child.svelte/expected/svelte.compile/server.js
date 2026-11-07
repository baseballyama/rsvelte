import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		$$renderer.push(`<!---->${$.escape(count)} <button>+</button>`);
	});
}