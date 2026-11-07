import * as $ from 'svelte/internal/server';

export default function Hash01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.hash = "anchor";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}