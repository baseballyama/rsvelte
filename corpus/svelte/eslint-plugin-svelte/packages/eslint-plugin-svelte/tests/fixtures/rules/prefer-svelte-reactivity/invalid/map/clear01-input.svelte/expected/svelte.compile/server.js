import * as $ from 'svelte/internal/server';

export default function Clear01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Map([[1, "one"], [2, "two"]]);

		variable.clear();
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}