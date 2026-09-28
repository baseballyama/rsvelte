import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { labelKey, valueKey, options } = $$props;

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(options);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { [labelKey]: label, [valueKey]: value } = each_array[$$index];

		$$renderer.push(`<p>${$.escape(label)}: ${$.escape(value)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}