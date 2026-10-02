import * as $ from 'svelte/internal/server';

export default function Search01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.search = "foo=bar";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}