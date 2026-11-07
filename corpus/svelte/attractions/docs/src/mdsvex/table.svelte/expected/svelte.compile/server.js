import * as $ from 'svelte/internal/server';

export default function Table($$renderer, $$props) {
	$$renderer.push(`<table><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></table>`);
}