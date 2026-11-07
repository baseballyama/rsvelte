import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let b = 7;

	$$renderer.push(`<div><!--[-->`);

	$.slot($$renderer, $$props, 'default', { a: b, b, c: 'b', d: 'a7', e: b }, () => {
		$$renderer.push(`Hello`);
	});

	$$renderer.push(`<!--]--></div>`);
}