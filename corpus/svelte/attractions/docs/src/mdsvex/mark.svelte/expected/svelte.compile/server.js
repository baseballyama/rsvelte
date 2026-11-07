import * as $ from 'svelte/internal/server';

export default function Mark($$renderer, $$props) {
	$$renderer.push(`<mark><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></mark>`);
}