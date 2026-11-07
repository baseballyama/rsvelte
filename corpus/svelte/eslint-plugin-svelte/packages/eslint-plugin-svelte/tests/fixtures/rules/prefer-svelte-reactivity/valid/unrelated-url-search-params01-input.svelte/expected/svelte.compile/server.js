import * as $ from 'svelte/internal/server';
import { URLSearchParams } from "package";

export default function Unrelated_url_search_params01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URLSearchParams("foo=1&bar=2");

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}