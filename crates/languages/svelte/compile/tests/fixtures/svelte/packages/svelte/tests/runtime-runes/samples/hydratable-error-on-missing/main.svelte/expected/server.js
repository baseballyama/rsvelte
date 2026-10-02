import * as $ from 'svelte/internal/server';
import { hydratable } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { environment } = $$props;
		let value;

		if (environment === 'server') {
			value = 'server';
		} else {
			value = hydratable('environment', () => environment);
		}

		$$renderer.push(`<p>The current environment is: ${$.escape(value)}</p>`);
	});
}