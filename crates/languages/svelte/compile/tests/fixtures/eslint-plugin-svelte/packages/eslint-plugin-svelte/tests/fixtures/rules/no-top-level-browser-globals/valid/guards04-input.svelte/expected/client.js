import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Guards04_input($$anchor) {
	if (globalThis.window instanceof Object) {
		console.log(location.href);
	} else {
		// console.log(location.href); // NG
	}

	if (globalThis.document instanceof Object) {
		console.log(location.href);
	} else {
		// console.log(location.href); // NG
	}

	if (globalThis.location instanceof Object) {
		console.log(location.href);
	} else {
		// console.log(location.href); // NG
	}
}