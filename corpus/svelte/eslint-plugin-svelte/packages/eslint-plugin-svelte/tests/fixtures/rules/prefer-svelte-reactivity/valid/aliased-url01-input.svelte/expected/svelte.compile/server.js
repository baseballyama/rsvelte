import * as $ from 'svelte/internal/server';
import { SvelteURL as URL } from "svelte/reactivity";

export default function Aliased_url01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}