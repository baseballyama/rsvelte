import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';

export default function Guards07_input($$anchor) {
	for (const x of []) {
		if (browser) {
			console.log(location.href);

			if (x) {
				continue;
			} else {
				break;
			}
		}

		// console.log(location.href); // NG
	}

	for (const x of []) {
		if (!browser) {
			// console.log(location.href); // NG
			if (x) {
				continue;
			} else {
				break;
			}
		}

		console.log(location.href);
	}
}