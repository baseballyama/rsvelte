import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let promise = new Promise((resolve) => resolve(10));

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like({ length: 3 });

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _ = each_array[i];

			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, 'default', { item: i }, null);
			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, promise, () => {}, (value) => {
			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, 'default', { value }, null);
			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<!--]-->`);
	});
}