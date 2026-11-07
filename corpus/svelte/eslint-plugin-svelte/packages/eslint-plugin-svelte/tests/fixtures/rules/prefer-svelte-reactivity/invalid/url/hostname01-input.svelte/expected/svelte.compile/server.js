import * as $ from 'svelte/internal/server';

export default function Hostname01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.hostname = "example.test";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}