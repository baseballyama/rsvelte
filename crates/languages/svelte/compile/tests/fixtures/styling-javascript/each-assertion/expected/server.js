import * as $ from 'svelte/internal/server';

export default function Each_assertion($$renderer) {
	const values = ["a", "b"];
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like(values);
	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let value = each_array[i];
		$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-ava0yx')}></p>`);
	}
	$$renderer.push(`<!--]-->`);
}
