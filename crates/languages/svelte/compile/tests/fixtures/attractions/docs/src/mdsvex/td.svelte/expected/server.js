import * as $ from 'svelte/internal/server';

export default function Td($$renderer, $$props) {
	$$renderer.push(`<td><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></td>`);
}