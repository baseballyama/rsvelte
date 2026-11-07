import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<!--[-->`);

		$.slot($$renderer, $$props, 'default', { a: item }, () => {
			$$renderer.push(`Hello`);
		});

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(items2);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let { a } = each_array_1[$$index_1];

		$$renderer.push(`<!--[-->`);

		$.slot($$renderer, $$props, 'second', { a }, () => {
			$$renderer.push(`Hello`);
		});

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}