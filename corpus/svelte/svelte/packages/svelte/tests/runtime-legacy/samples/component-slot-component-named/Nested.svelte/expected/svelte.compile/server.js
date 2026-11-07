import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'bar', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'foo', {}, null);
	$$renderer.push(`<!--]--></div>`);
}