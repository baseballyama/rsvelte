import * as $ from 'svelte/internal/server';
import { SvelteSet as Set } from "svelte/reactivity";

export default function Aliased_set01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Set([1, 2, 1, 3, 3]);

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}