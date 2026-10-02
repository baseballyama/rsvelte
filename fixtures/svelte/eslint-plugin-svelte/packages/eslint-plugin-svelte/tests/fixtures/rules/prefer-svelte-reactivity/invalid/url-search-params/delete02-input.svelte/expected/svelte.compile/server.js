import * as $ from 'svelte/internal/server';

export default function Delete02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URLSearchParams("foo=1&bar=2");

		variable.delete("bar", "42");
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}