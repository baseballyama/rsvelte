import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'foo', {}, () => {
		$$renderer.push(`fallback`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'bar', { foo, baz, leet: true }, () => {
		$$renderer.push(`fallback`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'bar', { foo, baz, leet: true }, () => {
		$$renderer.push(`fallback`);
	});

	$$renderer.push(`<!--]-->`);
}