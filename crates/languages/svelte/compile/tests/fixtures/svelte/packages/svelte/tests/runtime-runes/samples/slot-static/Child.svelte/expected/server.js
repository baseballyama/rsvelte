import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { message } = $$props;

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', { message }, null);
	$$renderer.push(`<!--]-->`);
}