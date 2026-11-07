import * as $ from 'svelte/internal/server';
import { URL } from "package";

export default function Unrelated_url01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}