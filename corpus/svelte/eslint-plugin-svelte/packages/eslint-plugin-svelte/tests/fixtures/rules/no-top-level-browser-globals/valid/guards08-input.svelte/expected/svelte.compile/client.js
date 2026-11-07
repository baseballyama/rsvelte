import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Guards08_input($$anchor) {
	console.log(typeof location !== 'undefined' && location.href);

	// console.log(typeof location === 'undefined' && location.href); // NG
	console.log(globalThis.location && location.href);

	// console.log(globalThis.location || location.href); // NG
	console.log(globalThis.location?.href);

	// console.log(globalThis.location.href); // NG
}