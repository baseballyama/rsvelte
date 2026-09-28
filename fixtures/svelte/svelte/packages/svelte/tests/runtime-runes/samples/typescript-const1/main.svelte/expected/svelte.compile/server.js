import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const boxes = [{ width: 10, height: 10 }, { width: 20, height: 20 }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(boxes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let box = each_array[$$index];
		const area = box.width * box.height;
		const name = "{}";

		$$renderer.push(`<p>${$.escape(box.width)} * ${$.escape(box.height)} = ${$.escape(area)}</p> <p>{}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}