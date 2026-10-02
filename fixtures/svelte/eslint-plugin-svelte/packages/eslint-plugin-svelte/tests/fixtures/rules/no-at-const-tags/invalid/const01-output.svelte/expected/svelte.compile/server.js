import * as $ from 'svelte/internal/server';

export default function Const01_output($$renderer) {
	let boxes = [{ width: 10, height: 10 }, { width: 15, height: 15 }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(boxes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let box = each_array[$$index];
		const area = $.derived(() => box.width * box.height);

		$$renderer.push(`<!---->${$.escape(box.width)} * ${$.escape(box.height)} = ${$.escape(area())}`);
	}

	$$renderer.push(`<!--]-->`);
}