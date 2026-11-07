import * as $ from 'svelte/internal/server';

export default function Sort01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URLSearchParams("foo=1&bar=2");

		variable.sort();
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}