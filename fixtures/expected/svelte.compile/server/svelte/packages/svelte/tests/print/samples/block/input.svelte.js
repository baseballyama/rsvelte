import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (condition) {
		$$renderer.push(`<!--[0-->yes`);
	} else {
		$$renderer.push(`<!--[-1-->no`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];

		$$renderer.push(`<p>${$.escape(i)}: ${$.escape(item)}</p>`);
	}

	$$renderer.push(`<!--]--> `);

	if (condition) {
		$$renderer.push(`<!--[0-->yes`);
	} else {
		$$renderer.push(`<!--[-1-->no`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(items);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let item = each_array_1[i];

		$$renderer.push(`<p>${$.escape(i)}: ${$.escape(item)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}