import * as $ from 'svelte/internal/server';

export default function Declaration_tag_input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(boxes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let box = each_array[$$index];
		const area = box.width * box.height;
		let label = `${area} square pixels`;

		$$renderer.push(`<p>${$.escape(format(doubled))} (${$.escape(label)})</p>`);
	}

	$$renderer.push(`<!--]-->`);
}