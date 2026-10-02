import * as $ from 'svelte/internal/server';
import { SvelteURLSearchParams as URLSearchParams } from "svelte/reactivity";

export default function Aliased_url_search_params01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URLSearchParams("foo=1&bar=2");

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}