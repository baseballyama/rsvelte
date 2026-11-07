import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let promise;

	$.await($$renderer, promise, () => {}, () => {});
	$$renderer.push(`<!--]-->`);
}