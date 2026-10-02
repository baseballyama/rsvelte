import * as $ from 'svelte/internal/server';
import { SvelteSet } from "svelte/reactivity";

export default function Svelte_set01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new SvelteSet([1, 2, 1, 3, 3]);

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}