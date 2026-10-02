import * as $ from 'svelte/internal/server';

export default function Host01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.host = "example.test";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}