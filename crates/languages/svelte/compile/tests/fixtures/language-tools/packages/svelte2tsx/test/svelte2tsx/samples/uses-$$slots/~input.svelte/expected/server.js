import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$renderer.push(`<h1>${$.escape($$slots.foo)}</h1> <h1>${$.escape($$slots['dashed-name'])}</h1> <!--[-->`);
	$.slot($$renderer, $$props, 'foo', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'dashed-name', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}