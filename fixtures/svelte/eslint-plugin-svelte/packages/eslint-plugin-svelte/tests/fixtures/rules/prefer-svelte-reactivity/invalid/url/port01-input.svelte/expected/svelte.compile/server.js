import * as $ from 'svelte/internal/server';

export default function Port01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.port = "80";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}