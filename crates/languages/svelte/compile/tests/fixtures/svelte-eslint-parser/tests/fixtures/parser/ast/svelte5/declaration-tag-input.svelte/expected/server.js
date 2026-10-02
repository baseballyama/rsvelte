import * as $ from 'svelte/internal/server';

export default function Declaration_tag_input($$renderer) {
	const boxes = [{ width: 10, height: 20 }, { width: 5, height: 5 }];

	function format(value) {
		return `${value} square pixels`;
	}

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(boxes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let box = each_array[$$index];
		const area = box.width * box.height;
		let label = `${area} square pixels`;

		$$renderer.push(`<p>${$.escape(format(area))} (${$.escape(label)})</p>`);
	}

	$$renderer.push(`<!--]-->`);
}