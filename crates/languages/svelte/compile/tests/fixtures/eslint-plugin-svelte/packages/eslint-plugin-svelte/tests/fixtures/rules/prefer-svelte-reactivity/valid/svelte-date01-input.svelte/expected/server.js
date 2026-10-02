import * as $ from 'svelte/internal/server';
import { SvelteDate } from "svelte/reactivity";

export default function Svelte_date01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new SvelteDate(8.64e15);

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}