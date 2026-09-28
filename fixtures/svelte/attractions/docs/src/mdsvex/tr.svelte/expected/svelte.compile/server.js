import * as $ from 'svelte/internal/server';

export default function Tr($$renderer, $$props) {
	$$renderer.push(`<tr><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></tr>`);
}