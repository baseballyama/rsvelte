import * as $ from 'svelte/internal/server';
import { SvelteDate as Date } from "svelte/reactivity";

export default function Aliased_date01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}