import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import * as env from '$app/environment';

export default function Env01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (browser) {
			console.log(location.href);
		} else {
			console.log(location.href); // NG
		}

		if (env.browser) {
			console.log(location.href);
		} else {
			console.log(location.href); // NG
		}
	});
}