import * as $ from 'svelte/internal/server';

export default function Await04_input($$renderer) {
	const p = Promise.resolve();

	$.await($$renderer, p, () => {}, (v) => {});
	$$renderer.push(`<!--]-->`);
}