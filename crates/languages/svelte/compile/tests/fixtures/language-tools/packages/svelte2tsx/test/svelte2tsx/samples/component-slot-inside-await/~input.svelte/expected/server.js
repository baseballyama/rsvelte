import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$.await($$renderer, promise, () => {}, (value) => {
		$$renderer.push(`<!--[-->`);

		$.slot($$renderer, $$props, 'default', { a: value }, () => {
			$$renderer.push(`Hello`);
		});

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, promise2, () => {}, ({ b }) => {
		$$renderer.push(`<!--[-->`);

		$.slot($$renderer, $$props, 'second', { a: b }, () => {
			$$renderer.push(`Hello`);
		});

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(`<!--]-->`);
}