import * as $ from 'svelte/internal/server';

export default function Li($$renderer, $$props) {
	$$renderer.push(`<li><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></li>`);
}