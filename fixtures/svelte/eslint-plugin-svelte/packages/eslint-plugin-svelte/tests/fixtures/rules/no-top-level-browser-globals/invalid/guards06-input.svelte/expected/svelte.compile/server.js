import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';

export default function Guards06_input($$renderer) {
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