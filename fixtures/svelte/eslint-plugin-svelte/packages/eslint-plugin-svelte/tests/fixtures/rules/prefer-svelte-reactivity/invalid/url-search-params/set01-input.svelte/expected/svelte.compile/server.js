import * as $ from 'svelte/internal/server';

export default function Set01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URLSearchParams("foo=1&bar=2");

		variable.set("foo", "-1");
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}