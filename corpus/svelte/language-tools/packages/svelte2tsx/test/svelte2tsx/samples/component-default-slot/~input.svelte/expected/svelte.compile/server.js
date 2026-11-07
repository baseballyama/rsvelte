import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let b = 7;

	$$renderer.push(`<div><!--[-->`);

	$.slot($$renderer, $$props, 'default', { a: b }, () => {
		$$renderer.push(`Hello`);
	});

	$$renderer.push(`<!--]--></div>`);
}