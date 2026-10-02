import * as $ from 'svelte/internal/server';

export default function Foo($$renderer, $$props) {
	$$renderer.push(`<div>before</div> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}