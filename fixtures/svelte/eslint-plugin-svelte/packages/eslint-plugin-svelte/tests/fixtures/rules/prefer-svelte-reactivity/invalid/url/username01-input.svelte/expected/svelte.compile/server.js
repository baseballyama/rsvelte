import * as $ from 'svelte/internal/server';

export default function Username01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.username = "usr";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}