import * as $ from 'svelte/internal/server';

export default function Widget($$renderer) {
	$.await($$renderer, null, () => {}, () => {});
	$$renderer.push(`<!--]-->`);
}