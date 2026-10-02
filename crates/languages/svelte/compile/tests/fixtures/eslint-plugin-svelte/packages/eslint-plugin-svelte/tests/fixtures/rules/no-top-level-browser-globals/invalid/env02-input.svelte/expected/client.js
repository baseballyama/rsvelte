import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BROWSER } from 'esm-env';
import * as env from 'esm-env';

export default function Env02_input($$anchor, $$props) {
	$.push($$props, true);

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

	$.pop();
}