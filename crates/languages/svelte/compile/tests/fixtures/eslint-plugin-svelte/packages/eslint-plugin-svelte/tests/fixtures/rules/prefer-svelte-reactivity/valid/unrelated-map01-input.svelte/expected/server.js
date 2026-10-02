import * as $ from 'svelte/internal/server';
import { Map } from "package";

export default function Unrelated_map01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Map([[1, "one"], [2, "two"]]);

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}