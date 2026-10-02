import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	const boxes = [];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(boxes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let box = each_array[$$index];
		const area = box.width * box.height;

		$$renderer.push(`<!---->${$.escape(box.width)} * ${$.escape(box.height)} = ${$.escape(area)}`);
	}

	$$renderer.push(`<!--]-->`);
}