import * as $ from 'svelte/internal/server';

export default function Guards04_input($$renderer) {
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