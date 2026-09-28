import * as $ from 'svelte/internal/server';

export default function List($$renderer, $$props) {
	$$renderer.push(`<ul class="list"${$.attr_style('', { gap: '0.25rem' })}><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></ul>`);
}