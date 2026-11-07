import * as $ from 'svelte/internal/server';

export default function Ul($$renderer, $$props) {
	$$renderer.push(`<ul><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></ul>`);
}