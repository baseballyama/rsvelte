import * as $ from 'svelte/internal/server';

export default function Guards08_input($$renderer) {
	console.log(typeof location !== 'undefined' && location.href);
	console.log(typeof location === 'undefined' && location.href); // NG
	console.log(globalThis.location && location.href);
	console.log(globalThis.location || location.href); // NG
	console.log(globalThis.location?.href);
	console.log(globalThis.location.href); // NG
}