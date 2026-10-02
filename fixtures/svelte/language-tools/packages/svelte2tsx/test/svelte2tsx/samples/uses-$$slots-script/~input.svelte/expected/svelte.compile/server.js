import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);
	let name = $$slots.foo;
	let dashedName = $$slots['dashed-name'];

	$$renderer.push(`<h1>${$.escape(name)}</h1> <!--[-->`);
	$.slot($$renderer, $$props, 'foo', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'dashed-name', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}