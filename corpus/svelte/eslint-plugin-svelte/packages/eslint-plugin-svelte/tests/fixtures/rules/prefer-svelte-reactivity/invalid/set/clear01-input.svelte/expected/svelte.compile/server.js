import * as $ from 'svelte/internal/server';

export default function Clear01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Set([1, 2, 1, 3, 3]);

		variable.clear();
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}