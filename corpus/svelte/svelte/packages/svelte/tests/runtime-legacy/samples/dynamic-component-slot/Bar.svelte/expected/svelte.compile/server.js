import * as $ from 'svelte/internal/server';

export default function Bar($$renderer, $$props) {
	$$renderer.push(`<h1>Bar</h1> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'other', {}, null);
	$$renderer.push(`<!--]-->`);
}