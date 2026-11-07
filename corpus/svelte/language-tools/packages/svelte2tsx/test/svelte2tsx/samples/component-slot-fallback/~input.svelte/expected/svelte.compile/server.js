import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<div>fallback content</div>`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'foo', { bar, baz: 'boo' }, () => {
		$$renderer.push(`<p>fallback</p>`);
	});

	$$renderer.push(`<!--]-->`);
}