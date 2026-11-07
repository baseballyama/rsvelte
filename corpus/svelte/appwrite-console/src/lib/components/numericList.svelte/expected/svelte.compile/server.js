import * as $ from 'svelte/internal/server';

export default function NumericList($$renderer, $$props) {
	$$renderer.push(`<ol class="numeric-list"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></ol>`);
}