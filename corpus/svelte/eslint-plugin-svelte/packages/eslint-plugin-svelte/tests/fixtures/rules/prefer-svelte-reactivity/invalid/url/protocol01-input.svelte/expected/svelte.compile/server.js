import * as $ from 'svelte/internal/server';

export default function Protocol01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.protocol = "https";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}