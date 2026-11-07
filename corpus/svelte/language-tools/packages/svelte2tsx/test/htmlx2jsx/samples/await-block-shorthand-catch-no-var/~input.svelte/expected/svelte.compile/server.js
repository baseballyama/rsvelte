import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await($$renderer, somePromise, () => {}, () => {});
	$$renderer.push(`<!--]-->`);
}