import * as $ from 'svelte/internal/server';
import { Date } from "package";

export default function Unrelated_date01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}