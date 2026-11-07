import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Env03_input($$anchor, $$props) {
	$.push($$props, true);

	if (import.meta.env.SSR) {
		// console.log(location.href); // NG
	} else {
		console.log(location.href);
	}

	$.pop();
}