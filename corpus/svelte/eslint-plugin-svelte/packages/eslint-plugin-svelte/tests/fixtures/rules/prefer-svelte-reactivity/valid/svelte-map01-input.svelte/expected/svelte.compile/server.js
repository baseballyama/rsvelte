import * as $ from 'svelte/internal/server';
import { SvelteMap } from "svelte/reactivity";

export default function Svelte_map01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new SvelteMap([[1, "one"], [2, "two"]]);

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}