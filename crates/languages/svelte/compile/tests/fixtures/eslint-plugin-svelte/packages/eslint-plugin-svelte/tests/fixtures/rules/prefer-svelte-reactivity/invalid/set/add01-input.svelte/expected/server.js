import * as $ from 'svelte/internal/server';

export default function Add01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Set([1, 2, 1, 3, 3]);

		variable.add(42);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}