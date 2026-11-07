import * as $ from 'svelte/internal/server';

export default function Ts_each01_input($$renderer) {
	const list = [];
	const items = [];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(list);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let e = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(e)}`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(items);

	for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
		let item = each_array_1[index];

		$$renderer.push(`<!---->${$.escape(index)}${$.escape(item.name)}`);
	}

	$$renderer.push(`<!--]-->`);
}