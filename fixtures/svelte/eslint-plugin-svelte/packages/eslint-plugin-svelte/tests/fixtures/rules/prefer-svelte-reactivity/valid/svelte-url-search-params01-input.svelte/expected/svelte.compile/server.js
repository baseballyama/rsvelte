import * as $ from 'svelte/internal/server';
import { SvelteURLSearchParams } from "svelte/reactivity";

export default function Svelte_url_search_params01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new SvelteURLSearchParams("foo=1&bar=2");

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}