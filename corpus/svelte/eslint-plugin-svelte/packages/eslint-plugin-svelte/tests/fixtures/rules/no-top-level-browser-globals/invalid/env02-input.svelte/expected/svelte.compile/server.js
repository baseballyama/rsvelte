import * as $ from 'svelte/internal/server';
import { BROWSER } from 'esm-env';
import * as env from 'esm-env';

export default function Env02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (BROWSER) {
			console.log(location.href);
		} else {
			console.log(location.href); // NG
		}

		if (env.BROWSER) {
			console.log(location.href);
		} else {
			console.log(location.href); // NG
		}
	});
}