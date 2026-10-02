import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let b = 7;
	let d = 5;
	let e = 5;

	$$renderer.push(`<div><!--[-->`);

	$.slot($$renderer, $$props, 'default', { a: b }, () => {
		$$renderer.push(`Hello`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'test', { c: d, e }, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'abc-cde.113', {}, null);
	$$renderer.push(`<!--]--></div>`);
}