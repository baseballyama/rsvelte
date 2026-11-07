import * as $ from 'svelte/internal/server';

export default function Append01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URLSearchParams("foo=1&bar=2");

		variable.append("baz", "3");
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}