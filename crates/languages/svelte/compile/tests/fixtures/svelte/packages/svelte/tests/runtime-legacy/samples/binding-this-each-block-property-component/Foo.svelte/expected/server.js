import * as $ from 'svelte/internal/server';

export default function Foo($$renderer, $$props) {
	function isFoo() {
		return true;
	}

	$$renderer.push(`<p><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></p>`);
	$.bind_props($$props, { isFoo });
}