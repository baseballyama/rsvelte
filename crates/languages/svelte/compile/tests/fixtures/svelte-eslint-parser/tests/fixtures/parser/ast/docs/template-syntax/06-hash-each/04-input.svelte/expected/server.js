import * as $ from 'svelte/internal/server';

export default function _4_input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<li>${$.escape(item.name)} x ${$.escape(item.qty)}</li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(items);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let item = each_array_1[i];

		$$renderer.push(`<li>${$.escape(i + 1)}: ${$.escape(item.name)} x ${$.escape(item.qty)}</li>`);
	}

	$$renderer.push(`<!--]-->`);
}