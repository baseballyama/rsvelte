import * as $ from 'svelte/internal/server';

export default function Pathname01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.pathname = "tutorial";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}