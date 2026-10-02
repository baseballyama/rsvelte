import * as $ from 'svelte/internal/server';

export default function Delete01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Map([[1, "one"], [2, "two"]]);

		variable.delete(1);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}