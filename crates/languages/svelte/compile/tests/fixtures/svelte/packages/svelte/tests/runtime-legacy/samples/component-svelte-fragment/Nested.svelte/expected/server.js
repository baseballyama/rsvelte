import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<div>a: <!--[-->`);
	$.slot($$renderer, $$props, 'a', {}, null);
	$$renderer.push(`<!--]--></div> <div>b: <!--[-->`);
	$.slot($$renderer, $$props, 'b', {}, null);
	$$renderer.push(`<!--]--></div>`);
}