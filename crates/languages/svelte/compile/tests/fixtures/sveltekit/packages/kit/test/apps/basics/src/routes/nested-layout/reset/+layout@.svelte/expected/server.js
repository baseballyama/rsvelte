import * as $ from 'svelte/internal/server';

export default function _layout_($$renderer, $$props) {
	$$renderer.push(`<h1>Layout reset</h1> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}