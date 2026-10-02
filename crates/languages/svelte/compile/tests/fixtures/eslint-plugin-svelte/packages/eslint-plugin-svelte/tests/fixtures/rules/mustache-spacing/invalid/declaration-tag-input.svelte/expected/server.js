import * as $ from 'svelte/internal/server';

export default function Declaration_tag_input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(boxes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let box = each_array[$$index];
		let area = box.width * box.height;
	}

	$$renderer.push(`<!--]-->`);
}