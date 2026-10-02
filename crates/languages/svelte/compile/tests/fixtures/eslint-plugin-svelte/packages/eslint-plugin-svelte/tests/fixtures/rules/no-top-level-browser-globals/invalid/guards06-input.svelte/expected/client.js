import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';

export default function Guards06_input($$anchor) {
	for (const x of []) {
		if (browser) {
			console.log(location.href);

			continue;
		}

		console.log(location.href); // NG
	}

	for (const x of []) {
		if (!browser) {
			console.log(location.href); // NG

			continue;
		}

		console.log(location.href);
	}
}