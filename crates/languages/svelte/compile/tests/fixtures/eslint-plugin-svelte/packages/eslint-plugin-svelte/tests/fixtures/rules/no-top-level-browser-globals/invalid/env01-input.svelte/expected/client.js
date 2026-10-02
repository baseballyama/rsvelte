import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import * as env from '$app/environment';

export default function Env01_input($$anchor, $$props) {
	$.push($$props, true);

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

	$.pop();
}