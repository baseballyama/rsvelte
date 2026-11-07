import * as $ from 'svelte/internal/server';

export default function Two($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'b', {}, null);
	$$renderer.push(`<!--]-->`);
}