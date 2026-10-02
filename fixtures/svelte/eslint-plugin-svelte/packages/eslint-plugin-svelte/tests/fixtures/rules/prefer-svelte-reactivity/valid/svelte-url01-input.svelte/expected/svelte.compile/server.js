import * as $ from 'svelte/internal/server';
import { SvelteURL } from "svelte/reactivity";

export default function Svelte_url01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new SvelteURL("https://svelte.dev/");

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}