import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.push(`<p><!--[-->`);
	$.slot($$renderer, $$props, 'default', { foo: 'foo' }, null);
	$$renderer.push(`<!--]--></p> <p><!--[-->`);
	$.slot($$renderer, $$props, 'named', { bar: 'bar' }, null);
	$$renderer.push(`<!--]--></p>`);
}