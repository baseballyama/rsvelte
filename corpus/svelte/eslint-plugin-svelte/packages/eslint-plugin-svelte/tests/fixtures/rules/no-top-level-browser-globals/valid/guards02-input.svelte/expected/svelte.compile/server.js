import * as $ from 'svelte/internal/server';

export default function Guards02_input($$renderer) {
	if (globalThis.window) {
		console.log(location.href);
	} else {
		// console.log(location.href); // NG
	}

	if (globalThis.document) {
		console.log(location.href);
	} else {
		// console.log(location.href); // NG
	}

	if (globalThis.location) {
		console.log(location.href);
	} else {
		// console.log(location.href); // NG
	}

	if (!globalThis.location) {
		// console.log(location.href); // NG
	} else {
		console.log(location.href);
	}
}