import * as $ from 'svelte/internal/server';

export default function Foo($$renderer, $$props) {
	$$renderer.push(`<h1>Foo</h1> <!--[-->`);
	$.slot($$renderer, $$props, 'other', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}