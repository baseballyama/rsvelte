import * as $ from 'svelte/internal/server';

export default function Set01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Map([[1, "one"], [2, "two"]]);

		variable.set(1, "two");
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}