import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(list);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let item = each_array[index];

		$$renderer.push(`<li>${$.escape(item)}</li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(list);

	for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
		let item = each_array_1[index];

		$$renderer.push(`<li>${$.escape(item)}</li>`);
	}

	$$renderer.push(`<!--]-->`);
}