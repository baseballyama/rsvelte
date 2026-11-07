import * as $ from 'svelte/internal/server';

export default function Href01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.href = "https://svelte.dev/";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}